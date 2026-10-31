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

Restore database roles, schema, data and Auth users from an audited source
backup. Storage objects, Edge Functions, mail settings and function secrets
require a separate transfer. Verify accounts, private files, old QR slugs,
and a new upload-to-publication journey before changing the public app.
Keep the cloud project available until migration acceptance.

Files initially stored on the server consume its 40 GB disk. External S3
must be configured and verified separately; provider replication does not
replace backups. Maintain an off-server backup and test restoring it.
