# Ship Daymark on Whop

Do this only when the operator ingest is on a public URL you control. A GitHub push does not publish the Site.

## Products to create

1. **Daymark Starter** — one-time, $49. Digital product with license-key fulfillment.
2. **Daymark Operator** — recurring, $19/month. Membership with license-key fulfillment on each period.

Copy you can paste:

> Daymark is a morning desk for failed payments, new buyers, and refunds. Open it and see who to email once, who to stop, and who to leave alone. Stripe can fill the list. Zapier is optional. It will not invent a buyer or a reason a campaign worked.

Do not promise live ad connections or cart monitoring.

## Keys

On the host, set a long random `DAYMARK_LICENSE_SECRET` (16+ characters). Do not commit it.

From this repo:

```bash
DAYMARK_LICENSE_SECRET='your-secret' pnpm license:issue -- --plan starter
DAYMARK_LICENSE_SECRET='your-secret' pnpm license:issue -- --plan operator
```

Upload the printed keys to Whop’s license list. The buyer redeems at `/operator`. Daymark stores only a hash.

Operator licenses expire after 35 days unless you pass `--days`. When a month renews, issue or redeem again.

Optional:

- `DAYMARK_WHOP_URL` — public listing. The Buy button stays off until this exists.
- `WHOP_WEBHOOK_SECRET` — enables signature checks on `POST /api/operator/whop`. The webhook does not email keys and does not invent a membership.
- `DAYMARK_PUBLIC_URL` — canonical origin if the request host is wrong behind a proxy.

## Buyer path

1. They pay on Whop and receive a `dm1...` key.
2. They open `/operator`, paste the key, copy the `dmws_...` workspace token once.
3. In Zapier: Webhooks by Zapier → POST to `/api/operator/ingest` with `Authorization: Bearer dmws_...`.
4. Filter: continue only when `action` is `fire` or `escalate`.
5. They can prove the mapping first with `Authorization: Bearer dm_sample` (no storage).

## What you are not selling

Credentials you do not have, OAuth you have not built, and “proof the deal worked.” If a buyer asks for the sample marketing report as their live numbers, tell them it is fiction.
