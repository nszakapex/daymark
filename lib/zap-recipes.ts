export const zapRecipes = [
  {
    id: 'failed-payment',
    title: 'Recover a failed payment once',
    zapierCost: 'One Zap',
    steps: [
      'Trigger: Stripe “Charge Failed”, Whop payment failed, or Shopify failed checkout.',
      'Action: Webhooks by Zapier → POST to your Daymark ingest URL.',
      'Map email, amountCents, occurredAt, and productName. Send the raw Stripe event if that is easier; Daymark reads it.',
      'Filter: continue only when action is fire.',
      'Action: send one recovery email or DM. Do not add a digest, blast, or second wait in the same Zap.',
    ],
  },
  {
    id: 'new-buyer',
    title: 'Route a new buyer by product',
    zapierCost: 'One Zap',
    steps: [
      'Trigger: paid checkout, new Whop membership, or paid Shopify order.',
      'POST the event to Daymark.',
      'Filter: continue only when action is fire.',
      'Paths or Filters in Zapier: use productId from Daymark’s outbound object to pick the welcome sequence.',
      'If Daymark returns inconclusive, fix the mapping. Do not send a generic welcome “just in case.”',
    ],
  },
  {
    id: 'refund-watch',
    title: 'Stop access after a refund',
    zapierCost: 'Operator plan',
    steps: [
      'Trigger: refund created or Shopify order refunded.',
      'POST to Daymark.',
      'Filter: continue when action is fire.',
      'Action: remove the member, cancel the shipment, or close the license. This is not a marketing email.',
    ],
  },
  {
    id: 'stale-lead',
    title: 'Follow up only after a real wait',
    zapierCost: 'Operator plan',
    steps: [
      'Trigger: form submitted.',
      'POST to Daymark with no hoursSince. The first decision should be hold.',
      'Zapier Delay for 24 hours.',
      'POST the same lead again with hoursSince set to 24 or more, and alreadyCustomer if they purchased.',
      'Filter: continue only when the second decision is fire.',
    ],
  },
] as const;
