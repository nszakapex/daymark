import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const post = (body) =>
  fetch(base + '/api/sample-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
for (const [offerId, setup, marketConfirmed, status] of [
  ['planner', 'current', false, 'failed'],
  ['planner', 'corrected', false, 'passed'],
  ['desk', 'current', false, 'passed'],
  ['shipping', 'current', false, 'inconclusive'],
  ['shipping', 'current', true, 'passed'],
  ['planner', 'unavailable', false, 'inconclusive'],
]) {
  const response = await post({ offerId, setup, marketConfirmed });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await response.json()).status, status);
}
for (const body of [
  '{',
  null,
  { offerId: 'invalid', setup: 'current' },
  { offerId: 'planner', setup: 'invalid' },
  { offerId: 'planner', setup: 'current', marketConfirmed: 'yes' },
])
  assert.equal((await post(body)).status, 400);
assert.equal((await post('x'.repeat(1001))).status, 413);
assert.equal((await fetch(base + '/api/sample-check')).status, 405);
for (const path of [
  '/demo',
  '/sample-store?offer=planner&setup=current',
  '/sample-store?offer=planner&setup=corrected',
  '/sample-store?offer=shipping&setup=current&market=US',
]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200);
  assert.ok(
    /June Paper/i.test(await response.text()),
    'Sample business is present at ' + path,
  );
}
console.log('Campaign API boundaries and sample route checks passed.');
