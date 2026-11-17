# KHANZAMA implementation rules

## Design and product contract

- Match the desktop and mobile references in `docs/design/khanzama-workspace/pages/`.
- Read `ROLES.md`, `PAGE_REVIEW.md`, and `SPEC.md` in that directory. Their business rules override incidental generated image text.
- There are two workspaces: platform administration and the customer cabinet. CRM uses the customer cabinet with an unlimited package; it never gains platform administration through its package.
- Use real repository data. Missing analytics, storage capacity, backups, sessions, or active working time must be shown as unavailable, never invented.
- Preserve server authorization, MFA, account scope, consumable creation credits, processing jobs, signed media URLs, and existing printed QR links.
- Editing an existing work does not spend a new creation. Deleting a work does not refund a creation.
- QR opens the viewer; recognition uses the photograph itself. Do not modify tracking mathematics as part of UI work.
- Routine viewing and editing do not require a manually entered reason. Destructive actions retain meaningful confirmation and automatic audit records.

## Current parallel ownership

- Lead: `src/app/**`, `src/styles.css`, auth UI, shared integration, tests, documentation, release.
- `admin_workspace`: `src/features/admin/**` and scoped administration CSS.
- `account_workspace`: dashboard, catalog, analytics, profile, settings, and support feature directories.
- `media_workspace`: ar-items, media, qr, public-ar, and quick-start feature directories.
- Ask the lead before changing another owner's files. Agents do not commit, push, deploy, or run full builds concurrently. Report changed files and validation gaps to the lead.

## Verification and release

- Preserve unrelated dirty and untracked files; never reset or clean for convenience.
- Use the project's Node 22 version. Run checks and builds sequentially when they write shared output.
- Check real user journeys, loading/empty/error states, keyboard operation, and narrow layouts at 319/390px as well as desktop.
- Compare rendered screens to the PNG references; a passing build alone does not prove design fidelity.
- Keep heavy media and AR code lazy loaded and respect existing bundle budgets.
- The lead commits the tested integration, pushes it, verifies CI for the exact commit, and reports deployment and browser verification separately.
- Keep credentials outside Git. Do not disable MFA or change passwords as part of interface work.
