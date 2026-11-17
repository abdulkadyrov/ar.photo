# Administration fidelity audit

Status: local implementation and visual audit complete for all 16 administration
sheets, with desktop and phone captures. This documents the comparison with the
approved concepts, not pixel equality or production deployment.

All 16 sheets were inspected visually. `ROLES.md`, `PAGE_REVIEW.md`, and `SPEC.md`
remain the functional contract. Sample numbers, users and graphs from the images
are not copied into production data.

## Screenshot geometry

A sheet includes its title plus two separate UI frames. Screenshot viewports use
the UI frame dimensions below, **not the full sheet dimensions**. Bounds are visual
estimates in original PNG pixels (approximately ±3 px); no device-scale inference
is made. Desktop and phone frames are captured independently at scale 1.

Base route is `/ar.photo/admin`. Existing demo account A is
`20000000-0000-4000-8000-000000000001`, user U is
`10000000-0000-4000-8000-000000000010`. These are existing local fixtures.

| Approved sheet       | Real route/state                                                     | Desktop frame x,y,w,h | Phone frame x,y,w,h |
| -------------------- | -------------------------------------------------------------------- | --------------------- | ------------------- |
| admin-overview       | `?section=overview`                                                  | 11,95,1106,892        | 1141,95,387,892     |
| admin-accounts       | `?section=accounts`                                                  | 13,106,1107,876       | 1144,105,380,877    |
| admin-account-detail | `?section=accounts&account=A&accountView=detail&accountTab=overview` | 20,74,1077,911        | 1125,74,424,911     |
| admin-account-edit   | previous + `&accountEdit=1`                                          | 20,100,1098,895       | 1149,95,372,891     |
| admin-users          | `?section=users&account=A`                                           | 15,92,1170,898        | 1207,93,347,896     |
| admin-user-detail    | previous + `&user=U`                                                 | 8,91,1118,899         | 1155,92,371,898     |
| admin-subscriptions  | `?section=subscriptions&account=A`, choose existing Studio package   | 12,101,1133,871       | 1170,100,390,871    |
| admin-plans          | `?section=plans`                                                     | 12,88,1127,922        | 1161,88,347,922     |
| admin-plan-edit      | `?section=plans`, first existing plan → Edit                         | 8,93,1168,898         | 1206,94,353,897     |
| admin-analytics      | `?section=analytics`                                                 | 10,114,1114,881       | 1148,111,380,882    |
| admin-activity       | `?section=activity&account=A`, last-login state                      | 15,91,1106,870        | 1151,92,406,870     |
| admin-content        | `?section=items`, search existing work, open inspector               | 18,99,1332,779        | 1377,99,360,779     |
| admin-jobs           | `?section=errors`, expand first real error                           | 17,87,1082,911        | 1125,88,394,909     |
| admin-storage        | `?section=storage`                                                   | 15,72,1103,923        | 1134,72,387,923     |
| admin-settings       | `?section=settings`                                                  | 18,79,1106,935        | 1153,79,367,935     |
| admin-audit          | `?section=audit`, open first existing audit record                   | 9,14,1162,971         | 1198,13,360,974     |

## Largest baseline deviations

1. Repeated shell heading and page heading consume vertical space on most lists.
2. User detail and plan editor are narrow modal overlays; their references are
   composed pages with identity/forms and secondary columns.
3. Account subtabs use filled segment buttons instead of underline navigation.
4. Account creation/search and mobile rows have different order and density.
5. Content and audit use modal inspection instead of desktop side panels and
   compact mobile drawers.
6. Some metrics, sessions, capacity and permissions are absent from current APIs.
   Their unavailable state must remain explicit rather than copying the mockups.

## Implemented comparison results

- **Overview:** one page heading, real metric tiles, recent accounts and processing
  state, with activity and quick-action panels in the reference composition.
  Activity series and growth deltas remain unavailable because the repository
  does not return them.
- **Accounts:** compact desktop table and phone cards, search/filter/create order,
  short open action, status badge and overflow menu. Search, status, selected
  account and return position remain in the existing exact-back navigation flow.
- **Account detail:** account identity, underlined detail tabs, package actions,
  basic rows, quick actions and real audit history. Secondary panels collapse on
  phone; there are no invented physical-capacity or remaining-credit values.
- **Account edit:** composed editor with separate information and action regions,
  phone footer above navigation, and working dirty-cancel confirmation. Name and
  timezone are writable. Owner, contact and permission rows remain read-only
  where no safe editing operation exists.
- **Users:** selected-account context, desktop member rows, compact phone cards,
  retained search/status/role state, and direct entry to the existing member.
- **User detail:** full-width identity and account/session/security composition.
  Phone edit/reset actions follow the information cards and precede destructive
  actions; desktop actions remain beside the heading. Only the selected account
  membership is returned. Session history, active duration and MFA enrollment are
  marked unavailable rather than inferred.
- **Subscriptions:** selected account and existing package, current/after preview,
  compact assignment confirmation, optional comment below the principal action,
  and a collapsible selected-package picker on phone. Actual package assignment
  and confirmation operations are retained.
- **Plans:** base/addition groups, underlined kind navigation, compact cards,
  status, real price/duration/creation allowance and edit action. Phone card
  spacing was reduced after the lead's visual review; the edit target remains
  44 px tall. The fixture has two base plans and no additions, so its content
  differs from the fictional four-product reference.
- **Plan edit:** composed form and live preview, type radios, price/duration,
  consumable photo allowance, unlimited toggles, technical settings, warning and
  save/cancel. The desktop footer fits the native 1168 × 898 frame. On phone the
  preview is an accessible disclosure, initially closed, so the warning and
  footer remain visible above navigation. Its contents remain real and live.
  Existing plans have a shareable `plan=<id>` state; new plans use `plan=new`.
- **Analytics:** metric/period and two-column chart composition. Missing series,
  revenue and conversion are honest unavailable states; no decorative chart is
  presented as measured analytics.
- **Activity:** filter panel, real last-login rows and responsive phone cards.
  Sessions and elapsed working time are not measured by the current source.
- **Content:** existing search and desktop side inspector, phone result cards,
  and an accessible phone inspector when opened. Private-media URLs and QR
  previews are not returned by this search API; no stock photo or fabricated
  thumbnail is substituted.
- **Jobs:** three compact desktop summary tiles and real failed-job disclosure,
  friendly error and existing retry operation. Unknown waiting/running counts
  remain unavailable.
- **Storage:** real logical usage, account rows/cards and violet usage meters.
  Plan allowances are not labelled as VPS disk capacity. Provider disk, backup
  status and historical growth are not available in this repository response.
- **Settings:** grouped registration, publication, service and security controls,
  with actual values and save/confirmation behavior. Security information does
  not imply that an unlimited package grants administration or bypasses MFA.
- **Audit:** compact immutable history, accurate Russian action labels with raw
  codes retained, desktop detail column and phone drawer. Old records without
  before/after payloads explicitly say so. The desktop table may scroll inside
  its panel when the inspector is open; the document itself does not overflow.

## Evidence and reproduction

The canonical observational runner is
[`audit-admin.capture.mjs`](./audit-admin.capture.mjs). It uses an isolated browser
context against the existing demo Vite at
`http://127.0.0.1:4179/ar.photo/`; it never starts a server, builds or deploys.
Run with the project's Node 22:

```sh
node docs/design/khanzama-workspace/audit-admin.capture.mjs after
node docs/design/khanzama-workspace/audit-admin.capture.mjs narrow
```

- Baseline: `/tmp/khanzama-fidelity/admin/before/`.
- Final native frames: `/tmp/khanzama-fidelity/admin/after/`.
- Additional 319 × 700 checks: `/tmp/khanzama-fidelity/admin/narrow/`.
- Each directory has a machine-readable `manifest.json`, native viewport PNGs,
  and supplemental `-full.png` images when the page is taller than the viewport.
  Main files follow `admin-<sheet>-desktop.png` / `admin-<sheet>-mobile.png`.
- The content phone reference shows a list, whereas its desktop reference shows
  an inspector. Final captures follow those states; the initial baseline phone
  capture had the inspector open. This is a state difference, not a like-for-like
  pixel comparison.

Final native run: **2026-11-14T19:17:57.648Z–2026-11-14T19:18:38.406Z**, 32 entries,
zero page errors, zero document overflow. The latest shared shell CSS/TSX timestamp
is 2026-11-14T19:04:25 UTC, before every frame in this run. Additional narrow run:
**2026-11-14T19:17:57.419Z–2026-11-14T19:18:17.297Z**, all 16 states at 319 × 700,
zero page errors and zero document overflow. A min-width correction keeps account
subtabs in their intentional inner horizontal scroller at this width.

A supplemental keyboard check expanded the phone preview, verified a changed
name appeared immediately, and confirmed the sticky footer bottom (833 px) was
above mobile navigation (839 px) at 353 × 897. Evidence:
`/tmp/khanzama-fidelity/admin/after/admin-plan-edit-mobile-preview-expanded-full.png`.

Every approved source sheet and every final native state was visually inspected.
The lead separately reviews reference crops and actual screenshots in the shared
comparison gallery. The reference crop matrix above remains exactly 16 entries.

## Verification and remaining limits

- Focused administration checks: **28 tests passed** across navigation/editor
  cancellation, schemas and demo repository behavior.
- The real access/MFA indicator is visible despite the compact page header:
  confirmed sessions display “MFA подтверждена”; an explicitly disabled requirement
  displays “MFA временно отключена”. Required but unverified sessions remain gated
  and do not load the administration snapshot. Three behavioral regressions cover
  these states.
- Application TypeScript check passed without emitting output.
- Administration source and capture-runner ESLint passed with zero warnings.
- No backend/API, authorization, RLS, MFA requirement, tracking or processing
  behavior was changed during this visual pass.
- This agent did not run a full build, full test suite, commit, push or deployment;
  those integration and release checks belong to the lead.

The shared sidebar is consistently 240 px wide; incidental generated chrome,
placeholder people/metrics/prices, unavailable operations and tiny generated
control targets are not reproduced as real capabilities. The implementation
preserves readable form controls and reachable phone actions. These are known
limits of visual equality, alongside the data gaps listed per page above.
