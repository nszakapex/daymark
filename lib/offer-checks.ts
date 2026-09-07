import {
  syntheticData,
  sampleBusiness,
  uniqueAdDays,
  type AdDay,
} from './synthetic-data.ts';

export type Setup = 'current' | 'corrected' | 'unavailable';
export type CheckStatus = 'passed' | 'failed' | 'inconclusive';
export const offers = [
  {
    id: 'planner',
    title: '20% off your first planner',
    code: 'PLAN20',
    product: 'Undated weekly planner',
    priceCents: 3800,
    campaignId: 'meta-desks',
    platform: 'Meta',
    expectedDiscount: 20,
    minimumCents: 0,
    gift: false,
    description: 'First purchase · US · one planner · no other discounts',
    needsMarket: false,
  },
  {
    id: 'desk',
    title: 'A free pen set with your desk bundle',
    code: 'DESKGIFT',
    product: 'Desk reset bundle',
    priceCents: 8400,
    campaignId: 'google-planners',
    platform: 'Google',
    expectedDiscount: 0,
    minimumCents: 7500,
    gift: true,
    description: 'US · desk bundle over $75 · one free pen set',
    needsMarket: false,
  },
  {
    id: 'shipping',
    title: 'Free shipping on orders over $75',
    code: 'SHIP75',
    product: 'The complete desk collection',
    priceCents: 12800,
    campaignId: 'meta-return',
    platform: 'Meta',
    expectedDiscount: 0,
    minimumCents: 7500,
    gift: false,
    description: 'Shipping region has not been confirmed',
    needsMarket: true,
  },
] as const;
export type Offer = (typeof offers)[number];
export type OfferId = Offer['id'];
export const getOffer = (id: string) => offers.find((o) => o.id === id);
export const spendForOffer = (
  offer: Offer,
  adDays: AdDay[] = syntheticData.adDays,
) =>
  uniqueAdDays(adDays)
    .filter((d) => d.date === '2026-09-03' && d.campaignId === offer.campaignId)
    .reduce((total, d) => total + d.spendCents, 0) / 100;
export const offerConditions = (offer: Offer, marketConfirmed: boolean) =>
  offer.needsMarket && marketConfirmed
    ? 'US shipping confirmed · basket over $75'
    : offer.description;

/** This is the actual cart model used by our fictional store. No real account or payment is accessed. */
export function sampleCart(
  offer: Offer,
  setup: Setup,
  marketConfirmed = false,
) {
  if (setup === 'unavailable') return null;
  // Deliberate sample defect: PLAN20 only allows journals until the setup is corrected.
  const allowedProducts =
    setup === 'corrected' ? ['planner', 'journal'] : ['journal'];
  const discountCents =
    offer.id === 'planner' && allowedProducts.includes(offer.id)
      ? Math.round(offer.priceCents * 0.2)
      : 0;
  const giftAdded = offer.id === 'desk' && offer.priceCents >= 7500;
  const shippingCents =
    offer.id === 'shipping' && !marketConfirmed
      ? null
      : offer.priceCents >= 7500
        ? 0
        : 550;
  return {
    subtotalCents: offer.priceCents,
    discountCents,
    giftAdded,
    shippingCents,
    totalBeforeTaxCents:
      shippingCents === null
        ? null
        : offer.priceCents - discountCents + shippingCents,
    message:
      offer.id === 'planner' && discountCents === 0
        ? 'PLAN20 is not valid for the items in your cart.'
        : offer.id === 'shipping' && !marketConfirmed
          ? 'Choose a shipping region to see available rates.'
          : 'Offer applied to this basket.',
  };
}

export function checkOffer(id: OfferId, setup: Setup, marketConfirmed = false) {
  const offer = getOffer(id)!;
  const cart = sampleCart(offer, setup, marketConfirmed);
  const expectedDiscountCents = Math.round(
    (offer.priceCents * offer.expectedDiscount) / 100,
  );
  let status: CheckStatus = 'passed';
  let title = 'The advertised offer works for this basket.';
  let nextStep =
    'Keep this offer under review when its products or terms change.';
  if (!cart) {
    status = 'inconclusive';
    title = 'The sample checkout could not be reached.';
    nextStep =
      'Try the check again. An unavailable check does not prove a customer-facing failure.';
  } else if (
    offer.needsMarket &&
    (!marketConfirmed || cart.shippingCents === null)
  ) {
    status = 'inconclusive';
    title = 'Confirm the shipping region first.';
    nextStep =
      'Confirm which countries qualify for free shipping before testing this promise.';
  } else if (cart.subtotalCents < offer.minimumCents) {
    status = 'inconclusive';
    title = 'The basket does not meet the offer minimum.';
    nextStep = 'Choose a qualifying basket before testing this promise.';
  } else if (
    cart.discountCents !== expectedDiscountCents ||
    (offer.gift && !cart.giftAdded) ||
    (offer.needsMarket && cart.shippingCents !== 0)
  ) {
    status = 'failed';
    title =
      offer.id === 'planner'
        ? 'The planner discount does not apply.'
        : 'The advertised benefit is missing.';
    nextStep =
      offer.id === 'planner'
        ? 'Add the Undated weekly planner to the products eligible for PLAN20, then run this check again.'
        : 'Review the promotion rules against the confirmed terms, then check this basket again.';
  }
  return {
    mode: 'synthetic-store' as const,
    dataset: sampleBusiness.version,
    offerId: id,
    setup,
    marketConfirmed,
    status,
    title,
    nextStep,
    observedAt: new Date().toISOString(),
    expectedDiscountCents,
    cart,
    spend: spendForOffer(offer),
    steps: [
      {
        label: 'Read the confirmed offer',
        result: 'passed' as CheckStatus,
        detail: offer.title,
      },
      {
        label: 'Build the eligible basket',
        result:
          offer.needsMarket && !marketConfirmed
            ? ('inconclusive' as CheckStatus)
            : ('passed' as CheckStatus),
        detail:
          offer.needsMarket && marketConfirmed
            ? 'US shipping confirmed · basket over $75'
            : offer.description,
      },
      {
        label: 'Check the sample cart',
        result: !cart ? ('inconclusive' as CheckStatus) : status,
        detail: cart?.message ?? 'No cart result returned',
      },
      {
        label: 'Verify the advertised benefit',
        result: status,
        detail:
          status === 'passed'
            ? 'The confirmed benefit is present. Payment was not tested.'
            : nextStep,
      },
    ],
    scope:
      'Sample cart rules only. This is not a live browser, device, payment, or ad-account check.',
  };
}
export type OfferResult = ReturnType<typeof checkOffer>;
