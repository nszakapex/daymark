# Acre portfolio preview

This separate Vercel target renders the existing fictional Daymark workspace and sample cart. The original Vinext/Sites application, account routes, Cloudflare bindings, package versions, and lockfile remain in place.

Run `pnpm build:demo` to build the static UI. Vercel serves only `/`, `/demo`, `/sample-store`, `/privacy`, assets, and the fixture-only `POST /api/sample-check`. The sample API reuses the original route and has no database or credentials. `/workspace`, `/login`, and `/api/workspace` are intentionally absent from this target; no trusted Sites authentication headers are accepted.

The only UI difference is `Workspace`'s optional `publicPreview` property, which replaces early-access account links with sample information. Existing Sites routes use the unchanged default. Do not add production credentials to this project. Do not mistake a successful sample check for a real store check or a connected account.

Publish this branch only to the dedicated Daymark public-demo Vercel project. A GitHub push does not modify the original Sites release. Keep that release's access controls unchanged.
