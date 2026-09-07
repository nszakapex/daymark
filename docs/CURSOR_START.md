# Continue Daymark in Cursor

Daymark's proposed outcome is to find when a marketing promise fails in the customer's journey, show the evidence and associated campaign spending, and verify the correction. The current release demonstrates that workflow with a fictional store. Real monitoring still needs implementation and validation.

## Open this prepared checkout

On Nate's computer, use the Ubuntu-24.04 terminal:

```bash
cd /home/nates/projects/daymark
cursor daymark.code-workspace
```

The project lives in WSL; Cursor runs on Windows. Use Cursor's integrated WSL terminal for commands. If Node is missing in a fresh terminal, run `source ~/.nvm/nvm.sh` followed by `nvm use`. The initial checkout's dependencies and local database are prepared by the GitHub handoff task.

## Start and check

```bash
pnpm dev
```

Open the local URL printed by the server, normally http://localhost:3000/demo. Keep that terminal running. In a second terminal:

```bash
pnpm check
pnpm test:api
pnpm test:profile
```

`check` covers types, lint, unit tests and a production build. The API tests require the local development server. The profile test creates, edits, reloads and deletes a synthetic profile; it refuses to overwrite an existing profile. Do not point it at a customer environment.

Cursor also exposes these commands under **Terminal → Run Task → Daymark**.

## Fresh machine

Use Node 24 LTS, Git and Corepack. Clone the private GitHub repo with your own authorized account, then:

```bash
nvm use
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm db:local
pnpm dev
```

`db:local` applies tracked migrations only to the project-local D1 emulator. It is safe to repeat after this setup. An older local database initialized by directly executing SQL may lack migration history; preserve that data and resolve its migration baseline before applying this command. A fresh clone has no local database or customer data.

## What works today

| Area | Implemented | Still required for real use |
| --- | --- | --- |
| Offer checks | API compares confirmed terms with fictional basket rules; failed/verified/inconclusive outcomes | Authorized store adapter and real browser observations |
| Corrections | Separate original/corrected scenarios and fresh rechecks | Observe changes made in the actual store |
| History | Last 20 sample check inputs/timestamps in tab session storage; latest 6 displayed | Server-owned run history and evidence retention |
| Marketing analysis | Deterministic record-based reports, refunds, source matching, missing-data bounds | Authorized imports, freshness, reconciliation and error handling |
| Accounts | Sites sign-in and tenant-owned early-access profiles in D1 | Production business memberships, offers, runs and connector ownership |
| Monitoring | User-triggered fictional check | Scheduler, timeouts, retries, concurrency and operating-cost limits |

## First task for Cursor

Use this as an initial agent prompt:

> Read AGENTS.md, README.md and docs/CURSOR_START.md. Run the existing checks and report any failures before editing. Preserve Daymark's current UI. Plan the smallest real offer-checking path for one authorized Shopify test store: explicit product, quantity, discount, market and expected benefit; actual observed cart evidence; failed, passed and inconclusive outcomes; persisted original and subsequent runs. Identify the credentials or test-store access required. Do not call a simulation live, invent credentials, submit payment, or replace the application framework. Start with the first bounded implementation that can be tested locally while access is being arranged.

## Milestones and acceptance criteria

1. **One real offer.** Confirm exact terms before execution. Collect real cart evidence and time of observation. A deliberately wrong promotion on the test store must fail. Fixing the store must yield a new passing observation. Unreachable pages, challenge pages and missing terms must remain inconclusive.
2. **Reliable history.** Add tenant-owned offers, terms versions, runs, step evidence and scheduler state. Verify cross-account isolation, idempotent retries, timeouts and stale evidence. Keep both original and corrected results.
3. **Business context.** Add one read-only advertising connector and explicit campaign-to-offer mapping. Compare imported totals with the platform's report. Show freshness and associated spend; do not claim saved money from exposure alone.
4. **Pilot proof.** Measure real issues found, time to correction, false alarms, repeat usage and cost per check. Price from demonstrated value and operating costs before expanding integrations.

## Where to work

- `app/workspace-ui.tsx`: main workspace and reporting views.
- `components/offer-checks.tsx`: offer selection, check results and next steps.
- `lib/offer-checks.ts`: fictional cart model and comparison logic.
- `app/api/sample-check/route.ts`: current sample-only API boundary.
- `lib/synthetic-data.ts`: seeded records, reporting rules and recommendations.
- `components/use-offer-history.ts`: temporary sample session history.
- `db/schema.ts` and `app/api/workspace/route.ts`: existing account-owned profile persistence.
- `.openai/hosting.json`: original Sites project binding. Preserve it.

## Hosting boundaries

GitHub stores source and runs checks; it does not deploy the current Site. Local `pnpm dev` supplies a synthetic identity through the Sites development plugin. The hosted application receives trusted identity headers from the Sites gateway. `pnpm start` is a built Worker preview and does not independently supply that gateway. Verify authentication before any separately requested move to another host.
