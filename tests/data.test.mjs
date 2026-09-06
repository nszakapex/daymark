import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reportFor } from '../lib/demo-data.ts';
import { validateProfile } from '../lib/profile.ts';

test('both sample periods reconcile without allocating unknown customers', () => {
  for (const period of ['current', 'previous']) {
    const report = reportFor(period);
    assert.equal(
      report.paidCustomers + report.otherCustomers + report.unknownCustomers,
      report.totalCustomers,
    );
    assert.equal(
      report.googleCustomers + report.metaCustomers,
      report.paidCustomers,
    );
    assert.equal(
      report.weeklyCustomers.reduce((total, count) => total + count, 0),
      report.paidCustomers,
    );
    assert.equal(report.cost, report.spend / report.paidCustomers);
    assert.equal(
      report.googleCost * report.googleCustomers +
        report.metaCost * report.metaCustomers,
      report.spend,
    );
    assert.equal(
      report.coverage,
      (100 * (report.totalCustomers - report.unknownCustomers)) /
        report.totalCustomers,
    );
  }
  assert.equal(
    reportFor('current').cost / reportFor('previous').cost - 1,
    0.25,
  );
});
test('profile validation drops client ownership fields and duplicate tools', () => {
  const input = {
    name: '  QA business  ',
    website: 'example.test',
    goal: 'reliable-data',
    tools: ['Meta Ads', 'Meta Ads'],
    contactAllowed: false,
    ownerId: 'someone-else',
  };
  const result = validateProfile(input);
  assert.equal(result.name, 'QA business');
  assert.equal(result.website, 'https://example.test/');
  assert.deepEqual(result.tools, ['Meta Ads']);
  assert.ok(!('ownerId' in result));
});
test('credential-bearing URLs and unknown preferences are rejected', () => {
  const input = {
    name: 'QA business',
    website: '',
    goal: 'reliable-data',
    tools: [],
    contactAllowed: false,
  };
  assert.throws(() =>
    validateProfile({ ...input, website: 'https://user:secret@example.test' }),
  );
  assert.throws(() => validateProfile({ ...input, goal: 'unrecognized' }));
  assert.throws(() => validateProfile({ ...input, contactAllowed: 'yes' }));
});
