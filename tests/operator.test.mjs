import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decideEvent,
  parseOperatorEvent,
  planLimits,
  SAMPLE_INGEST_TOKEN,
} from '../lib/operator.ts';
import { sampleOperatorDecisions } from '../lib/operator-sample.ts';
import { presentDeskItem, sampleDesk } from '../lib/desk.ts';
import { issueLicense, verifyLicense } from '../lib/license.ts';

const secret = 'daymark-test-license-secret';

test('a failed payment with a buyer and amount can fire once', () => {
  const event = parseOperatorEvent({
    source: 'stripe',
    type: 'charge.failed',
    occurredAt: '2026-09-03T16:12:00Z',
    email: 'sam@example.test',
    amountCents: 3800,
    productName: 'Undated weekly planner',
  });
  const first = decideEvent(event, { plan: 'starter' });
  assert.equal(first.action, 'fire');
  assert.equal(first.playbookId, 'failed-payment');
  assert.equal(first.zapFilter.continue, true);
  const second = decideEvent(event, {
    plan: 'starter',
    recent: [
      {
        fingerprint: first.fingerprint,
        action: 'fire',
        playbookId: 'failed-payment',
      },
    ],
  });
  assert.equal(second.action, 'suppress');
  assert.equal(second.zapFilter.continue, false);
});

test('missing email or amount stays inconclusive', () => {
  const noEmail = decideEvent(
    parseOperatorEvent({
      type: 'charge.failed',
      occurredAt: '2026-09-03T16:12:00Z',
      amountCents: 3800,
    }),
    { plan: 'starter' },
  );
  assert.equal(noEmail.action, 'inconclusive');
  const noAmount = decideEvent(
    parseOperatorEvent({
      type: 'charge.failed',
      occurredAt: '2026-09-03T16:12:00Z',
      email: 'sam@example.test',
    }),
    { plan: 'starter' },
  );
  assert.equal(noAmount.action, 'inconclusive');
});

test('high-value failures escalate instead of auto-recovering', () => {
  const decision = decideEvent(
    parseOperatorEvent({
      type: 'charge.failed',
      occurredAt: '2026-09-03T18:05:00Z',
      email: 'alex@example.test',
      amountCents: 24800,
    }),
    { plan: 'starter' },
  );
  assert.equal(decision.action, 'escalate');
  assert.match(decision.reason, /200/);
});

test('refunded purchases do not start onboarding', () => {
  const decision = decideEvent(
    parseOperatorEvent({
      type: 'checkout.session.completed',
      occurredAt: '2026-09-03T19:10:00Z',
      email: 'jordan@example.test',
      productName: 'Desk reset bundle',
      context: { refunded: true },
    }),
    { plan: 'starter' },
  );
  assert.equal(decision.action, 'hold');
});

test('starter holds operator playbooks instead of guessing', () => {
  const decision = decideEvent(
    parseOperatorEvent({
      type: 'charge.refunded',
      occurredAt: '2026-09-03T19:40:00Z',
      email: 'jordan@example.test',
      amountCents: 8400,
    }),
    { plan: 'starter' },
  );
  assert.equal(decision.action, 'hold');
  assert.equal(decision.upgradeRequired, true);
  assert.equal(decision.playbookId, 'refund-watch');
});

test('operator can fire a refund pause', () => {
  const decision = decideEvent(
    parseOperatorEvent({
      type: 'charge.refunded',
      occurredAt: '2026-09-03T19:40:00Z',
      email: 'jordan@example.test',
      amountCents: 8400,
    }),
    { plan: 'operator' },
  );
  assert.equal(decision.action, 'fire');
  assert.equal(decision.zapFilter.path, 'pause');
});

test('unknown event types stay unknown', () => {
  const decision = decideEvent(
    parseOperatorEvent({
      type: 'something.happened',
      occurredAt: '2026-09-03T20:00:00Z',
      email: 'unknown@example.test',
    }),
    { plan: 'operator' },
  );
  assert.equal(decision.action, 'inconclusive');
  assert.equal(decision.playbookId, null);
});

test('stale leads wait until hoursSince is real', () => {
  const fresh = decideEvent(
    parseOperatorEvent({
      type: 'form.submitted',
      occurredAt: '2026-09-03T10:00:00Z',
      email: 'lead@example.test',
    }),
    { plan: 'operator' },
  );
  assert.equal(fresh.action, 'hold');
  const ready = decideEvent(
    parseOperatorEvent({
      type: 'lead.stale',
      occurredAt: '2026-09-04T11:00:00Z',
      email: 'lead@example.test',
      context: { hoursSince: 25 },
    }),
    { plan: 'operator' },
  );
  assert.equal(ready.action, 'fire');
  const customer = decideEvent(
    parseOperatorEvent({
      type: 'lead.stale',
      occurredAt: '2026-09-04T11:00:00Z',
      email: 'lead@example.test',
      context: { hoursSince: 25, alreadyCustomer: true },
    }),
    { plan: 'operator' },
  );
  assert.equal(customer.action, 'suppress');
});

test('raw Stripe events are read without a Daymark envelope', () => {
  const event = parseOperatorEvent({
    id: 'evt_1',
    object: 'event',
    type: 'charge.failed',
    created: 1756911120,
    data: {
      object: {
        amount: 3800,
        currency: 'usd',
        receipt_email: 'sam@example.test',
        billing_details: { email: 'sam@example.test' },
      },
    },
  });
  assert.equal(event.rawKind, 'stripe');
  assert.equal(event.email, 'sam@example.test');
  assert.equal(event.amountCents, 3800);
  assert.equal(decideEvent(event, { plan: 'starter' }).action, 'fire');
});

test('the sample desk is people and next steps, not Zapier verbs', () => {
  const desk = sampleDesk();
  assert.equal(desk[0].label, 'Email once');
  assert.match(desk[0].headline, /Sam/);
  assert.match(desk[0].script, /once/);
  assert.equal(desk[1].bucket, 'skip');
  assert.equal(desk[2].label, 'Ask a person');
  assert.equal(desk[3].label, 'Send the welcome');
  assert.equal(desk[4].bucket, 'fix');
  const item = presentDeskItem({
    id: 'x',
    email: 'sam@example.test',
    amountCents: 3800,
    productName: 'Planner',
    decision: sampleOperatorDecisions()[0].decision,
  });
  assert.equal(item.bucket, 'do');
});

test('labeled sample tape stays internally consistent', () => {
  const rows = sampleOperatorDecisions();
  assert.equal(rows[0].decision.action, 'fire');
  assert.equal(rows[1].decision.action, 'suppress');
  assert.equal(rows[2].decision.action, 'escalate');
  assert.equal(rows[3].decision.action, 'fire');
  assert.equal(rows[4].decision.action, 'inconclusive');
  assert.equal(SAMPLE_INGEST_TOKEN, 'dm_sample');
  assert.deepEqual(planLimits.starter.playbooks, [
    'failed-payment',
    'new-buyer',
  ]);
});

test('licenses verify and expire without inventing a Whop account', async () => {
  const starter = await issueLicense(secret, 'starter');
  const ok = await verifyLicense(secret, starter.key);
  assert.equal(ok?.plan, 'starter');
  assert.equal(ok?.expiresAt, null);
  const operator = await issueLicense(secret, 'operator', {
    validDays: 1,
    now: new Date('2026-09-01T00:00:00Z'),
  });
  assert.equal(
    await verifyLicense(secret, operator.key, new Date('2026-09-02T00:00:01Z')),
    null,
  );
  assert.equal(await verifyLicense(secret, 'dm1.starter.0.nope.nope'), null);
});
