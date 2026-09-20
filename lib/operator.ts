export const OPERATOR_ACTIONS = [
  'fire',
  'hold',
  'suppress',
  'escalate',
  'inconclusive',
] as const;
export type OperatorAction = (typeof OPERATOR_ACTIONS)[number];

export const OPERATOR_PLANS = ['trial', 'starter', 'operator'] as const;
export type OperatorPlan = (typeof OPERATOR_PLANS)[number];

export const PLAYBOOKS = [
  {
    id: 'failed-payment',
    title: 'Failed payment recovery',
    summary:
      'Release a recovery Zap only when the buyer and amount are known, the payment has not already been refunded, and the same failure has not already been released.',
    plan: 'starter',
  },
  {
    id: 'new-buyer',
    title: 'New buyer routing',
    summary:
      'Route a first purchase into the matching onboarding Zap. Missing product or email stays inconclusive.',
    plan: 'starter',
  },
  {
    id: 'refund-watch',
    title: 'Refund watch',
    summary:
      'When a refund lands, release a pause-fulfillment Zap instead of pretending the original sale still stands.',
    plan: 'operator',
  },
  {
    id: 'chargeback',
    title: 'Chargeback halt',
    summary:
      'Disputes are not automated recovery. Escalate and stop happy-path fulfillment.',
    plan: 'operator',
  },
  {
    id: 'churn-risk',
    title: 'Membership churn',
    summary:
      'A cancellation can trigger a win-back Zap unless a refund or dispute already explains the exit.',
    plan: 'operator',
  },
  {
    id: 'stale-lead',
    title: 'Stale lead follow-up',
    summary:
      'Follow up only when the lead is old enough and has not already purchased. A Zapier Delay still owns the wait.',
    plan: 'operator',
  },
] as const;
export type PlaybookId = (typeof PLAYBOOKS)[number]['id'];

export type OperatorContext = {
  alreadyCustomer?: boolean;
  refunded?: boolean;
  disputed?: boolean;
  hoursSince?: number;
  priorFailedPayments?: number;
  membershipStatus?: string;
};

export type NormalizedEvent = {
  source: string;
  type: string;
  occurredAt: string;
  email: string | null;
  customerId: string | null;
  amountCents: number | null;
  currency: string | null;
  productId: string | null;
  productName: string | null;
  idempotencyKey: string | null;
  context: OperatorContext;
  rawKind: 'daymark' | 'stripe' | 'whop' | 'shopify' | 'generic';
};

export type RecentEvent = {
  fingerprint: string;
  action: OperatorAction;
  playbookId: PlaybookId | null;
};

export type OperatorDecision = {
  action: OperatorAction;
  playbookId: PlaybookId | null;
  playbookTitle: string | null;
  reason: string;
  evidence: string[];
  nextStep: string;
  upgradeRequired: boolean;
  fingerprint: string;
  outbound: Record<string, unknown> | null;
  zapFilter: {
    action: OperatorAction;
    continue: boolean;
    path: 'recovery' | 'onboarding' | 'pause' | 'winback' | 'followup' | 'none';
  };
};

export const SAMPLE_INGEST_TOKEN = 'dm_sample';
const HIGH_VALUE_CENTS = 20000;
const FAILED_PAYMENT_WINDOW_HOURS = 6;

const STARTER_PLAYBOOKS = new Set<PlaybookId>(['failed-payment', 'new-buyer']);

export const planLimits: Record<
  OperatorPlan,
  {
    monthlyEvents: number;
    destinations: number;
    playbooks: PlaybookId[];
    label: string;
  }
> = {
  trial: {
    monthlyEvents: 75,
    destinations: 0,
    playbooks: [...STARTER_PLAYBOOKS],
    label: 'Trial',
  },
  starter: {
    monthlyEvents: 1000,
    destinations: 0,
    playbooks: [...STARTER_PLAYBOOKS],
    label: 'Starter',
  },
  operator: {
    monthlyEvents: 20000,
    destinations: 3,
    playbooks: PLAYBOOKS.map((playbook) => playbook.id),
    label: 'Operator',
  },
};

export function playbookById(id: PlaybookId | null) {
  return PLAYBOOKS.find((playbook) => playbook.id === id) ?? null;
}

export function utcMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

export function eventFingerprint(event: NormalizedEvent): string {
  const hour = event.occurredAt.slice(0, 13);
  const email = (event.email ?? 'unknown').toLowerCase();
  const amount = event.amountCents ?? 'na';
  return `${event.source}|${event.type}|${email}|${amount}|${hour}`;
}

export function parseOperatorEvent(body: unknown): NormalizedEvent {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw Error('Send a JSON object from Zapier.');
  }
  const input = body as Record<string, unknown>;
  if (isStripeEvent(input)) return fromStripe(input);
  if (isWhopEvent(input)) return fromWhop(input);
  if (isShopifyEvent(input)) return fromShopify(input);
  return fromEnvelope(input);
}

export function decideEvent(
  event: NormalizedEvent,
  options: {
    plan: OperatorPlan;
    recent?: RecentEvent[];
    now?: Date;
  },
): OperatorDecision {
  const fingerprint = eventFingerprint(event);
  const playbookId = matchPlaybook(event);
  const occurred = Date.parse(event.occurredAt);
  if (!event.occurredAt || Number.isNaN(occurred)) {
    return decision({
      action: 'inconclusive',
      playbookId,
      fingerprint,
      reason:
        'The event time is missing or not a valid UTC timestamp. Daymark did not release a Zap.',
      evidence: ['occurredAt is required and must be an ISO-8601 UTC time.'],
      nextStep:
        'Map occurredAt from the source event time in Zapier, then send the event again.',
      path: 'none',
    });
  }
  if (!playbookId) {
    return decision({
      action: 'inconclusive',
      playbookId: null,
      fingerprint,
      reason:
        'Daymark does not have a playbook for this event type. Unknown sources stay unknown; no Zap was released.',
      evidence: [
        `Source: ${event.source}`,
        `Type: ${event.type}`,
        `Read as: ${event.rawKind}`,
      ],
      nextStep:
        'Keep the event in your Zapier history. Add a mapped type such as charge.failed, order.paid, or membership.canceled if you want a decision.',
      path: 'none',
    });
  }

  const duplicate = options.recent?.find(
    (item) =>
      item.fingerprint === fingerprint &&
      (item.action === 'fire' || item.action === 'escalate'),
  );
  if (duplicate) {
    return decision({
      action: 'suppress',
      playbookId,
      fingerprint,
      reason:
        'The same buyer, amount, and event type were already released in this hour. A second Zap would duplicate the work.',
      evidence: [
        `Fingerprint ${fingerprint}`,
        `Earlier action: ${duplicate.action}`,
      ],
      nextStep: 'Leave the existing recovery or onboarding Zap in place.',
      path: 'none',
    });
  }

  const requiredPlan = playbookById(playbookId)?.plan ?? 'starter';
  const allowed = planLimits[options.plan].playbooks.includes(playbookId);
  if (!allowed) {
    return decision({
      action: 'hold',
      playbookId,
      fingerprint,
      upgradeRequired: true,
      reason: `${playbookById(playbookId)?.title} is included with Operator. The event was understood and no automation was released.`,
      evidence: [
        `Recognized playbook: ${playbookId}`,
        `Current plan: ${options.plan}`,
        `Required plan: ${requiredPlan}`,
      ],
      nextStep:
        'Upgrade to Operator if you want Daymark to release this Zap automatically.',
      path: 'none',
    });
  }

  if (playbookId === 'failed-payment') {
    return decideFailedPayment(event, fingerprint);
  }
  if (playbookId === 'new-buyer') {
    return decideNewBuyer(event, fingerprint);
  }
  if (playbookId === 'refund-watch') {
    return decideRefund(event, fingerprint);
  }
  if (playbookId === 'chargeback') {
    return decideChargeback(event, fingerprint);
  }
  if (playbookId === 'churn-risk') {
    return decideChurn(event, fingerprint);
  }
  return decideStaleLead(event, fingerprint);
}

function decideFailedPayment(
  event: NormalizedEvent,
  fingerprint: string,
): OperatorDecision {
  if (!event.email) {
    return decision({
      action: 'inconclusive',
      playbookId: 'failed-payment',
      fingerprint,
      reason:
        'A failed payment arrived without a buyer email. Recovery cannot be addressed, so no Zap was released.',
      evidence: ['email is missing', amountEvidence(event)],
      nextStep:
        'Map the customer email from Stripe, Whop, or Shopify into the request.',
      path: 'none',
    });
  }
  if (event.amountCents == null || event.amountCents < 0) {
    return decision({
      action: 'inconclusive',
      playbookId: 'failed-payment',
      fingerprint,
      reason:
        'The failed amount is missing. Daymark will not guess a recovery offer.',
      evidence: [`Buyer ${event.email}`],
      nextStep: 'Map amountCents as integer USD cents from the source event.',
      path: 'none',
    });
  }
  if (event.context.refunded) {
    return decision({
      action: 'hold',
      playbookId: 'failed-payment',
      fingerprint,
      reason:
        'The payment is already marked refunded. A recovery sequence would ask for money that is no longer due.',
      evidence: [
        `Buyer ${event.email}`,
        amountEvidence(event),
        'context.refunded is true',
      ],
      nextStep:
        'Skip recovery. Use refund-watch if fulfillment still needs to stop.',
      path: 'none',
    });
  }
  if (event.context.disputed) {
    return decision({
      action: 'escalate',
      playbookId: 'failed-payment',
      fingerprint,
      reason:
        'This failed payment is already in dispute. Automated recovery would fight the same customer twice.',
      evidence: [`Buyer ${event.email}`, 'context.disputed is true'],
      nextStep: 'Notify a person. Do not start a dunning email.',
      path: 'pause',
      outbound: outbound(
        event,
        'pause',
        'Person needed: disputed failed payment.',
      ),
    });
  }
  if (event.amountCents >= HIGH_VALUE_CENTS) {
    return decision({
      action: 'escalate',
      playbookId: 'failed-payment',
      fingerprint,
      reason:
        'The failed amount is $200 or more. Daymark will not auto-recover a high-value failure.',
      evidence: [`Buyer ${event.email}`, amountEvidence(event)],
      nextStep: 'Have a person send a direct note. Keep the dunning Zap off.',
      path: 'pause',
      outbound: outbound(
        event,
        'pause',
        'Person needed: high-value failed payment.',
      ),
    });
  }
  const priors = event.context.priorFailedPayments ?? 0;
  return decision({
    action: 'fire',
    playbookId: 'failed-payment',
    fingerprint,
    reason:
      priors >= 2
        ? 'A repeated failed payment can enter recovery, with the prior-failure count attached so the Zap can change tone.'
        : 'A first failed payment with a known buyer and amount can enter recovery.',
    evidence: [
      `Buyer ${event.email}`,
      amountEvidence(event),
      `Prior failed payments: ${priors}`,
      `Suppress window: ${FAILED_PAYMENT_WINDOW_HOURS} hours`,
    ],
    nextStep:
      'In Zapier, continue only when action is fire. Send one recovery message, not a broadcast.',
    path: 'recovery',
    outbound: outbound(event, 'recovery', 'Send one recovery message.'),
  });
}

function decideNewBuyer(
  event: NormalizedEvent,
  fingerprint: string,
): OperatorDecision {
  if (!event.email) {
    return decision({
      action: 'inconclusive',
      playbookId: 'new-buyer',
      fingerprint,
      reason:
        'A purchase arrived without a buyer email. Onboarding cannot be routed.',
      evidence: [productEvidence(event)],
      nextStep: 'Map the buyer email from the order or membership event.',
      path: 'none',
    });
  }
  if (!event.productId && !event.productName) {
    return decision({
      action: 'inconclusive',
      playbookId: 'new-buyer',
      fingerprint,
      reason:
        'The product is unknown. Daymark will not guess which onboarding sequence to start.',
      evidence: [`Buyer ${event.email}`],
      nextStep: 'Map productId or productName from the paid item.',
      path: 'none',
    });
  }
  if (event.context.refunded || event.context.disputed) {
    return decision({
      action: 'hold',
      playbookId: 'new-buyer',
      fingerprint,
      reason:
        'This purchase is already refunded or disputed. Starting onboarding would welcome a buyer who should not receive access.',
      evidence: [
        `Buyer ${event.email}`,
        productEvidence(event),
        event.context.disputed
          ? 'context.disputed is true'
          : 'context.refunded is true',
      ],
      nextStep:
        'Hold access. Use refund-watch or chargeback if fulfillment is still open.',
      path: 'none',
    });
  }
  return decision({
    action: 'fire',
    playbookId: 'new-buyer',
    fingerprint,
    reason:
      'A paid buyer with a known product can enter the matching onboarding Zap.',
    evidence: [
      `Buyer ${event.email}`,
      productEvidence(event),
      amountEvidence(event),
    ],
    nextStep:
      'Continue when action is fire. Use productId to choose the welcome path inside Zapier.',
    path: 'onboarding',
    outbound: outbound(
      event,
      'onboarding',
      'Start the product-specific welcome path.',
    ),
  });
}

function decideRefund(
  event: NormalizedEvent,
  fingerprint: string,
): OperatorDecision {
  if (!event.email && !event.customerId) {
    return decision({
      action: 'inconclusive',
      playbookId: 'refund-watch',
      fingerprint,
      reason:
        'A refund arrived without a buyer identity. Fulfillment cannot be paused safely.',
      evidence: [amountEvidence(event)],
      nextStep: 'Map email or customerId from the refund object.',
      path: 'none',
    });
  }
  return decision({
    action: 'fire',
    playbookId: 'refund-watch',
    fingerprint,
    reason:
      'A recorded refund should pause fulfillment and access. It is not a lost-sale metric and not a recovery email.',
    evidence: [
      event.email ? `Buyer ${event.email}` : `Customer ${event.customerId}`,
      amountEvidence(event),
      productEvidence(event),
    ],
    nextStep:
      'Continue when action is fire. Revoke access or stop shipment in the next Zap step.',
    path: 'pause',
    outbound: outbound(
      event,
      'pause',
      'Pause fulfillment and access after a refund.',
    ),
  });
}

function decideChargeback(
  event: NormalizedEvent,
  fingerprint: string,
): OperatorDecision {
  return decision({
    action: 'escalate',
    playbookId: 'chargeback',
    fingerprint,
    reason:
      'A dispute is a legal and billing event. Daymark will not send a friendly recovery email.',
    evidence: [
      event.email ? `Buyer ${event.email}` : 'Buyer email unknown',
      amountEvidence(event),
      'Automated dunning is suppressed',
    ],
    nextStep:
      'Notify a person and freeze fulfillment. Do not run marketing Zaps on this buyer.',
    path: 'pause',
    outbound: outbound(event, 'pause', 'Person needed: chargeback.'),
  });
}

function decideChurn(
  event: NormalizedEvent,
  fingerprint: string,
): OperatorDecision {
  if (!event.email) {
    return decision({
      action: 'inconclusive',
      playbookId: 'churn-risk',
      fingerprint,
      reason:
        'A cancellation arrived without an email. A win-back cannot be addressed.',
      evidence: [productEvidence(event)],
      nextStep:
        'Map the member email from Whop, Stripe, or your membership tool.',
      path: 'none',
    });
  }
  if (event.context.refunded || event.context.disputed) {
    return decision({
      action: 'hold',
      playbookId: 'churn-risk',
      fingerprint,
      reason:
        'This cancellation already has a refund or dispute. A win-back email would ignore the actual reason they left.',
      evidence: [
        `Buyer ${event.email}`,
        event.context.disputed
          ? 'context.disputed is true'
          : 'context.refunded is true',
      ],
      nextStep: 'Do not run a win-back. Close access if it is still open.',
      path: 'none',
    });
  }
  return decision({
    action: 'fire',
    playbookId: 'churn-risk',
    fingerprint,
    reason:
      'A clean cancellation can enter one win-back Zap. It does not prove why they left.',
    evidence: [`Buyer ${event.email}`, productEvidence(event)],
    nextStep: 'Continue when action is fire. Send one message, then stop.',
    path: 'winback',
    outbound: outbound(event, 'winback', 'Send one cancellation follow-up.'),
  });
}

function decideStaleLead(
  event: NormalizedEvent,
  fingerprint: string,
): OperatorDecision {
  if (!event.email) {
    return decision({
      action: 'inconclusive',
      playbookId: 'stale-lead',
      fingerprint,
      reason:
        'A lead event arrived without an email. Follow-up cannot be addressed.',
      evidence: [],
      nextStep: 'Map the form email into the request.',
      path: 'none',
    });
  }
  if (event.context.alreadyCustomer) {
    return decision({
      action: 'suppress',
      playbookId: 'stale-lead',
      fingerprint,
      reason:
        'This address is already a customer. A lead nurture would sell them something they bought.',
      evidence: [`Buyer ${event.email}`, 'context.alreadyCustomer is true'],
      nextStep:
        'Skip the nurture Zap. Use new-buyer if onboarding is still missing.',
      path: 'none',
    });
  }
  if (event.context.hoursSince == null) {
    return decision({
      action: 'hold',
      playbookId: 'stale-lead',
      fingerprint,
      reason:
        'The lead is fresh and no wait has been measured. Zapier Delay should own the clock; Daymark will not invent that they went cold.',
      evidence: [`Lead ${event.email}`, 'context.hoursSince is missing'],
      nextStep:
        'Use Zapier Delay for 24 hours, then send the same lead back with hoursSince set. Daymark will decide then.',
      path: 'none',
    });
  }
  if (event.context.hoursSince < 24) {
    return decision({
      action: 'hold',
      playbookId: 'stale-lead',
      fingerprint,
      reason: 'Fewer than 24 hours have passed. This is not a stale lead yet.',
      evidence: [
        `Lead ${event.email}`,
        `hoursSince: ${event.context.hoursSince}`,
      ],
      nextStep:
        'Wait. Send the event again after a full day if they still have not purchased.',
      path: 'none',
    });
  }
  return decision({
    action: 'fire',
    playbookId: 'stale-lead',
    fingerprint,
    reason:
      'The lead is at least a day old and not marked as a customer. One follow-up can be released.',
    evidence: [
      `Lead ${event.email}`,
      `hoursSince: ${event.context.hoursSince}`,
    ],
    nextStep:
      'Continue when action is fire. Send one follow-up, not a sequence dump.',
    path: 'followup',
    outbound: outbound(event, 'followup', 'Send one stale-lead follow-up.'),
  });
}

function matchPlaybook(event: NormalizedEvent): PlaybookId | null {
  const type = event.type.toLowerCase();
  if (
    /charge\.failed|payment_intent\.payment_failed|invoice\.payment_failed|payment_failed/.test(
      type,
    )
  ) {
    return 'failed-payment';
  }
  if (/charge\.dispute|dispute\.created|chargeback/.test(type)) {
    return 'chargeback';
  }
  if (/refund|charge\.refunded/.test(type)) {
    return 'refund-watch';
  }
  if (
    /membership\.canceled|customer\.subscription\.deleted|subscription\.deleted|membership_went_invalid/.test(
      type,
    )
  ) {
    return 'churn-risk';
  }
  if (
    /checkout\.session\.completed|order\.paid|payment_intent\.succeeded|membership\.created|membership_went_valid|order_paid/.test(
      type,
    )
  ) {
    return 'new-buyer';
  }
  if (/form\.submitted|lead\.created|lead\.stale|identify/.test(type)) {
    return 'stale-lead';
  }
  return null;
}

function decision(input: {
  action: OperatorAction;
  playbookId: PlaybookId | null;
  fingerprint: string;
  reason: string;
  evidence: string[];
  nextStep: string;
  path: OperatorDecision['zapFilter']['path'];
  outbound?: Record<string, unknown> | null;
  upgradeRequired?: boolean;
}): OperatorDecision {
  return {
    action: input.action,
    playbookId: input.playbookId,
    playbookTitle: playbookById(input.playbookId)?.title ?? null,
    reason: input.reason,
    evidence: input.evidence.filter(Boolean),
    nextStep: input.nextStep,
    upgradeRequired: input.upgradeRequired === true,
    fingerprint: input.fingerprint,
    outbound: input.outbound ?? null,
    zapFilter: {
      action: input.action,
      continue: input.action === 'fire' || input.action === 'escalate',
      path: input.path,
    },
  };
}

function outbound(
  event: NormalizedEvent,
  path: OperatorDecision['zapFilter']['path'],
  instruction: string,
) {
  return {
    path,
    instruction,
    email: event.email,
    customerId: event.customerId,
    amountCents: event.amountCents,
    currency: event.currency ?? 'usd',
    productId: event.productId,
    productName: event.productName,
    source: event.source,
    type: event.type,
    occurredAt: event.occurredAt,
  };
}

function amountEvidence(event: NormalizedEvent): string {
  if (event.amountCents == null) return 'Amount unknown';
  return `Amount ${formatCents(event.amountCents)} ${event.currency ?? 'usd'}`;
}

function productEvidence(event: NormalizedEvent): string {
  if (event.productName) return `Product ${event.productName}`;
  if (event.productId) return `Product ${event.productId}`;
  return 'Product unknown';
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asId(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function asCents(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === 'string' && value.trim() && !value.includes('.')) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
  }
  return null;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function isStripeEvent(input: Record<string, unknown>): boolean {
  return (
    typeof input.type === 'string' &&
    Boolean(asRecord(input.data)?.object) &&
    (typeof input.id === 'string' || input.object === 'event')
  );
}

function isWhopEvent(input: Record<string, unknown>): boolean {
  const type = asString(input.type) ?? asString(input.action);
  return Boolean(
    type &&
    (/^membership\.|^payment\.|^whop\./.test(type) ||
      input.experience_id ||
      input.membership),
  );
}

function isShopifyEvent(input: Record<string, unknown>): boolean {
  return Boolean(
    input.order_number ||
    (Array.isArray(input.line_items) && (input.email || input.contact_email)),
  );
}

function fromEnvelope(input: Record<string, unknown>): NormalizedEvent {
  const context = asRecord(input.context) ?? {};
  const occurredAt =
    asString(input.occurredAt) ??
    asString(input.occurred_at) ??
    new Date().toISOString();
  return {
    source: (asString(input.source) ?? 'custom').toLowerCase(),
    type: (
      asString(input.type) ??
      asString(input.event) ??
      'unknown'
    ).toLowerCase(),
    occurredAt,
    email: asString(input.email)?.toLowerCase() ?? null,
    customerId: asString(input.customerId) ?? asString(input.customer_id),
    amountCents: asCents(input.amountCents) ?? asCents(input.amount_cents),
    currency: (asString(input.currency) ?? 'usd').toLowerCase(),
    productId: asString(input.productId) ?? asString(input.product_id),
    productName: asString(input.productName) ?? asString(input.product_name),
    idempotencyKey:
      asString(input.idempotencyKey) ??
      asString(input.idempotency_key) ??
      asString(input.id),
    context: readContext(context),
    rawKind: 'daymark',
  };
}

function fromStripe(input: Record<string, unknown>): NormalizedEvent {
  const object = asRecord(asRecord(input.data)?.object) ?? {};
  const billing = asRecord(object.billing_details);
  const customerDetails = asRecord(object.customer_details);
  const metadata = asRecord(object.metadata) ?? {};
  const amount =
    asCents(object.amount) ??
    asCents(object.amount_total) ??
    asCents(object.amount_refunded);
  return {
    source: 'stripe',
    type: String(input.type).toLowerCase(),
    occurredAt: stripeTime(input.created) ?? new Date().toISOString(),
    email:
      (
        asString(billing?.email) ??
        asString(customerDetails?.email) ??
        asString(object.receipt_email) ??
        asString(object.email)
      )?.toLowerCase() ?? null,
    customerId: asString(object.customer) ?? asString(object.id),
    amountCents: amount,
    currency: (asString(object.currency) ?? 'usd').toLowerCase(),
    productId:
      asString(metadata.product_id) ??
      asString(metadata.productId) ??
      firstStripeProduct(object),
    productName:
      asString(metadata.product_name) ?? asString(metadata.productName),
    idempotencyKey: asString(input.id),
    context: {
      refunded: object.refunded === true,
      disputed:
        object.disputed === true || object.status === 'requires_payment_method',
      alreadyCustomer: asBoolean(metadata.already_customer),
      hoursSince: asNumber(metadata.hours_since),
      priorFailedPayments: asNumber(metadata.prior_failed_payments),
    },
    rawKind: 'stripe',
  };
}

function fromWhop(input: Record<string, unknown>): NormalizedEvent {
  const data = asRecord(input.data) ?? asRecord(input.membership) ?? input;
  const user = asRecord(data.user) ?? asRecord(input.user);
  const product = asRecord(data.product) ?? asRecord(input.product);
  return {
    source: 'whop',
    type: (
      asString(input.type) ??
      asString(input.action) ??
      'unknown'
    ).toLowerCase(),
    occurredAt:
      asString(data.created_at) ??
      asString(input.created_at) ??
      new Date().toISOString(),
    email:
      (asString(user?.email) ?? asString(data.email))?.toLowerCase() ?? null,
    customerId: asString(data.id) ?? asString(user?.id),
    amountCents:
      asCents(data.final_amount) ??
      asCents(input.amount) ??
      asCents(data.amount),
    currency: (asString(data.currency) ?? 'usd').toLowerCase(),
    productId: asString(product?.id) ?? asString(data.product_id),
    productName: asString(product?.title) ?? asString(product?.name),
    idempotencyKey: asString(input.id) ?? asString(data.id),
    context: {
      refunded: data.refunded === true || asString(data.status) === 'refunded',
      membershipStatus: asString(data.status) ?? undefined,
    },
    rawKind: 'whop',
  };
}

function fromShopify(input: Record<string, unknown>): NormalizedEvent {
  const customer = asRecord(input.customer);
  const lineItems = Array.isArray(input.line_items) ? input.line_items : [];
  const firstItem = asRecord(lineItems[0]);
  const financial = asString(input.financial_status)?.toLowerCase();
  return {
    source: 'shopify',
    type: financial === 'refunded' ? 'order.refunded' : 'order.paid',
    occurredAt:
      asString(input.processed_at) ??
      asString(input.created_at) ??
      new Date().toISOString(),
    email:
      (
        asString(input.email) ??
        asString(input.contact_email) ??
        asString(customer?.email)
      )?.toLowerCase() ?? null,
    customerId: asId(customer?.id) ?? asId(input.id),
    amountCents: moneyStringToCents(input.total_price),
    currency: (asString(input.currency) ?? 'usd').toLowerCase(),
    productId: firstItem ? asId(firstItem.product_id) : null,
    productName: asString(firstItem?.title),
    idempotencyKey: asId(input.id) ?? asId(input.order_number),
    context: {
      refunded: financial === 'refunded' || financial === 'partially_refunded',
    },
    rawKind: 'shopify',
  };
}

function readContext(context: Record<string, unknown>): OperatorContext {
  return {
    alreadyCustomer:
      asBoolean(context.alreadyCustomer) ?? asBoolean(context.already_customer),
    refunded: asBoolean(context.refunded),
    disputed: asBoolean(context.disputed),
    hoursSince: asNumber(context.hoursSince) ?? asNumber(context.hours_since),
    priorFailedPayments:
      asNumber(context.priorFailedPayments) ??
      asNumber(context.prior_failed_payments),
    membershipStatus:
      asString(context.membershipStatus) ??
      asString(context.membership_status) ??
      undefined,
  };
}

function stripeTime(value: unknown): string | null {
  return typeof value === 'number'
    ? new Date(value * 1000).toISOString()
    : null;
}

function firstStripeProduct(object: Record<string, unknown>): string | null {
  const items = asRecord(object.display_items) ? null : object.lines;
  const lines = asRecord(items)?.data;
  if (!Array.isArray(lines) || !lines[0]) return null;
  const first = asRecord(lines[0]);
  const price = asRecord(first?.price);
  return asString(price?.product) ?? asString(first?.description);
}

function moneyStringToCents(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100);
  }
  if (typeof value !== 'string' || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}
