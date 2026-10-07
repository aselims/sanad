import React, { useSyncExternalStore } from 'react';

/** Umami checks this localStorage key itself before every send. */
export const UMAMI_OPT_OUT_KEY = 'umami.disabled';
const CHANGE_EVENT = 'umami-optout-change';

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readOptedOut(): boolean {
  try {
    return localStorage.getItem(UMAMI_OPT_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Opt-out switch for the self-hosted Umami reach measurement. Umami loads for
 * every visitor (see index.html) and is not behind a consent banner; this key is
 * the whole mechanism and applies to this browser only.
 */
export function AnalyticsOptOut() {
  const optedOut = useSyncExternalStore(subscribe, readOptedOut, () => false);

  const toggle = () => {
    try {
      if (optedOut) localStorage.removeItem(UMAMI_OPT_OUT_KEY);
      else localStorage.setItem(UMAMI_OPT_OUT_KEY, '1');
    } catch {
      /* storage unavailable: nothing is stored either way */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <div
      className="not-prose flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 p-4"
      data-testid="analytics-optout"
    >
      <p className="text-sm text-gray-700" role="status" aria-live="polite">
        {optedOut
          ? 'You have opted out of usage measurement in this browser.'
          : 'Usage measurement is on in this browser.'}
      </p>
      <button
        type="button"
        onClick={toggle}
        data-testid="analytics-optout-toggle"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {optedOut ? 'Opt back in' : 'Opt out'}
      </button>
    </div>
  );
}
