# Daymark contributor guidance

Read README.md and docs/CURSOR_START.md before changing behavior. This is an existing Vinext/React application; preserve its visual design, pinned dependencies, lockfile and Sites configuration. Do not regenerate the app or migrate frameworks as an onboarding step.

- Start with git status. Preserve unrelated work and make small, verified changes.
- Keep fictional records visibly labeled. Sample cart checks are not real browser checks. Never present campaign spend as money lost/saved or last recorded source as causation.
- Existing production authentication requires the Sites dispatch gateway. Local identity is synthetic. Do not trust those identity headers on a directly exposed standalone Worker.
- Native anchors in components/site-link.tsx are intentional: this pinned Vinext release previously broke production client navigation.
- Money is integer USD cents; report dates are UTC; duplicates must not inflate counts. Unknown sources stay unknown. An unavailable or incomplete check is inconclusive.
- pnpm check runs types, lint, unit tests and a production build. With pnpm dev running, use pnpm test:api. Initialize a fresh local profile database with pnpm db:local, then run pnpm test:profile. The profile test refuses to overwrite an existing local profile.
- No secrets, database files, node_modules, generated builds or real customer exports belong in Git. Do not invent credentials, OAuth connections or live evidence.
- GitHub is the development remote. A GitHub push does not update the hosted Site. Use the existing Sites project for separately requested deployment; never create a replacement Site because you cloned this repository.
- First production milestone: one authorized test store, one precisely defined offer, a real failed basket check, then a new passing check after the actual store is fixed. Preserve both observations. Do not submit payment.

For the current task, follow the user's explicit scope and authorization. Inspect the diff and report the tests run before handing work back.
