# Daymark

An early marketing-intelligence product preview. Working name; brand clearance has not been assessed.

## Routes

- `/`: product website and early-access entry point.
- `/demo`: interactive fictional business brief, period comparison, evidence, decisions, and planned connections.
- `/login`: platform-supported Sign in with ChatGPT.
- `/workspace`: authenticated pilot profile, saved in D1 with ownership enforced on the server.
- `/privacy`: preview-specific data handling explanation.
- `/api/workspace`: authenticated read, save, and deletion of the current user's profile.

## What is real

Profile persistence, input validation, contact preference, per-account ownership, deletion, and the Sites authentication integration. The local Sites plugin uses a synthetic local identity only after local sign-in. Hosted identity comes from trusted Sites dispatch headers; do not expose the Worker behind this authentication gateway directly.

## What is a demonstration

All June Paper Co. metrics and recommendations are fictional. Reviewing a demo decision only changes state for the current visit. No ads, budgets, emails, payments, external marketing accounts, or real customer records are accessed. The planned-connection cards do not run OAuth. Source matching illustrates a stated last-click rule; it is not an implemented attribution pipeline and does not establish causality.

## Local development

Page navigation uses `components/site-link.tsx`, a native anchor. Vinext 1.0.0-beta.5's production Link bundle was observed throwing `TypeError: e is not a function` after intercepting the click, while direct page loads and demo controls worked. Keep native navigation until a framework update is verified in the hosted browser. This deliberately trades client route transitions for reliable page entry.

Use the locked package versions. Run `pnpm install`, `pnpm dev`, and use the platform's local sign-in. Generate schema changes with `pnpm db:generate`. The D1 binding is configured in `.openai/hosting.json`; generated migrations are deployed with the site. Local migrations can be applied with Wrangler after a build using its generated server config and the same `.wrangler/state` persistence directory.

Validation: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`. With the local server and migration applied, `node tests/api-smoke.mjs` exercises synthetic account persistence and authentication/error boundaries. It refuses to overwrite an existing local profile and removes its fixture.

The demo feature-detects WebMCP and exposes a read-only fictional report tool. A supported browser contract check is not yet recorded; WebMCP is not required for the product to operate.

## Before an external pilot

Choose the first supported buyer and data workflow. Add actual authorized imports, durable snapshots, idempotency, freshness/error states, and reconciled customer outcomes. Test real sign-in in the chosen public hosting context, define retention and pilot terms, and use an appropriate public URL. The current Sites release is owner-only and cannot serve as a prospect-facing link until access is deliberately changed.
