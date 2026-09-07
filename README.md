# Daymark

An early marketing-intelligence product preview. Working name; brand clearance has not been assessed.

## Routes

- `/`: product website and early-access entry point.
- `/demo`: fictional offer checks, campaign performance, source evidence, order activity, decisions, and planned connections.
- `/sample-store`: fictional basket calculated using the same promotion rules as the offer checker; no orders or payments.
- `/api/sample-check`: validates a requested sample scenario and returns computed cart evidence; no external account access.
- `/login`: platform-supported Sign in with ChatGPT.
- `/workspace`: authenticated early-access details, saved in D1 with ownership enforced on the server; confirmation, edit, cancel, and deletion flows.
- `/privacy`: preview-specific data handling explanation.
- `/api/workspace`: authenticated read, save, and deletion of the current user's profile.

## What is real

Profile persistence, input validation, contact preference, per-account ownership, deletion, and the Sites authentication integration. The local Sites plugin uses a synthetic local identity only after local sign-in. Hosted identity comes from trusted Sites dispatch headers; do not expose the Worker behind this authentication gateway directly.

## What is a demonstration

All June Paper Co. records, offers, metrics, and recommendations are fictional. A seeded fixture contains daily advertising records, first and repeat purchases, canceled/failed orders, discounts, partial/full refunds, duplicate deliveries, late updates, and missing/expired source records. Reports derive from those records rather than hand-entered totals. Amounts use integer USD cents and UTC reporting dates. Orders deduplicate by ID and latest update as of the snapshot; daily ad records deduplicate by campaign/date and reject conflicts. Source assignment uses the last recorded pre-purchase marketing touch within 28 days. Unknown sources remain unknown. Fully refunded first purchases still count as acquired customers; net merchandise sales subtract recorded refunds and exclude shipping/tax. This is a sample accounting model, not an external ingestion system or causal attribution claim.

Offer checks compare confirmed terms with a fictional cart model. The planner begins with a deliberately incorrect eligibility rule; choosing the corrected setup requires a fresh check. Missing shipping market or unreachable checkout stays inconclusive. Campaign spending is context, not a claimed loss or saving. No real browser journeys, device checks, payment tests, scheduled monitoring, ads, budgets, emails, external accounts, or actual customer records are accessed. Planned connection cards do not run OAuth.

Sample check inputs and timestamps are retained in this tab's session storage; the latest six checks are shown from a maximum of twenty. Returning from the sample cart retains that history. The three-step review checklist uses local storage independently of account identity. Both have reset controls and fall back to page-lifetime memory when storage is unavailable. Neither history is a server audit trail.

## Local development

Page navigation uses `components/site-link.tsx`, a native anchor. Vinext 1.0.0-beta.5's production Link bundle was observed throwing `TypeError: e is not a function` after intercepting the click, while direct page loads and demo controls worked. Keep native navigation until a framework update is verified in the hosted browser. This deliberately trades client route transitions for reliable page entry.

Use the locked package versions. Run `pnpm install`, `pnpm dev`, and use the platform's local sign-in. Generate schema changes with `pnpm db:generate`. The D1 binding is configured in `.openai/hosting.json`; generated migrations are deployed with the site. Local migrations can be applied with Wrangler after a build using its generated server config and the same `.wrangler/state` persistence directory.

Validation: `node --test tests/data.test.mjs tests/offer-checks.test.mjs`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`. With the local server running, `node tests/campaign-api-smoke.mjs` checks offer outcomes, invalid input, cache behavior and sample routes. With the local migration applied, `node tests/api-smoke.mjs` exercises synthetic account persistence and authentication/error boundaries. It refuses to overwrite an existing local profile and removes its fixture.

The demo feature-detects WebMCP and exposes a read-only fictional report tool. WebMCP is not required for the product to operate. Customer journey checks cover the sample review, evidence and date controls, browser-local progress, mobile menu, and synthetic-account create/edit/cancel/reload/delete flows. Hosted entry navigation is verified after publication.

## Before an external pilot

Choose the first supported buyer and data workflow. Add actual authorized imports, durable snapshots, idempotency, freshness/error states, and reconciled customer outcomes. Test real sign-in in the chosen public hosting context, define retention and pilot terms, and use an appropriate public URL. The current Sites release is owner-only and cannot serve as a prospect-facing link until access is deliberately changed.
