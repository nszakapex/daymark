import { formatCents, type OperatorDecision } from './operator.ts';
import { sampleOperatorDecisions } from './operator-sample.ts';

export const DESK_BUCKETS = ['do', 'wait', 'skip', 'fix'] as const;
export type DeskBucket = (typeof DESK_BUCKETS)[number];

export type DeskItem = {
  id: string;
  bucket: DeskBucket;
  label: string;
  headline: string;
  detail: string;
  script: string;
  email: string | null;
  amountLabel: string | null;
  productName: string | null;
  sample: boolean;
  action: OperatorDecision['action'];
};

export function personName(email: string | null): string {
  if (!email) return 'this buyer';
  const local = email.split('@')[0] ?? '';
  const token = local.split(/[._-]/)[0] ?? local;
  if (!token) return email;
  return token.charAt(0).toUpperCase() + token.slice(1);
}

export function presentDeskItem(input: {
  id: string;
  email?: string | null;
  amountCents?: number | null;
  productName?: string | null;
  decision: OperatorDecision;
  sample?: boolean;
}): DeskItem {
  const email = input.email ?? null;
  const who = personName(email);
  const amountLabel =
    input.amountCents == null ? null : formatCents(input.amountCents);
  const productName = input.productName ?? null;
  const money = amountLabel ?? 'an unknown amount';
  const product = productName ?? 'an unknown product';
  const sample = input.sample === true;
  const base = {
    id: input.id,
    email,
    amountLabel,
    productName,
    sample,
    action: input.decision.action,
    detail: input.decision.reason,
  };

  if (input.decision.action === 'inconclusive') {
    return {
      ...base,
      bucket: 'fix',
      label: 'Fix the record',
      headline: `${who} cannot get a message yet`,
      script: email
        ? `Do not email ${email}. The record is missing a buyer, amount, product, or a known event type. Fix the source, then look again.`
        : 'Do not send a message. The record is incomplete. Fix the source, then look again.',
    };
  }

  if (input.decision.action === 'suppress') {
    return {
      ...base,
      bucket: 'skip',
      label: 'Leave them alone',
      headline: `${who} was already handled this hour`,
      script: `Do not contact ${who} again for this ${money} event. A message was already released.`,
    };
  }

  if (input.decision.action === 'hold') {
    return {
      ...base,
      bucket: 'wait',
      label: input.decision.upgradeRequired ? 'Not on this plan' : 'Wait',
      headline: input.decision.upgradeRequired
        ? `${who} needs a step Starter does not run`
        : `${who} is not ready yet`,
      script: input.decision.nextStep,
    };
  }

  if (input.decision.action === 'escalate') {
    return {
      ...base,
      bucket: 'do',
      label: 'Ask a person',
      headline: `${who} needs you, not a sequence`,
      script: `Write ${who} yourself about ${money}${productName ? ` for ${productName}` : ''}. Do not put them on an automated list.`,
    };
  }

  if (input.decision.playbookId === 'new-buyer') {
    return {
      ...base,
      bucket: 'do',
      label: 'Send the welcome',
      headline: `${who} paid for ${product}`,
      script: `Send ${who} only the welcome for ${product} (${money}). Do not use a generic blast.`,
    };
  }

  if (input.decision.playbookId === 'refund-watch') {
    return {
      ...base,
      bucket: 'do',
      label: 'Stop access',
      headline: `${who} was refunded ${money}`,
      script: `Remove ${who}'s access or stop the shipment. Do not send a welcome or a win-back.`,
    };
  }

  if (input.decision.playbookId === 'churn-risk') {
    return {
      ...base,
      bucket: 'do',
      label: 'One win-back',
      headline: `${who} canceled`,
      script: `Send ${who} one cancellation note. Then stop.`,
    };
  }

  if (input.decision.playbookId === 'stale-lead') {
    return {
      ...base,
      bucket: 'do',
      label: 'One follow-up',
      headline: `${who} has not bought yet`,
      script: `Send ${who} one follow-up. Do not dump a sequence.`,
    };
  }

  return {
    ...base,
    bucket: 'do',
    label: 'Email once',
    headline: `${who} failed a ${money} payment`,
    script: `Email ${who} once about the failed ${money} payment${productName ? ` for ${productName}` : ''}. Include one retry link. Do not add a second wait or a broadcast.`,
  };
}

export function sampleDesk(): DeskItem[] {
  return sampleOperatorDecisions().map(({ event, decision }, index) =>
    presentDeskItem({
      id: event.idempotencyKey ?? `sample-${index}`,
      email: event.email,
      amountCents: event.amountCents,
      productName: event.productName,
      decision,
      sample: true,
    }),
  );
}

export function deskCounts(items: DeskItem[]) {
  return {
    do: items.filter((item) => item.bucket === 'do').length,
    wait: items.filter((item) => item.bucket === 'wait').length,
    skip: items.filter((item) => item.bucket === 'skip').length,
    fix: items.filter((item) => item.bucket === 'fix').length,
  };
}
