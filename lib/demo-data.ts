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
    'Paid customer acquisition cost increased 25%, while spending stayed the same.',
  basis:
    'Meta matched customers fell from 24 to 12; Google remained at 36. Current Meta cost is $80 per matched new customer, above the sample owner’s $60 target.',
  limits:
    '12 matched Meta customers is a limited sample. Missing source data may affect comparisons. These are recorded associations, not proof of incremental sales caused by ads.',
};
