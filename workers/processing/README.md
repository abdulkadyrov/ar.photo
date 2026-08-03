# AR Photo processing worker

The worker is the only runtime allowed to claim and complete AR processing jobs. It downloads private sources through short-lived signed URLs, keeps temporary files outside the repository, uploads immutable generated objects, and reports only stable error codes.

## Required environment

- `SUPABASE_URL`: HTTPS project URL (HTTP is accepted only for localhost).
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service credential. Never expose it through a `VITE_` variable.
- `PROCESSING_WORKER_ID`: stable identifier for one worker instance.

Optional controls are `PROCESSING_CONCURRENCY` (1–4, default 1), `PROCESSING_POLL_INTERVAL_MS` (250–60000, default 2000), and `PROCESSING_RUN_ONCE=1` for a single polling cycle.

## Build and run

```sh
npm run build:worker
node dist-worker/workers/processing/index.js
```

Production should build `workers/processing/Dockerfile`. The image pins Node 22.22.2 and installs FFmpeg plus the native libraries required by MindAR and Canvas. Long jobs refresh a database lease every 30 seconds; expired leases are reclaimed after 20 minutes, up to the configured attempt limit.
