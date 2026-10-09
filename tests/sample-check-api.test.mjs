import { test } from 'node:test';
import assert from 'node:assert/strict';
// Opt in after a Vercel build to exercise the emitted JavaScript import chain.
// The default test has no dependency on generated deployment artifacts.
const entrypoint = process.env.DAYMARK_TEST_COMPILED_API === '1'
  ? '../.vercel/output/functions/api/sample-check.func/api/sample-check.js'
  : '../api/sample-check.ts';
const { POST } = await import(new URL(entrypoint, import.meta.url).href);

// Import the public deployment entrypoint directly so its ESM import chain is
// exercised without Vite aliases, a running server, credentials, or a database.
function post(body) {
  return POST(new Request('https://daymark.example/api/sample-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }));
}

for (const [offerId, setup, marketConfirmed, expectedStatus] of [
  ['planner', 'current', false, 'failed'],
  ['planner', 'corrected', false, 'passed'],
  ['desk', 'current', false, 'passed'],
  ['shipping', 'current', false, 'inconclusive'],
  ['shipping', 'current', true, 'passed'],
  ['planner', 'unavailable', false, 'inconclusive'],
]) {
  test(`public API: ${offerId}/${setup}, market ${marketConfirmed} returns ${expectedStatus}`, async () => {
    const response = await post({ offerId, setup, marketConfirmed });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const result = await response.json();
    assert.equal(result.status, expectedStatus);
    assert.equal(result.offerId, offerId);
    assert.equal(result.setup, setup);
    assert.equal(result.marketConfirmed, marketConfirmed);
    assert.equal(result.mode, 'synthetic-store');
    assert.match(result.scope, /not a live browser/);
  });
}

for (const { name, body } of [
  { name: 'malformed JSON', body: '{' },
  { name: 'null body', body: null },
  { name: 'unknown offer', body: { offerId: 'unknown', setup: 'current' } },
  { name: 'unknown setup', body: { offerId: 'planner', setup: 'unknown' } },
  { name: 'nonboolean market', body: { offerId: 'shipping', setup: 'current', marketConfirmed: 'yes' } },
]) {
  test(`public API rejects ${name} without a cacheable result`, async () => {
    const response = await post(body);
    assert.equal(response.status, 400);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const result = await response.json();
    assert.equal(typeof result.error, 'string');
    assert.ok(result.error.length > 0);
    assert.equal(result.status, undefined);
  });
}

test('public API rejects a body over 1000 characters before parsing', async () => {
  const response = await post('x'.repeat(1001));
  assert.equal(response.status, 413);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await response.json()).error, 'Request too large.');
});
