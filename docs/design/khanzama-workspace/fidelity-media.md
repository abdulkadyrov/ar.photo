# Media / AR / QR fidelity audit

References reviewed: all ten PNG sheets below, plus AGENTS.md, ROLES.md, PAGE_REVIEW.md and SPEC.md. Reference rectangles are measured inside the sheet's application frame, excluding the explanatory sheet title and outer page margin. Viewports below are CSS pixels; generated imagery and illustrative names/numbers are not copied into production data.

## Route / state / viewport matrix

| Reference           | Route and required state                                           | Desktop viewport | Phone viewport |
| ------------------- | ------------------------------------------------------------------ | ---------------- | -------------- |
| account-items       | `/items`, own uploaded/published works, all-project group metadata | 1292×808         | 422×808        |
| account-item-detail | `/items/:id`, published work with photo/video/QR                   | 1104×929         | 394×929        |
| account-create      | `/create`, name plus selected photo/video, before submission       | 1093×941         | 405×941        |
| account-edit        | `/items/:id/edit`, existing published work, unchanged              | 1110×932         | 366×932        |
| account-media       | `/media`, actual uploaded files in the chosen project              | 1084×901         | 411×901        |
| account-qr-list     | `/qr-codes`, own published work and actual QR                      | 1102×885         | 425×885        |
| account-qr-detail   | `/items/:id/qr`, published QR and URL print options                | 1084×883         | 407×883        |
| viewer-camera       | `/camera`, before camera permission                                | 1204×752         | 462×752        |
| viewer-public       | `/ar/demo`, public introduction, camera not started                | 1233×805         | 399×805        |
| viewer-unsupported  | `/unsupported`, unsupported-browser instructions                   | 996×881          | 412×881        |

Additional narrow verification: 319px account detail / creation / QR and public introduction after the reference-viewport pass.

## Top deviations identified before implementation

1. Creation remains a tall stack of cards and large mobile previews rather than the compact photo/video rows shown in the phone reference; crop/montage actions occupy a separate oversized section.
2. Existing-work editor has a wizard summary column, title/description before the materials and full-size previews; the reference has an identity strip, compact materials, then information/settings and a clear action footer.
3. Work detail puts a large QR and timer above its link; desktop reference divides QR and sharing within one horizontal panel, and the phone reference uses a compact QR/link row. Work metadata is absent.
4. Work and QR lists use separate generic cards instead of shared table-like column alignment on desktop. Group/status/actions need stable columns while the phone keeps compact actionable cards.
5. Media upload controls dominate the page and the files panel is not a real full-width file table. The reference is a library first, with a separate upload action and compact project/type/status/search controls.
6. Public-camera introduction uses a large empty camera icon instead of the reference's informative two-column permission surface. Unsupported browser is a generic list rather than the centered icon/title/actions/browser-guidance composition.
7. The public introduction approximates the two-column hero but its phone ordering and help-step layout differ. Camera image tracking and the QR → project → photograph → video flow must remain unchanged.

## Evidence

The repository audit fixture creates its content through the real demo upload/processing/publication journey. `public/test-assets/test.jpg` and the H.264 fixture are used as explicit QA assets; no invented production analytics or copied concept counts are introduced. Screenshots are stored separately under `/tmp/khanzama-fidelity/media/before` and `/tmp/khanzama-fidelity/media/after`; the machine-readable matrix records route, viewport, page dimensions and relevant controls. This is a visual comparison, not a claim that every backend/state or camera hardware has been tested.

## Implemented changes and verification

- **AR works:** one aligned desktop table with photo/name/group/status/actions; compact phone cards retain separate Open/Edit buttons and a readable group chip. Project/group/status/search filters remain in the URL and account-scoped group lookup works across projects.
- **Work detail:** a real project/date description, actual processing time, photo/video panels with associated photo poster, side-by-side QR/share desktop panel, compact phone QR/link/actions, SVG download of the existing QR, and actual file metadata. The large dialog still displays the complete original with `object-fit: contain`; only card thumbnails crop. The reference-viewport audit explicitly checks that the complete QR publication panel ends above bottom navigation at 394×929.
- **Create:** selected file previews use compact phone rows and full desktop cards. The existing crop/montage controls are portalled into their file cards, keeping the same editor logic and labels. Comparison and playback preferences are inside the one advanced-settings disclosure. The audit actually opens and closes both native editors and reveals the comparison slider before publishing its fixture.
- **Edit:** identity strip, credit explanation, materials first, information/settings below, then Save/Cancel. Phone identity uses a stable two-column grid and the action footer remains reachable above bottom navigation. Existing revision/processing/save handlers are reused.
- **Media:** an account-scoped library first; actual project/type/status/search/sort/view controls; aligned desktop columns and compact phone cards. Upload destinations and resumable queue are behind the header upload action. Actual uploads, retry and preview remain connected to the original repositories.
- **QR list:** real QR thumbnails and signed photo thumbnails, actual group/project/status/date, checkbox selection, batch print, SVG download, a work/edit action disclosure. The phone removes the duplicate Create action because Create is already in bottom navigation.
- **QR publication:** own photo/title/status identity, white printable QR with KHANZAMA caption, separate URL/actions and print cards, two-column desktop print fields. Caption/size/disclosure choices stay in the URL; published identifiers and existing QR URLs are not rewritten. PDF uses the browser print dialog, explicitly labelled `Печать / PDF`.
- **Camera:** reference-style explanation/permission composition. The permission action invokes the real scanner. The QA-only demo example photo is visibly labelled as an example with camera not yet active; production uses a neutral illustration rather than inventing a live camera feed. No tracking mathematics changed.
- **Public viewer:** real manifest photo/title, matching desktop hero and phone order, compact help steps, actual camera/video actions and privacy link preserving `viewerPath`.
- **Unsupported browser:** centered browser/camera illustration, title/explanation, browser guide and three feature notes. A valid `publicSlug` gives real Copy Link and ordinary-video actions after its public manifest permits fallback. Direct `/unsupported` without a work context keeps guidance rather than inventing a video target. Both contextual variants are additionally captured as `viewer-unsupported-context-pc.png` / `...-mobile.png`.

### Evidence locations

- Before: `/tmp/khanzama-fidelity/media/before/matrix.json`, 20 reference-viewport PNGs, plus full-page copies when content is longer than the viewport.
- After: `/tmp/khanzama-fidelity/media/after/matrix.json`, the corresponding 20 PNGs, plus 319px detail/create/edit/QR/public checks and two contextual unsupported-browser views. `extra-checks.json` records those narrow geometry checks.
- Crop coordinates: `fidelity-media-matrix.json`. The measured generated borders have about 2px antialias tolerance; screenshot viewport sizes use the listed frame dimensions.
- Reproduction: `tests/fidelity/media-audit.pw.ts` against the lead's existing demo server; its custom config is `/tmp/khanzama-fidelity/media/playwright.config.cjs`, with no `webServer` or build step. The `.pw.ts` suffix intentionally avoids Vitest discovery.
- Focused verification: six suites / 35 tests passed (QuickStart, VideoTimeline, media edits, QR design, exact Back navigation, public manifest). Scoped ESLint and `git diff --check` passed. The lead owns full build, E2E matrix and release validation.

### Meaningful differences retained

The QA photographs, filenames, dates, sizes and work titles come from actual fixture uploads, so they differ from the generated flowers/seascapes and invented concept counts. The Clear action is retained in creation; no false “save draft with all original files” promise is added without an implemented draft-storage contract. Native permission/video controls and the exact live camera pixels depend on the browser/device. These differences are explicit states/data, while layout, density, grouping and action placement follow the references.

### Integration regression checks

- The visually compact media sort select now has an explicit accessible name, `Порядок файлов`; the visible option text and layout are unchanged. Axe `select-name` reports no violations on desktop or phone.
- Editor identity includes actual project, group and creation date as semantic `dt`/`dd` pairs. Group names use the existing scoped group query; no synthetic group label is substituted. The audit verifies the visible definition against the group attached to the uploaded work.
- Bounded reproduction: `FIDELITY_PHASE=after FIDELITY_SCOPE=integration-fix` runs the same audit with only media/edit reference viewports and editor at 319px. Five reviewed PNGs, four native geometry records and the narrow overflow check are in `/tmp/khanzama-fidelity/media/integration-fix/`. The four final native media/edit captures replace their equivalents in `after/`; its 20-row matrix records each replacement's capture timestamp, actual route and isolated-context fixture. The other 16 native views remain unchanged. One Chromium audit passed, scoped ESLint passed, and three focused repository/navigation suites passed (14 tests). The lead owns the complete E2E rerun.
- QR print disclosure writes its URL state only from user activation of the native summary. Responsive `open` changes and delayed native `toggle` events no longer write a user choice. `FIDELITY_SCOPE=qr-print-fix` passed a real Chromium sequence: phone → desktop default, mouse close/open, phone preserving explicit expansion, Space collapse, desktop preserving collapse, Enter expansion. Assertions run after browser frames and verify both URL and visible styles. Only two QR-detail native captures were refreshed in `after/`, with their actual timestamps and independent fixture in its matrix; original evidence is also in `qr-print-fix/`. The other 18 views were untouched by this check. Scoped ESLint and diff-check passed; source is frozen for the lead's integrated rerun.
