# AR Photo processing worker

The worker is the only runtime allowed to claim and complete AR processing jobs. It downloads private sources through short-lived signed URLs, keeps temporary files outside the repository, uploads immutable generated objects, and reports only stable error codes.

## Required environment

- `SUPABASE_URL`: HTTPS project URL (HTTP is accepted only for localhost).
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service credential. Never expose it through a `VITE_` variable.
- `PROCESSING_WORKER_ID`: stable identifier for one worker instance.

Optional controls are `PROCESSING_CONCURRENCY` (1–4, default 1), `PROCESSING_POLL_INTERVAL_MS` (250–60000, default 2000), `PROCESSING_RUN_ONCE=1` for a single polling cycle, and `PROCESSING_IDLE_POLLS_BEFORE_EXIT` (0–60, default 0) for a queue-draining batch that exits cleanly after the configured number of empty polls.

## Build and run

```sh
npm run build:worker
node dist-worker/workers/processing/index.js
```

Production should build `workers/processing/Dockerfile`. The image pins Node 22.22.2 and installs FFmpeg plus the native libraries required by MindAR and Canvas. When a phone browser cannot safely create H.264/AAC, the worker converts the private original into an immutable mobile-compatible MP4 before inspection and thumbnail generation. Long jobs refresh a database lease every 30 seconds; expired leases are reclaimed after 20 minutes, up to the configured attempt limit.

The production GitHub Actions workflow drains the hosted Supabase queue every five minutes and can also be started manually. It uses repository secrets named `PROCESSING_SUPABASE_URL` and `PROCESSING_SUPABASE_SERVICE_ROLE_KEY`; the service credential is passed only to the isolated worker container.
