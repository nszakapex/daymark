import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  reportFor,
  syntheticData,
  buildSyntheticData,
  aggregateReport,
  findingFor,
} from '../lib/demo-data.ts';
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
    assert.ok(
      Math.abs(
        report.googleCost * report.googleCustomers +
          report.metaCost * report.metaCustomers -
          report.spend,
      ) < 1e-8,
    );
    assert.ok(
      Math.abs(
        report.coverage -
          (100 * (report.totalCustomers - report.unknownCustomers)) /
            report.totalCustomers,
      ) < 1e-8,
    );
    assert.equal(
      report.weeks.reduce((sum, w) => sum + w.spendCents, 0),
      report.spendCents,
    );
    assert.equal(
      report.campaigns.reduce((sum, c) => sum + c.spendCents, 0),
      report.spendCents,
    );
    assert.equal(
      report.campaigns.reduce((sum, c) => sum + c.customers, 0),
      report.paidCustomers,
    );
    assert.equal(report.netSalesCents, report.salesCents - report.refundCents);
    assert.equal(
      report.paidOrders,
      report.totalCustomers + report.repeatOrders,
    );
    assert.equal(report.rows.length, report.paidOrders + report.excludedOrders);
  }
  assert.ok(reportFor('current').metaCost > reportFor('previous').metaCost);
  assert.ok(reportFor('current').unknownCustomers > 0);
});

test('the same input produces the same records and duplicate delivery never inflates a report', () => {
  assert.deepEqual(buildSyntheticData(), syntheticData);
  const repeated = structuredClone(syntheticData);
  repeated.orders.push(...structuredClone(syntheticData.orders));
  repeated.refunds.push(...structuredClone(syntheticData.refunds));
  repeated.adDays.push(...structuredClone(syntheticData.adDays));
  for (const period of ['current', 'previous'])
    assert.deepEqual(aggregateReport(repeated, period), reportFor(period));
  repeated.adDays.push({ ...syntheticData.adDays[0], spendCents: 99 });
  assert.throws(
    () => aggregateReport(repeated, 'current'),
    /Conflicting daily campaign record/,
  );
});

test('order-level accounting honors first purchase, date boundaries, lookback and refunds', () => {
  const order = (id, customerId, placedAt, overrides = {}) => ({
    id,
    customerId,
    placedAt,
    updatedAt: placedAt,
    status: 'paid',
    product: 'Test',
    quantity: 1,
    subtotalCents: 10000,
    discountCents: 1000,
    ...overrides,
  });
  const data = {
    orders: [
      order('historic', 'returner', '2026-07-01T12:00:00.000Z'),
      order('repeat', 'returner', '2026-08-08T12:00:00.000Z'),
      order('new', 'new', '2026-08-08T12:00:00.000Z'),
      order('boundary', 'boundary', '2026-08-07T00:00:00.000Z'),
      order('unknown', 'unknown', '2026-09-03T23:59:59.000Z'),
      order('canceled', 'canceled', '2026-08-09T12:00:00.000Z', {
        status: 'canceled',
      }),
      order('outside', 'outside', '2026-09-04T00:00:00.000Z'),
      order('late', 'late', '2026-09-03T12:00:00.000Z', {
        updatedAt: '2026-09-07T12:00:00.000Z',
      }),
    ],
    touchpoints: [
      {
        id: 'old',
        customerId: 'new',
        at: '2026-08-06T12:00:00.000Z',
        source: 'Meta',
        campaignId: 'meta-desks',
      },
      {
        id: 'last',
        customerId: 'new',
        at: '2026-08-08T11:00:00.000Z',
        source: 'Google',
        campaignId: 'google-planners',
      },
      {
        id: 'future',
        customerId: 'new',
        at: '2026-08-08T13:00:00.000Z',
        source: 'Meta',
        campaignId: 'meta-return',
      },
      {
        id: '28days',
        customerId: 'boundary',
        at: '2026-07-10T00:00:00.000Z',
        source: 'Meta',
        campaignId: 'meta-desks',
      },
      {
        id: 'expired',
        customerId: 'unknown',
        at: '2026-08-06T23:59:58.000Z',
        source: 'Meta',
        campaignId: 'meta-desks',
      },
    ],
    adDays: [
      {
        date: '2026-08-08',
        campaignId: 'google-planners',
        spendCents: 1234,
        clicks: 10,
        impressions: 100,
      },
    ],
    refunds: [
      {
        id: 'refund',
        orderId: 'new',
        at: '2026-09-05T12:00:00.000Z',
        amountCents: 9000,
        reason: 'Full return',
      },
      {
        id: 'future',
        orderId: 'repeat',
        at: '2026-09-07T12:00:00.000Z',
        amountCents: 500,
        reason: 'Later partial return',
      },
    ],
  };
  const report = aggregateReport(data, 'current');
  assert.equal(report.totalCustomers, 3);
  assert.equal(report.repeatOrders, 1);
  assert.equal(report.excludedOrders, 1);
  assert.equal(report.googleCustomers, 1);
  assert.equal(report.metaCustomers, 1);
  assert.equal(report.unknownCustomers, 1);
  assert.equal(
    report.rows.find((r) => r.id === 'new').campaignId,
    'google-planners',
  );
  assert.equal(
    report.rows.find((r) => r.id === 'unknown').missingReason,
    'Recorded visit is outside the 28-day window',
  );
  assert.equal(report.salesCents, 36000);
  assert.equal(report.refundCents, 9000);
  assert.equal(report.netSalesCents, 27000);
  assert.equal(report.spendCents, 1234);
  assert.equal(report.cost, 6.17);
});

test('empty, immature and insufficient data cannot create a budget warning', () => {
  const empty = aggregateReport(
    { orders: [], touchpoints: [], adDays: [], refunds: [] },
    'current',
  );
  assert.equal(empty.cost, null);
  assert.equal(empty.metaCost, null);
  assert.equal(empty.coverage, 0);
  assert.equal(findingFor(empty, reportFor('previous')).needsReview, false);
  assert.equal(
    findingFor(empty, reportFor('previous')).reason,
    'insufficient_data',
  );
  const immature = aggregateReport(
    syntheticData,
    'current',
    '2026-09-04T12:00:00.000Z',
  );
  assert.equal(
    findingFor(immature, reportFor('previous')).reason,
    'incomplete_period',
  );
  const finding = findingFor(reportFor('current'), reportFor('previous'));
  assert.equal(finding.needsReview, true);
  assert.equal(finding.extraCustomersToTarget, 12);
  assert.ok(finding.bestCaseMetaCost < 60);
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
