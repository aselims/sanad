import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import { createRateLimit } from '../rateLimit';

// Calls the middleware once for a fixed IP and path; true when it let the request through.
function hit(limiter: ReturnType<typeof createRateLimit>): boolean {
  let passed = false;
  const req = { ip: '203.0.113.7', path: '/same', route: { path: '/same' }, headers: {} } as unknown as Request;
  const res = {
    set: () => res,
    status: () => res,
    json: () => res,
  } as unknown as Response;
  limiter(req, res, () => {
    passed = true;
  });
  return passed;
}

test('two limiters on the same path keep separate counters', () => {
  const strict = createRateLimit({ name: 'strict', windowMs: 60_000, max: 1 });
  const generous = createRateLimit({ name: 'generous', windowMs: 60_000, max: 5 });

  assert.equal(hit(strict), true);
  assert.equal(hit(strict), false);
  // Spending the strict limiter's budget must not spend the generous one's.
  for (let i = 0; i < 5; i++) assert.equal(hit(generous), true, `generous hit ${i + 1}`);
  assert.equal(hit(generous), false);
});
