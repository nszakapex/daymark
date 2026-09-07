# Campaign checks release verification — 2026-09-07

Local verification completed against the seeded June Paper Co. scenario:

- Eleven automated tests pass, covering report reconciliation, duplicate delivery, conflicting ad rows, first purchases, UTC period boundaries, last eligible source, refunds, empty/immature data, profile validation and offer outcomes.
- Sample API checks pass for failed, verified and inconclusive scenarios; invalid input, malformed JSON, request size, no-store response and GET rejection; sample routes return successfully.
- Type checking, lint and production build pass.
- Browser: original planner discount fails; corrected setup is unverified until a fresh run, then shows the expected $7.60 discount. The separate cart displays a $35.90 total before tax. Returning retains original failure and corrected result.
- Browser: free gift passes; unknown shipping region is inconclusive; confirming US shipping requires a new check and then passes. Unavailable checkout remains inconclusive. Copy next step works.
- Browser: missing-source filter returns 14 records across two pages; changing the date range resets the filter/page and shows 224 earlier-period records. Order details expand; report and campaign comparisons change with the selected dates.
- Desktop and phone layouts visually inspected. Phone offer/report views have no horizontal page overflow; mobile navigation closes on selection. No browser console errors observed in the verified local session.

Scope: fictional cart-rule evaluation and deterministic sample records only. No live merchant integration, browser/device/payment monitoring, scheduled checks or actual ad changes. Session history is a sample convenience, not a durable server audit log. Authentication and profile storage were unchanged in this release.
