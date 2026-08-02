# AR Photo — модель данных

## 1. Область документа

Документ описывает применённую PostgreSQL/Supabase схему этапа 2. Источник истины — последовательные SQL-миграции в `supabase/migrations`; CI разворачивает их с нуля на PostgreSQL 17, выполняет seed, lint и pgTAP-тесты.

Все UUID генерируются сервером. Все timestamps — `timestamptz`. Денормализованный `account_id` используется на tenant-bound таблицах для простых и быстрых RLS policies, но всегда устанавливается/проверяется доверенной server logic.

## 2. Схемы

- `public`: только таблицы/read models, которые осознанно доступны Data API;
- `private`: authorization helpers, quota functions и internal processing routines; schema не публикуется в Data API;
- `storage`: управляется Supabase Storage;
- `auth`: управляется Supabase Auth.

Публичный AR viewer не получает `SELECT` к рабочим таблицам. Его contract формирует Edge Function.

## 3. Enums

Предлагаемые enums или эквивалентные check constraints:

- `account_status`: `active`, `suspended`, `closed`;
- `member_role`: `owner`, `manager`, `editor`, `viewer`;
- `profile_role`: `superadmin`, `account_user`;
- `subscription_status`: `trial`, `active`, `grace_period`, `expired`, `suspended`, `cancelled`;
- `project_status`: `draft`, `active`, `archived`;
- `project_category`: `graduation`, `wedding`, `family`, `birthday`, `travel`, `advertising`, `museum`, `other`;
- `ar_item_status`: `draft`, `processing`, `ready`, `published`, `failed`, `suspended`, `archived`;
- `tracking_status`: `uploaded`, `analyzing`, `unsuitable`, `compiling`, `ready`, `failed`;
- `visibility`: `private`, `public`;
- `marker_lost_behavior`: `pause_hide`, `continue_audio_hide`, `stop_reset`;
- `job_type`: `marker_analysis`, `marker_compilation`, `video_inspection`, `video_transcode`, `thumbnail_generation`, `qr_generation`, `storage_cleanup`;
- `job_status`: `queued`, `running`, `succeeded`, `failed`, `cancelled`;
- `ar_event_type`: `page_open`, `camera_started`, `marker_detected`, `playback_started`, `progress_25`, `progress_50`, `progress_75`, `completed`, `error`.

## 4. Основные таблицы

### `accounts`

| Column                     | Type                      | Notes                                                     |
| -------------------------- | ------------------------- | --------------------------------------------------------- |
| `id`                       | uuid PK                   | server-generated                                          |
| `name`                     | text                      | 1–120 chars                                               |
| `slug`                     | text unique               | internal human-readable slug, не public AR slug           |
| `owner_user_id`            | uuid FK → `auth.users.id` | bootstrap owner                                           |
| `logo_path`                | text nullable             | private Storage path                                      |
| `status`                   | account_status            | default `active`                                          |
| `timezone`                 | text                      | default `Europe/Moscow` only if product decision confirms |
| `created_at`, `updated_at` | timestamptz               | server timestamps                                         |

Indexes: unique normalized `slug`, `owner_user_id`, `status`.

### `profiles`

| Column                     | Type                         | Notes                                                    |
| -------------------------- | ---------------------------- | -------------------------------------------------------- |
| `id`                       | uuid PK/FK → `auth.users.id` | identity                                                 |
| `full_name`                | text                         | not used in Storage names                                |
| `email_display`            | text                         | display copy, Auth remains source of truth               |
| `avatar_path`              | text nullable                | private                                                  |
| `account_id`               | uuid nullable FK             | active/default account for MVP, not authorization source |
| `role`                     | profile_role                 | superadmin flag is server-controlled                     |
| `is_active`                | boolean                      | default true                                             |
| `last_login_at`            | timestamptz nullable         | server maintained                                        |
| `created_at`, `updated_at` | timestamptz                  | server timestamps                                        |

Authorization never trusts `user_metadata`; membership tables and server-controlled app metadata are authoritative.

### `account_members`

| Column                      | Type                      | Notes                    |
| --------------------------- | ------------------------- | ------------------------ |
| `id`                        | uuid PK                   |                          |
| `account_id`                | uuid FK                   | tenant                   |
| `user_id`                   | uuid FK → `auth.users.id` | member                   |
| `role`                      | member_role               | coarse role              |
| `permissions`               | jsonb                     | validated permission map |
| `is_active`                 | boolean                   | immediate access switch  |
| `invited_at`, `accepted_at` | timestamptz nullable      | lifecycle                |
| `created_at`, `updated_at`  | timestamptz               |                          |

Constraints: unique `(account_id, user_id)`. Index `(user_id, account_id)` and partial active-member index.

### `subscription_plans`

Fields: `id`, unique `code`, `name`, `description`, `storage_limit_bytes`, `project_limit`, `group_limit`, `ar_item_limit`, `video_duration_limit_seconds`, `max_video_size_bytes`, `team_limit`, `is_active`, `created_at`, `updated_at`.

All limits are non-negative. Plan rows are modified only by superadmin flow.

### `subscriptions`

Fields: `id`, `account_id`, `plan_id`, `status`, `starts_at`, `expires_at`, `grace_period_ends_at`, `custom_limits jsonb`, `is_active`, `created_at`, `updated_at`.

Constraints prevent inverted date ranges. There may be only one current subscription per account; history is retained. Effective limits are calculated by trusted SQL/service logic, not frontend merge.

### `projects`

Fields: `id`, `account_id`, `name`, `description`, `cover_path`, `category`, `event_date`, `status`, `note`, `created_by`, `created_at`, `updated_at`, `archived_at`, `deleted_at`.

Indexes: `(account_id, status, updated_at desc)`, `(account_id, deleted_at)`. Names are not globally unique.

### `groups`

Fields: `id`, `project_id`, `account_id`, `name`, `description`, `cover_path`, `sort_order`, `created_by`, `created_at`, `updated_at`, `archived_at`, `deleted_at`.

Constraint or trusted trigger verifies that `projects.account_id = groups.account_id`. Indexes: `(project_id, sort_order)`, `(account_id, updated_at desc)`.

### `ar_items`

Fields:

- identity: `id`, `account_id`, `project_id`, `group_id`;
- content: `title`, `description`, unpredictable unique `public_slug`;
- lifecycle: `status`, `visibility`, `published_at`, `expires_at`, `deleted_at`;
- marker: `marker_image_path`, `marker_preview_path`, `marker_width`, `marker_height`, `marker_sha256`, `marker_quality_score`, `marker_quality_details jsonb`;
- video: `video_path`, `optimized_video_path`, `video_thumbnail_path`, `video_duration_seconds`, `video_width`, `video_height`, `video_codec`, `video_has_audio`;
- tracking: `tracking_dataset_path`, `tracking_status`, `tracking_provider`, `tracking_version`;
- behavior: `autoplay`, `loop_video`, `marker_lost_behavior`, `audio_default`, `fallback_enabled`;
- audit: `created_by`, `created_at`, `updated_at`.

Constraints verify account/project/group consistency. `public_slug` uses at least 128 bits of CSPRNG entropy, is not derived from UUID/email/path, and never changes when media paths change.

Indexes: unique `public_slug`; `(account_id, status, updated_at desc)`; `(group_id, status)`; `(project_id, status)`; partial published index.

### `processing_jobs`

Fields: `id`, `account_id`, `ar_item_id`, `job_type`, `status`, `progress`, `attempt`, `max_attempts`, `error_code`, `error_message_safe`, `input_metadata`, `output_metadata`, `locked_at`, `locked_by`, `started_at`, `completed_at`, `created_at`, `updated_at`.

`progress` is 0–100. Technical stack traces go to protected logs, not user-readable columns. Idempotency key prevents duplicate processing after retries.

### `qr_codes`

Fields: `id`, `ar_item_id` unique, `public_url`, `svg_path`, `png_path`, `style jsonb`, `created_at`, `updated_at`.

`public_url` is derived from configured public origin and `public_slug`; it never contains signed URLs or internal ids.

### `ar_view_sessions`

Fields: `id`, `ar_item_id`, `account_id`, `session_token_hash`, `started_at`, `ended_at`, `marker_detected_at`, `playback_started_at`, `completed`, `duration_watched_seconds`, `device_type`, `browser_family`, `os_family`, optional `country_code`, `referrer_domain`, `error_code`.

No raw IP, fingerprint or full user-agent is stored by default. Retention and country derivation require a legal/product decision.

### `ar_view_events`

Fields: `id`, `session_id`, `ar_item_id`, `account_id`, `event_type`, `occurred_at`, `value_numeric`, `error_code`, `metadata_safe jsonb`.

This table supports 25/50/75% metrics without overloading the session row. Ingestion validates an allowlist and limits events per session.

### `audit_logs`

Fields: `id`, `account_id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `metadata_safe jsonb`, `created_at`.

Append-only for application roles. Sensitive values, raw filenames and signed URLs are excluded.

## 5. Relationships

```mermaid
erDiagram
  AUTH_USERS ||--o| PROFILES : has
  AUTH_USERS ||--o{ ACCOUNT_MEMBERS : joins
  ACCOUNTS ||--o{ ACCOUNT_MEMBERS : contains
  ACCOUNTS ||--o{ SUBSCRIPTIONS : has
  SUBSCRIPTION_PLANS ||--o{ SUBSCRIPTIONS : defines
  ACCOUNTS ||--o{ PROJECTS : owns
  PROJECTS ||--o{ GROUPS : contains
  GROUPS ||--o{ AR_ITEMS : contains
  AR_ITEMS ||--o{ PROCESSING_JOBS : processes
  AR_ITEMS ||--o| QR_CODES : publishes
  AR_ITEMS ||--o{ AR_VIEW_SESSIONS : receives
  AR_VIEW_SESSIONS ||--o{ AR_VIEW_EVENTS : emits
  ACCOUNTS ||--o{ AUDIT_LOGS : records
```

## 6. Quota and mutation rules

Frontend показывают usage, но не разрешают операцию.

Create project/group/AR item, add member, upload finalize и publish выполняются через trusted server boundary. Он:

1. получает user id из проверенного JWT;
2. проверяет active membership и permission;
3. блокирует/читает актуальную subscription row;
4. вычисляет effective limits;
5. считает только non-deleted resources;
6. записывает resource и audit log одной транзакцией;
7. не принимает `account_id` как доказательство полномочий.

Повторный request использует idempotency key, чтобы двойной клик не создавал дубликат.

## 7. RLS matrix

| Table                 | anon | authenticated member                 | owner/manager                    | superadmin            |
| --------------------- | ---- | ------------------------------------ | -------------------------------- | --------------------- |
| profiles              | нет  | свой профиль/разрешённые team fields | team read/manage via server flow | protected server flow |
| accounts              | нет  | свой active account read             | update allowed fields            | protected server flow |
| account_members       | нет  | own membership read                  | team read/manage by permission   | protected server flow |
| plans/subscriptions   | нет  | current effective read               | current/history read             | protected server flow |
| projects/groups/items | нет  | account-scoped by permission         | account-scoped CRUD              | protected server flow |
| processing_jobs       | нет  | account-scoped read                  | retry via server flow            | protected server flow |
| qr_codes              | нет  | account-scoped read                  | regenerate via server flow       | protected server flow |
| analytics             | нет  | permission-scoped aggregate read     | account-scoped read              | protected server flow |
| audit_logs            | нет  | обычно нет                           | filtered account read            | protected server flow |

Для UPDATE создаются SELECT policy, `USING` и `WITH CHECK`. Policies используют `TO authenticated` плюс membership predicate. Indexes покрывают columns, используемые RLS.

Views либо `security_invoker = true`, либо находятся в непубличной schema. `SECURITY DEFINER` допускается только в `private`, с фиксированным `search_path`, явной проверкой `auth.uid()` и отозванным `EXECUTE FROM PUBLIC`.

## 8. Storage model

Buckets:

- `markers-private`;
- `videos-private`;
- `tracking-private`;
- `avatars-private`;
- `project-covers-private`;
- `generated-public` — только QR/несекретные брендовые assets после отдельной проверки.

Path contract:

```text
accounts/{accountId}/projects/{projectId}/groups/{groupId}/items/{itemId}/marker/{assetId}/original
accounts/{accountId}/projects/{projectId}/groups/{groupId}/items/{itemId}/marker/{assetId}/preview.webp
accounts/{accountId}/projects/{projectId}/groups/{groupId}/items/{itemId}/video/{assetId}/original
accounts/{accountId}/projects/{projectId}/groups/{groupId}/items/{itemId}/video/{assetId}/optimized.mp4
accounts/{accountId}/projects/{projectId}/groups/{groupId}/items/{itemId}/tracking/{assetId}/target.mind
generated/qr/{itemId}/{version}.svg
```

Имена пользователя и ФИО не входят в paths. Replace создаёт новую immutable asset version. Upsert используется только с policies на INSERT + SELECT + UPDATE; предпочтительнее versioned write без upsert.

## 9. Миграции и seed

Этап 2 реализован пятью reviewable миграциями:

- foundation: extensions, enums, timestamps и 144-bit public slug;
- core schema: 13 таблиц, constraints, foreign keys и supporting indexes;
- security: explicit grants, forced RLS, membership/subscription helpers и audit triggers;
- trusted mutations: account bootstrap и idempotent quota-aware project/group/item creation;
- Storage: пять private buckets и явные object policies.

`supabase/seed.sql` содержит только синтетические данные: superadmin, два изолированных аккаунта, active/expired subscription и role fixtures. `supabase/tests` проверяет schema/grants и RLS/Storage matrix. Тип `Database` генерируется Supabase CLI из реально поднятой схемы и хранится в `src/shared/api/database.types.ts`.

Hosted advisors запускаются после привязки development Supabase project; их отсутствие не заменяется утверждением о проверке remote infrastructure.

Особое правило 2026 года: exposed Data API grants задаются явно; RLS и GRANT проверяются как две отдельные границы.
