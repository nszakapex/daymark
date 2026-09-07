/** Fictional fixture. Deterministic records; money is integer USD cents; reporting clock is UTC. */
export const sampleBusiness = {
  name: 'June Paper Co.',
  description: 'An online shop selling planners, journals, and desk sets.',
  snapshot: '2026-09-06T08:00:00.000Z',
  snapshotLabel: 'Sep 6, 2026 · 8:00 AM UTC',
  version: 'june-paper-2026-09-v2',
  target: 60,
};
export type Period = 'current' | 'previous';
export type Source =
  | 'Google'
  | 'Meta'
  | 'Email'
  | 'Organic search'
  | 'Referral';
export type Order = {
  id: string;
  customerId: string;
  placedAt: string;
  updatedAt: string;
  status: 'paid' | 'canceled' | 'payment_failed';
  product: string;
  quantity: number;
  subtotalCents: number;
  discountCents: number;
};
export type Touchpoint = {
  id: string;
  customerId: string;
  at: string;
  source: Source;
  campaignId: string | null;
};
export type AdDay = {
  date: string;
  campaignId: string;
  spendCents: number;
  impressions: number;
  clicks: number;
};
export type Refund = {
  id: string;
  orderId: string;
  at: string;
  amountCents: number;
  reason: string;
};
export type Dataset = {
  orders: Order[];
  touchpoints: Touchpoint[];
  adDays: AdDay[];
  refunds: Refund[];
};
export const campaigns = [
  {
    id: 'google-brand',
    platform: 'Google',
    name: 'June Paper · Brand search',
    purpose: 'People already searching for the shop',
  },
  {
    id: 'google-planners',
    platform: 'Google',
    name: 'Planners · Search',
    purpose: 'People searching for a planner',
  },
  {
    id: 'meta-desks',
    platform: 'Meta',
    name: 'A calmer desk · New audiences',
    purpose: 'Introduce the shop to new people',
  },
  {
    id: 'meta-return',
    platform: 'Meta',
    name: 'Still thinking it over? · Retargeting',
    purpose: 'Reach people who have visited the shop',
  },
] as const;
const windows = {
  previous: {
    start: '2026-07-10',
    end: '2026-08-06',
    label: 'Jul 10 – Aug 6, 2026',
    previousLabel: null,
  },
  current: {
    start: '2026-08-07',
    end: '2026-09-03',
    label: 'Aug 7 – Sep 3, 2026',
    previousLabel: 'Jul 10 – Aug 6, 2026',
  },
};
const dayMs = 86400000;
const sum = <T>(rows: T[], value: (row: T) => number) =>
  rows.reduce((total, row) => total + value(row), 0);
const ratio = (a: number, b: number) => (b === 0 ? null : a / b);
export const money = (value: number | null, decimals = 2) =>
  value === null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
export const change = (value: number, previous: number) =>
  previous
    ? `${value >= previous ? '+' : '−'}${Math.abs((value / previous - 1) * 100).toFixed(1)}%`
    : 'No comparison';

export function buildSyntheticData(): Dataset {
  let seed = 20260906;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  const orders: Order[] = [],
    touchpoints: Touchpoint[] = [],
    adDays: AdDay[] = [],
    refunds: Refund[] = [];
  const products = [
    { name: 'Undated weekly planner', cents: 3800 },
    { name: 'The everyday journal', cents: 2800 },
    { name: 'Desk reset bundle', cents: 8400 },
    { name: 'Planner + journal set', cents: 6200 },
    { name: 'The complete desk collection', cents: 12800 },
  ];
  const addOrder = (
    customerId: string,
    placedAt: string,
    status: Order['status'] = 'paid',
  ) => {
    const item = pick(products),
      quantity = random() > 0.9 ? 2 : 1,
      subtotalCents = item.cents * quantity;
    const order: Order = {
      id: `JP-${10401 + orders.length}`,
      customerId,
      placedAt,
      updatedAt: new Date(Date.parse(placedAt) + 60000).toISOString(),
      status,
      product: item.name,
      quantity,
      subtotalCents,
      discountCents: random() < 0.22 ? Math.round(subtotalCents * 0.1) : 0,
    };
    orders.push(order);
    if (status === 'paid' && random() < 0.065) {
      const full = random() < 0.4;
      refunds.push({
        id: `RF-${refunds.length + 801}`,
        orderId: order.id,
        at: new Date(
          Date.parse(placedAt) + (2 + Math.floor(random() * 9)) * dayMs,
        ).toISOString(),
        amountCents: full
          ? subtotalCents - order.discountCents
          : Math.round((subtotalCents - order.discountCents) * 0.3),
        reason: full ? 'Returned item' : 'Partial return / damaged item',
      });
    }
    return order;
  };
  const knownCustomers: string[] = [];
  // Earlier purchases establish returning buyers before either reporting window.
  for (let i = 0; i < 42; i++) {
    const id = `CUS-${1001 + i}`;
    knownCustomers.push(id);
    addOrder(
      id,
      new Date(Date.UTC(2026, 5, 1 + (i % 28), 12, i)).toISOString(),
    );
  }
  for (let d = 0; d < 56; d++) {
    const dateMs = Date.UTC(2026, 6, 10 + d),
      date = new Date(dateMs).toISOString().slice(0, 10);
    const current = d >= 28,
      weekday = new Date(dateMs).getUTCDay(),
      week = Math.floor((d % 28) / 7);
    campaigns.forEach((campaign, index) => {
      const base = [2800, 6900, 6000, 1900][index];
      const spendCents = Math.round(
        base *
          (0.84 + random() * 0.32) *
          (weekday === 0 ? 0.86 : 1) *
          (current && index >= 2 ? 1.055 : 1),
      );
      const cpc = [75, 165, current ? 170 + week * 13 : 131, 105][index];
      const clicks = Math.max(
        1,
        Math.round(spendCents / (cpc * (0.85 + random() * 0.3))),
      );
      const ctr = [6.4, 4.1, current ? 1.12 - week * 0.09 : 1.62, 2.4][index];
      adDays.push({
        date,
        campaignId: campaign.id,
        spendCents,
        clicks,
        impressions: Math.round(
          (clicks / (ctr / 100)) * (0.9 + random() * 0.2),
        ),
      });
    });
    const sources: Array<Source | null> = [];
    const googleCount =
      [1, 3, 3, 3, 3, 3, 2][weekday] + (current && d % 9 === 0 ? 1 : 0);
    const metaCount = current
      ? week === 0 && d % 3 === 0
        ? 2
        : d % 6 === 0
          ? 0
          : 1
      : [1, 2, 3, 2, 3, 2, 2][weekday];
    for (let j = 0; j < googleCount; j++) sources.push('Google');
    for (let j = 0; j < metaCount; j++) sources.push('Meta');
    sources.push(pick<Source>(['Email', 'Organic search', 'Referral']));
    if (d % 3 === 0) sources.push('Email');
    if (d % (current ? 2 : 3) === 0) sources.push(null);
    sources.forEach((source, j) => {
      const customerId = `CUS-${1001 + knownCustomers.length}`;
      knownCustomers.push(customerId);
      const placedAt = new Date(
        dateMs + (9 + j) * 3600000 + Math.floor(random() * 50) * 60000,
      ).toISOString();
      const order = addOrder(customerId, placedAt);
      const campaignId =
        source === 'Google'
          ? random() < 0.48
            ? 'google-brand'
            : 'google-planners'
          : source === 'Meta'
            ? random() < (current ? 0.55 : 0.75)
              ? 'meta-desks'
              : 'meta-return'
            : null;
      if (source && d % 4 === 0)
        touchpoints.push({
          id: `TP-${touchpoints.length + 1}`,
          customerId,
          at: new Date(Date.parse(placedAt) - 5 * dayMs).toISOString(),
          source: 'Meta',
          campaignId: 'meta-desks',
        });
      if (source)
        touchpoints.push({
          id: `TP-${touchpoints.length + 1}`,
          customerId,
          at: new Date(
            Date.parse(placedAt) - (2 + Math.floor(random() * 60)) * 3600000,
          ).toISOString(),
          source,
          campaignId,
        });
      if (!source && d % 4 === 0)
        touchpoints.push({
          id: `TP-${touchpoints.length + 1}`,
          customerId,
          at: new Date(Date.parse(placedAt) - 35 * dayMs).toISOString(),
          source: 'Google',
          campaignId: 'google-planners',
        });
      if (!source && d > 48)
        order.updatedAt = new Date(
          Date.parse(placedAt) + 2 * dayMs,
        ).toISOString();
    });
    for (let j = 0; j < 1 + (d % 3 === 0 ? 1 : 0); j++)
      addOrder(
        pick(knownCustomers.slice(0, 42 + Math.max(0, d - 8))),
        new Date(dateMs + (19 + j) * 3600000).toISOString(),
      );
    if (d % 5 === 0)
      addOrder(
        `GUEST-${d}`,
        new Date(dateMs + 21 * 3600000).toISOString(),
        d % 10 === 0 ? 'canceled' : 'payment_failed',
      );
  }
  // A duplicate delivery must not create a second sale.
  orders.push({
    ...orders[87],
    updatedAt: new Date(
      Date.parse(orders[87].updatedAt) + 120000,
    ).toISOString(),
  });
  return { orders, touchpoints, adDays, refunds };
}
export const syntheticData = buildSyntheticData();

export function uniqueAdDays(adDays: AdDay[]) {
  const unique = new Map<string, AdDay>();
  adDays.forEach((d) => {
    const key = d.date + ':' + d.campaignId,
      prior = unique.get(key);
    if (
      prior &&
      (prior.spendCents !== d.spendCents ||
        prior.clicks !== d.clicks ||
        prior.impressions !== d.impressions)
    )
      throw Error('Conflicting daily campaign record: ' + key);
    unique.set(key, d);
  });
  return [...unique.values()];
}

export function aggregateReport(
  data: Dataset,
  period: Period,
  snapshot = sampleBusiness.snapshot,
) {
  const window = windows[period];
  const inWindow = (date: string) =>
    date.slice(0, 10) >= window.start && date.slice(0, 10) <= window.end;
  const uniqueOrders = new Map<string, Order>();
  data.orders
    .filter((o) => o.updatedAt <= snapshot)
    .forEach((order) => {
      const prior = uniqueOrders.get(order.id);
      if (!prior || prior.updatedAt < order.updatedAt)
        uniqueOrders.set(order.id, order);
    });
  const allOrders = [...uniqueOrders.values()]
    .filter((o) => o.placedAt <= snapshot)
    .sort(
      (a, b) =>
        a.placedAt.localeCompare(b.placedAt) || a.id.localeCompare(b.id),
    );
  const firstOrders = new Map<string, string>();
  allOrders
    .filter((o) => o.status === 'paid')
    .forEach((o) => {
      if (!firstOrders.has(o.customerId)) firstOrders.set(o.customerId, o.id);
    });
  const rows = allOrders
    .filter((o) => inWindow(o.placedAt))
    .map((order) => {
      const touches = data.touchpoints
        .filter(
          (t) =>
            t.customerId === order.customerId &&
            t.at <= order.placedAt &&
            Date.parse(order.placedAt) - Date.parse(t.at) <= 28 * dayMs,
        )
        .sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id));
      const lastTouch = touches[0] ?? null,
        isNew =
          order.status === 'paid' &&
          firstOrders.get(order.customerId) === order.id;
      const orderRefunds = [
        ...new Map(
          data.refunds
            .filter((r) => r.orderId === order.id && r.at <= snapshot)
            .map((r) => [r.id, r]),
        ).values(),
      ];
      const refundCents = sum(orderRefunds, (r) => r.amountCents),
        salesCents =
          order.status === 'paid'
            ? order.subtotalCents - order.discountCents
            : 0;
      const olderTouch = data.touchpoints.some(
        (t) => t.customerId === order.customerId && t.at < order.placedAt,
      );
      return {
        ...order,
        isNew,
        source: lastTouch?.source ?? null,
        campaignId: lastTouch?.campaignId ?? null,
        lastTouch,
        refundCents,
        salesCents,
        netCents: salesCents - refundCents,
        refunds: orderRefunds,
        missingReason: lastTouch
          ? null
          : olderTouch
            ? 'Recorded visit is outside the 28-day window'
            : 'No source recorded at checkout',
      };
    });
  const newRows = rows.filter((o) => o.isNew),
    paidRows = newRows.filter(
      (o) => o.source === 'Meta' || o.source === 'Google',
    );
  const days = uniqueAdDays(data.adDays).filter(
    (d) => inWindow(d.date) && d.date <= snapshot.slice(0, 10),
  );
  const campaignReports = campaigns.map((c) => {
    const campaignDays = days.filter((d) => d.campaignId === c.id),
      customers = paidRows.filter((o) => o.campaignId === c.id).length;
    const spendCents = sum(campaignDays, (d) => d.spendCents),
      clicks = sum(campaignDays, (d) => d.clicks),
      impressions = sum(campaignDays, (d) => d.impressions);
    return {
      ...c,
      spendCents,
      spend: spendCents / 100,
      clicks,
      impressions,
      customers,
      cost: ratio(spendCents / 100, customers),
      ctr: ratio(clicks * 100, impressions),
      cpc: ratio(spendCents / 100, clicks),
    };
  });
  const channels = (['Google', 'Meta'] as const).map((name) => {
    const reports = campaignReports.filter((c) => c.platform === name),
      customers = newRows.filter((o) => o.source === name).length,
      spendCents = sum(reports, (c) => c.spendCents);
    return {
      name,
      label: name === 'Google' ? 'Google Ads' : 'Meta Ads',
      spendCents,
      spend: spendCents / 100,
      customers,
      cost: ratio(spendCents / 100, customers),
    };
  });
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const start = new Date(
        Date.parse(window.start + 'T00:00:00Z') + i * 7 * dayMs,
      )
        .toISOString()
        .slice(0, 10),
      end = new Date(Date.parse(start + 'T00:00:00Z') + 6 * dayMs)
        .toISOString()
        .slice(0, 10);
    const spendCents = sum(
        days.filter((d) => d.date >= start && d.date <= end),
        (d) => d.spendCents,
      ),
      customers = paidRows.filter(
        (o) =>
          o.placedAt.slice(0, 10) >= start && o.placedAt.slice(0, 10) <= end,
      ).length;
    return {
      start,
      end,
      spendCents,
      customers,
      cost: ratio(spendCents / 100, customers),
    };
  });
  const spendCents = sum(days, (d) => d.spendCents),
    unknownCustomers = newRows.filter((o) => !o.source).length,
    salesRows = rows.filter((o) => o.status === 'paid');
  return {
    ...window,
    asOf: snapshot,
    rows: rows.reverse(),
    campaigns: campaignReports,
    channels,
    weeks,
    adRows: days.length,
    spendCents,
    spend: spendCents / 100,
    cost: ratio(spendCents / 100, paidRows.length),
    paidCustomers: paidRows.length,
    totalCustomers: newRows.length,
    otherCustomers: newRows.length - paidRows.length - unknownCustomers,
    unknownCustomers,
    googleCustomers: channels[0].customers,
    metaCustomers: channels[1].customers,
    googleCost: channels[0].cost,
    metaCost: channels[1].cost,
    googleSpend: channels[0].spend,
    metaSpend: channels[1].spend,
    weeklyCustomers: weeks.map((w) => w.customers),
    coverage: newRows.length
      ? ((newRows.length - unknownCustomers) / newRows.length) * 100
      : 0,
    paidOrders: salesRows.length,
    repeatOrders: salesRows.filter((o) => !o.isNew).length,
    excludedOrders: rows.filter((o) => o.status !== 'paid').length,
    salesCents: sum(salesRows, (o) => o.salesCents),
    refundCents: sum(salesRows, (o) => o.refundCents),
    netSalesCents: sum(salesRows, (o) => o.netCents),
    refundedOrders: salesRows.filter((o) => o.refundCents > 0).length,
    impressions: sum(days, (d) => d.impressions),
    clicks: sum(days, (d) => d.clicks),
  };
}
export type Report = ReturnType<typeof aggregateReport>;
export const periods = {
  current: aggregateReport(syntheticData, 'current'),
  previous: aggregateReport(syntheticData, 'previous'),
};
export const reportFor = (period: Period) => periods[period];
export function findingFor(current: Report, previous: Report) {
  const mature =
    Date.parse(current.asOf) - Date.parse(current.end + 'T23:59:59Z') >=
    2 * dayMs;
  const needsReview =
    mature &&
    current.coverage >= 85 &&
    current.metaCost !== null &&
    previous.metaCost !== null &&
    current.metaCustomers >= 20 &&
    current.metaCost > sampleBusiness.target &&
    current.metaCost > previous.metaCost * 1.25;
  const reason = !mature
    ? 'incomplete_period'
    : current.coverage < 85 ||
        current.metaCustomers < 20 ||
        previous.metaCost === null
      ? 'insufficient_data'
      : needsReview
        ? 'review_performance'
        : 'no_action';
  return {
    needsReview,
    reason,
    bestCaseMetaCost: ratio(
      current.metaSpend,
      current.metaCustomers + current.unknownCustomers,
    ),
    extraCustomersToTarget: Math.max(
      0,
      Math.ceil(current.metaSpend / sampleBusiness.target) -
        current.metaCustomers,
    ),
    title: needsReview
      ? 'Review Meta before increasing its budget.'
      : reason === 'no_action'
        ? 'No material budget warning in these records.'
        : 'Wait for sufficient, complete records before deciding.',
    finding: `Meta’s ad cost per new customer changed from ${money(previous.metaCost)} to ${money(current.metaCost)}. Google is at ${money(current.googleCost)}.`,
    basis: `Meta spent ${money(current.metaSpend)} and was linked to ${current.metaCustomers} new customers, compared with ${previous.metaCustomers} in the earlier period. Its cost per customer is ${money(current.metaCost)}, against this shop’s ${money(sampleBusiness.target, 0)} target.`,
    limits: `${current.unknownCustomers} new customers have no eligible source. Missing tracking and late records could change this result. A recorded click does not prove an ad caused the purchase.`,
  };
}
export const demoFinding = findingFor(periods.current, periods.previous);
