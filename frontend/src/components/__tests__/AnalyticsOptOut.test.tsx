import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalyticsOptOut, UMAMI_OPT_OUT_KEY } from '../AnalyticsOptOut';

describe('AnalyticsOptOut', () => {
  afterEach(() => localStorage.clear());

  it('sets and clears umami.disabled and shows the current state', () => {
    render(<AnalyticsOptOut />);
    expect(screen.getByRole('status').textContent).toMatch(/is on/);

    fireEvent.click(screen.getByRole('button', { name: 'Opt out' }));
    expect(localStorage.getItem(UMAMI_OPT_OUT_KEY)).toBe('1');
    expect(screen.getByRole('status').textContent).toMatch(/opted out/);

    fireEvent.click(screen.getByRole('button', { name: 'Opt back in' }));
    expect(localStorage.getItem(UMAMI_OPT_OUT_KEY)).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/is on/);
  });

  it('starts opted out when the key is already set', () => {
    localStorage.setItem(UMAMI_OPT_OUT_KEY, '1');
    render(<AnalyticsOptOut />);
    expect(screen.getByRole('status').textContent).toMatch(/opted out/);
  });
});
