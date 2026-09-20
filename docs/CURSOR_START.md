# Continue Daymark in Cursor

Daymark's sellable outcome is a desk: who to email, who to stop, who to leave alone, from payments and signups. Zapier is optional intake, not the product. The marketing sample stays labeled fiction. Read docs/PRODUCT_AUDIT.md before changing the pitch.

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

Open the operator at the printed URL, normally http://localhost:3000/operator. The labeled marketing sample is /demo. Keep that terminal running. In a second terminal:

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

| Area               | Implemented                                                                                     | Still required for real use                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Operator           | Ingest API, playbooks, sample key, license redeem, hashed workspace keys                        | Hosted `DAYMARK_LICENSE_SECRET`, a real Whop listing, buyer traffic                    |
| Offer checks       | API compares confirmed terms with fictional basket rules; failed/verified/inconclusive outcomes | Authorized store adapter and real browser observations                                 |
| Corrections        | Separate original/corrected scenarios and fresh rechecks                                        | Observe changes made in the actual store                                               |
| History            | Last 20 sample check inputs/timestamps in tab session storage; latest 6 displayed               | Server-owned offer-check history. Operator events persist when a workspace key is used |
| Marketing analysis | Deterministic record-based reports, refunds, source matching, missing-data bounds               | Authorized imports, freshness, reconciliation and error handling                       |
| Accounts           | Sites sign-in, tenant-owned profiles, optional operator trial                                   | Production memberships beyond hashed licenses                                          |
| Monitoring         | User-triggered fictional check                                                                  | Scheduler, timeouts, retries, concurrency and operating-cost limits                    |

## First task for Cursor

Use this as an initial agent prompt:

> Read AGENTS.md, README.md, docs/CURSOR_START.md and docs/PRODUCT_AUDIT.md. Run the existing checks and report any failures before editing. Preserve Daymark's current UI. Do not present the sample report or sample ingest as live customer evidence. Do not invent Whop listings, license secrets, or OAuth connections. If the task is commercial, work on the operator and Whop fulfillment, not a store pilot.

## Milestones and acceptance criteria

1. **Operator a stranger can use.** Public ingest URL, a redeemed license or trial key, one Zapier POST, a Filter on `action`, and a stored decision that is not the sample key.
2. **Whop fulfillment.** Issued license keys, hashed redeem, Starter vs Operator entitlements, no invented listing.
3. **One real offer (later, not the $19 SKU).** Confirm exact terms before execution. Collect real cart evidence and time of observation. A deliberately wrong promotion on the test store must fail. Unreachable pages stay inconclusive.
4. **Do not claim causation or savings.** Campaign spend is context. Last recorded source is not cause. Sample cart checks are not browser checks.

## Where to work

- `app/operator/`: live operator console.
- `lib/operator.ts`: playbooks and decisions.
- `app/api/operator/ingest/route.ts`: Zapier boundary.
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
