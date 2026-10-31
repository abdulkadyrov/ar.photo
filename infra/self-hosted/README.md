# AR Photo self-hosted test server

Budget target: 2 CPU, 4 GB RAM, 40 GB NVMe. This is a testing deployment;
measure upload, processing and playback before advertising.

Upstream Supabase: `self-hosted/v0.8.3`, commit
`bc27d2661edd09a5d0b8d76ce33da6d4071a756e`. Use its complete `docker/`
directory, not only its Compose file. Keep credentials outside Git under
`/opt/ar-photo/supabase` with mode 0600.

Copy `compose.budget.yml` beside upstream `docker-compose.yml`, create
`.env.functions`, and use:

```sh
docker compose -f docker-compose.yml -f compose.budget.yml config --quiet
docker compose -f docker-compose.yml -f compose.budget.yml up -d --wait
```

The override binds API and optional database pooler ports to localhost,
limits memory and logs, and leaves unused Realtime and Supavisor disabled.
Use a TLS reverse proxy for public API access; restrict Studio to an SSH
tunnel or an authenticated administrative endpoint. Do not expose Postgres.

Run the processing worker with `PROCESSING_CONCURRENCY=1`, a stable worker
ID, `restart: unless-stopped`, and temporary files outside persistent media.
Provide 2 GB swap as a buffer, not as additional processing capacity.

Set the GitHub repository variable `PROCESSING_RUNNER_MODE=server` after
the permanent worker passes a complete upload/processing/publication check.
This skips scheduled CI queue draining while retaining worker image checks
on pushes and pull requests. Remove the variable to restore the hosted
runner fallback; do not run both with different concurrency assumptions.

Use `Caddyfile.example` with `AR_PHOTO_HOST` set to the HTTPS hostname.
Deploy the built site under `/srv/ar-photo/current/ar.photo/`. Only API
routes are proxied publicly; Studio remains reachable through an SSH tunnel.
Configure SMTP before relying on password-recovery or invitation emails.
For the temporary deployment SMTP is deliberately unconfigured.

Install the backup service and timer from this directory, then verify a
database restore into a separate temporary database. Daily backups include
private credentials, so keep them root-only and copy an encrypted or
access-restricted copy off the server. Same-server copies do not protect
against loss of the VPS.

Restore database roles, schema, data and Auth users from an audited source
backup. Storage objects, Edge Functions, mail settings and function secrets
require a separate transfer. Verify accounts, private files, old QR slugs,
and a new upload-to-publication journey before changing the public app.
Keep the cloud project available until migration acceptance.

Files initially stored on the server consume its 40 GB disk. External S3
must be configured and verified separately; provider replication does not
replace backups. Maintain an off-server backup and test restoring it.

## Editable tariff packages and photo credits

`20261031171824_editable_photo_credit_packages.sql` adds catalog prices in
kopecks, duration in days (30/365 are explicit day-based periods), subscription
products and additive photo/time packages. Admin → Tariffs edits the catalog;
Admin → Accounts → open account with a reason → Subscriptions grants a package.
Both mutations require superadmin plus MFA and record an audit entry. Prices
are informational until a payment provider is integrated; granting does not
charge a card. Deactivating a product prevents future grants, without revoking
previously issued access.

Each new AR work consumes one creation credit atomically. Editing an existing
work or restoring that same work does not create a new charge. Hard and soft
deletion do not refund credits. Failed/rolled-back creation consumes nothing;
a failed upload after a work was created still leaves that creation spent.
Uploads must still satisfy storage, size and account-status limits.

Credit wallets are private and lock per account; immutable spend receipts
survive work deletion. Package grants use a request UUID for idempotency and
store the issued product snapshot. Remaining credits carry forward when a new
package is granted; no automatic monthly reset or billing is implemented.
Time adds to the later of today and current expiry. Photo-only add-ons do not
reactivate expired subscriptions. A base product can issue unlimited creations
or no expiry; time-only add-ons use zero photos. Catalog edits never change
already issued credit allowance or expiry; other plan resource limits remain
live as before.

Migration initializes spent credits from all surviving AR rows, including
soft-deleted rows. Hard deletions before migration cannot be reconstructed.
Rehearse against an isolated restored database, run the full pgTAP suite, take
a fresh restricted backup, then apply the migration in a single transaction.

## Temporary MFA opt-out

The registry flag `admin_mfa_required` defaults to true. An explicit server
opt-out permits single-factor sessions only for active superadmins; ordinary
users remain forbidden. The UI and administrative Edge Functions use the same
server policy and never label a single-factor session as MFA verified. To
re-enable the policy, enroll/verify a factor in Security first, then switch the
flag on in Admin settings. Removing a user's Auth factor is separate from the
console policy and requires enrolling again later.

Account deletion closes the tenant and cancels memberships/subscription while
preserving data and audit. The same request can be retried safely. The UI asks
for one confirmation and records its audit reason automatically.
