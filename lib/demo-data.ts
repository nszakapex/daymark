export const periods = {
  current: {
    label: 'Aug 7 – Sep 3, 2026',
    previousLabel: 'Jul 10 – Aug 6, 2026',
    spend: 2400,
    paidCustomers: 48,
    totalCustomers: 96,
    otherCustomers: 36,
    unknownCustomers: 12,
    googleCustomers: 36,
    metaCustomers: 12,
    weeklyCustomers: [14, 13, 11, 10],
  },
  previous: {
    label: 'Jul 10 – Aug 6, 2026',
    previousLabel: null,
    spend: 2400,
    paidCustomers: 60,
    totalCustomers: 100,
    otherCustomers: 30,
    unknownCustomers: 10,
    googleCustomers: 36,
    metaCustomers: 24,
    weeklyCustomers: [15, 15, 15, 15],
  },
} as const;
export type Period = keyof typeof periods;
export function reportFor(period: Period) {
  const p = periods[period];
  return {
    ...p,
    cost: p.spend / p.paidCustomers,
    coverage:
      ((p.totalCustomers - p.unknownCustomers) / p.totalCustomers) * 100,
    metaCost: 960 / p.metaCustomers,
    googleCost: 1440 / p.googleCustomers,
  };
}
export const demoFinding = {
  title: 'Review Meta before increasing its budget.',
  finding:
    'Overall ad cost per linked customer rose from $40 to $50. Meta accounts for the increase.',
  basis:
    'New customers linked to Meta fell from 24 to 12; Google stayed at 36. Meta cost $80 per customer, above this sample business’s $60 target.',
  limits:
    'Only 12 new customers were linked to Meta, so a few missing or late records could change the result. Check those records before changing your budget.',
};
