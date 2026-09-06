import assert from 'node:assert/strict';

const origin = 'http://localhost:3000';
const signedIn = { Cookie: '__sites_local_auth=1' };
const fixture = {
  name: 'Daymark QA — fictional business',
  website: 'example.test',
  goal: 'reliable-data',
  tools: ['Meta Ads', 'Stripe'],
  contactAllowed: false,
};
const call = (path, options = {}) =>
  fetch(origin + path, { redirect: 'manual', ...options });
const save = (body, headers = {}) =>
  call('/api/workspace', {
    method: 'POST',
    headers: {
      ...signedIn,
      Origin: origin,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });

for (const path of ['/', '/demo', '/login', '/privacy']) {
  const result = await call(path);
  assert.equal(result.status, 200, path);
  assert.match(result.headers.get('content-type'), /text\/html/);
}
assert.equal(
  (await call('/api/workspace')).status,
  401,
  'anonymous API access',
);
assert.equal(
  (
    await call('/api/workspace', {
      headers: {
        'oai-authenticated-user-id': 'forged',
        'oai-authenticated-user-email': 'forged@example.test',
      },
    })
  ).status,
  401,
  'client cannot forge authentication',
);
const protectedPage = await call('/workspace');
assert.ok(
  [302, 303, 307].includes(protectedPage.status),
  'workspace redirects anonymous visitors',
);
assert.match(protectedPage.headers.get('location'), /signin-with-chatgpt/);
const first = await (
  await call('/api/workspace', { headers: signedIn })
).json();
assert.equal(
  first.profile,
  null,
  'smoke test requires an empty synthetic local account',
);
assert.equal(
  (await save(fixture, { Origin: 'https://foreign.example' })).status,
  403,
  'cross-origin writes',
);
assert.equal(
  (await save({ ...fixture, name: '' })).status,
  400,
  'invalid business name',
);
assert.equal(
  (await save({ ...fixture, website: 'javascript:alert(1)' })).status,
  400,
  'unsafe website',
);
assert.equal(
  (await save({ ...fixture, tools: ['unsupported-tool'] })).status,
  400,
  'unknown tool',
);
assert.equal(
  (await save({ ...fixture, extra: 'x'.repeat(4500) })).status,
  413,
  'oversized profile',
);
assert.equal(
  (await save(fixture, { 'Content-Type': 'text/plain' })).status,
  415,
  'unsupported request content type',
);

try {
  const created = await save({
    ...fixture,
    ownerId: 'cannot-select-another-owner',
  });
  assert.equal(created.status, 200, 'save profile');
  const saved = (await created.json()).profile;
  assert.equal(saved.website, 'https://example.test/');
  assert.equal(saved.contactAllowed, false);
  const read = await call('/api/workspace', { headers: signedIn });
  assert.equal(read.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(
    (await read.json()).profile,
    saved,
    'profile survives a separate request',
  );
  assert.equal(
    (await call('/workspace', { headers: signedIn })).status,
    200,
    'signed-in workspace renders',
  );
  const update = await save({
    ...fixture,
    name: 'Daymark QA updated',
    contactAllowed: true,
  });
  assert.equal(update.status, 200, 'update existing profile');
  assert.equal(
    (await (await call('/api/workspace', { headers: signedIn })).json()).profile
      .name,
    'Daymark QA updated',
  );
  assert.equal(
    (
      await call('/api/workspace', {
        method: 'DELETE',
        headers: { ...signedIn, Origin: 'https://foreign.example' },
      })
    ).status,
    403,
    'cross-origin deletion',
  );
} finally {
  const removed = await call('/api/workspace', {
    method: 'DELETE',
    headers: { ...signedIn, Origin: origin },
  });
  assert.equal(removed.status, 200, 'remove synthetic profile');
}
assert.equal(
  (await (await call('/api/workspace', { headers: signedIn })).json()).profile,
  null,
  'deletion persists',
);
console.log(
  'PASS: public routes, protected redirect, anonymous and forged-header rejection, origin checks, validation, save/read/update/delete, and private cache policy. Synthetic local profile removed.',
);
