import {
  decideEvent,
  parseOperatorEvent,
  type NormalizedEvent,
  type OperatorDecision,
} from './operator.ts';

export type SampleOperatorCase = {
  id: string;
  title: string;
  label: string;
  body: Record<string, unknown>;
};

export const sampleOperatorCases: SampleOperatorCase[] = [
  {
    id: 'failed-planner',
    title: 'Failed first payment',
    label: 'Fictional sample',
    body: {
      source: 'stripe',
      type: 'charge.failed',
      occurredAt: '2026-09-03T16:12:00Z',
      email: 'sam@example.test',
      amountCents: 3800,
      productName: 'Undated weekly planner',
      idempotencyKey: 'sample-charge-failed-1',
    },
  },
  {
    id: 'duplicate-failure',
    title: 'Same failed payment, same hour',
    label: 'Fictional sample',
    body: {
      source: 'stripe',
      type: 'charge.failed',
      occurredAt: '2026-09-03T16:40:00Z',
      email: 'sam@example.test',
      amountCents: 3800,
      productName: 'Undated weekly planner',
      idempotencyKey: 'sample-charge-failed-2',
    },
  },
  {
    id: 'high-value',
    title: 'High-value failure',
    label: 'Fictional sample',
    body: {
      source: 'stripe',
      type: 'charge.failed',
      occurredAt: '2026-09-03T18:05:00Z',
      email: 'alex@example.test',
      amountCents: 24800,
      productName: 'The complete desk collection',
      idempotencyKey: 'sample-charge-failed-high',
    },
  },
  {
    id: 'new-buyer',
    title: 'Paid desk bundle',
    label: 'Fictional sample',
    body: {
      source: 'stripe',
      type: 'checkout.session.completed',
      occurredAt: '2026-09-03T19:10:00Z',
      email: 'jordan@example.test',
      amountCents: 8400,
      productId: 'desk-reset',
      productName: 'Desk reset bundle',
      idempotencyKey: 'sample-checkout-1',
    },
  },
  {
    id: 'unknown-source',
    title: 'Unmapped webhook',
    label: 'Fictional sample',
    body: {
      source: 'custom',
      type: 'something.happened',
      occurredAt: '2026-09-03T20:00:00Z',
      email: 'unknown@example.test',
      idempotencyKey: 'sample-unknown-1',
    },
  },
];

export function sampleOperatorDecisions(): {
  event: NormalizedEvent;
  decision: OperatorDecision;
}[] {
  const recent: {
    fingerprint: string;
    action: OperatorDecision['action'];
    playbookId: OperatorDecision['playbookId'];
  }[] = [];
  return sampleOperatorCases.map((item) => {
    const event = parseOperatorEvent(item.body);
    const decision = decideEvent(event, { plan: 'operator', recent });
    if (decision.action === 'fire' || decision.action === 'escalate') {
      recent.push({
        fingerprint: decision.fingerprint,
        action: decision.action,
        playbookId: decision.playbookId,
      });
    }
    return { event, decision };
  });
}
