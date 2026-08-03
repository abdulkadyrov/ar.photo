begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(61);

select ok(to_regclass('private.admin_audit_logs') is not null, 'private admin audit table exists');
select ok(to_regclass('private.admin_ar_item_suspensions') is not null, 'private content suspension table exists');
select ok(to_regclass('private.system_settings') is not null, 'private system settings table exists');
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'private.admin_audit_logs', 'SELECT'),
  'browser roles cannot read raw admin audit rows'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'private.admin_ar_item_suspensions', 'SELECT'),
  'browser roles cannot read internal suspension records'
);
select ok(
  not pg_catalog.has_table_privilege('authenticated', 'private.system_settings', 'SELECT'),
  'browser roles cannot read system settings directly'
);
select ok(
  not pg_catalog.has_function_privilege('anon', 'public.get_admin_access()', 'EXECUTE'),
  'anonymous callers cannot inspect admin access'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.get_admin_access()', 'EXECUTE'),
  'authenticated callers can resolve their own admin access state'
);
select ok(
  pg_catalog.has_function_privilege('authenticated', 'public.admin_get_overview()', 'EXECUTE'),
  'admin overview is exposed through a trusted RPC'
);
select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'public.admin_update_subscription(uuid,uuid,public.subscription_status,timestamptz,timestamptz,timestamptz,jsonb)',
    'EXECUTE'
  ),
  'legacy subscription mutation is not directly callable from the browser'
);
select ok(
  not pg_catalog.has_function_privilege(
    'authenticated',
    'public.admin_create_account(uuid,text,text,uuid,public.subscription_status,timestamptz,timestamptz,timestamptz,jsonb)',
    'EXECUTE'
  ),
  'legacy account creation mutation is not directly callable from the browser'
);

insert into public.processing_jobs (
  account_id,
  ar_item_id,
  type,
  status,
  progress,
  attempt_count,
  max_attempts,
  dedupe_key,
  error_code,
  error_message,
  input_metadata,
  completed_at
) values (
  '20000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  'marker_analysis',
  'failed',
  0,
  3,
  3,
  'stage10-admin-retry',
  'marker_decode_failed',
  'Обработка не завершена. Повторите попытку позже.',
  '{"revision":1}'::jsonb,
  statement_timestamp()
);
select set_config(
  'stage10.failed_job_id',
  (select id::text from public.processing_jobs where dedupe_key = 'stage10-admin-retry'),
  true
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000010', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000010","aal":"aal2","role":"authenticated"}',
  true
);
select is(
  (public.get_admin_access() ->> 'isSuperadmin')::boolean,
  false,
  'account owner is not treated as a superadmin'
);
select throws_ok(
  $$ select public.admin_get_overview() $$,
  '42501',
  'Superadmin access required',
  'account owner cannot read operations overview'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}',
  true
);
select is(
  (public.get_admin_access() ->> 'isSuperadmin')::boolean,
  true,
  'active superadmin identity is recognized'
);
select is(
  (public.get_admin_access() ->> 'mfaVerified')::boolean,
  false,
  'aal1 session is not considered MFA verified'
);
select throws_ok(
  $$ select public.admin_get_overview() $$,
  '42501',
  'MFA verification required',
  'aal1 superadmin cannot read operations data'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","aal":"aal2","role":"authenticated"}',
  true
);
select is(
  (public.get_admin_access() ->> 'mfaVerified')::boolean,
  true,
  'aal2 superadmin session is verified'
);
select is(
  (public.admin_get_overview() -> 'accounts' ->> 'total')::integer,
  2,
  'overview reports both synthetic customer accounts'
);
select is(
  (public.admin_get_overview() ->> 'failedJobs')::integer,
  1,
  'overview reports processing failures'
);
select is(
  (public.admin_list_accounts('', 50, 0) ->> 'total')::integer,
  2,
  'account list has deterministic total'
);
select ok(
  public.admin_list_accounts('', 50, 0)::text !~* 'password|encrypted_password',
  'account list contains no password fields'
);
select is(
  jsonb_array_length(public.admin_search_content('Выпускной', 50)),
  1,
  'operations search locates a project and its item'
);
select throws_ok(
  $$ select public.admin_get_account_detail(
    '20000000-0000-4000-8000-000000000001',
    'short'
  ) $$,
  '22023',
  'Administrative reason is required',
  'account-scoped support access requires a meaningful reason'
);
select lives_ok(
  $$ select public.admin_get_account_detail(
    '20000000-0000-4000-8000-000000000001',
    'Диагностика обращения клиента SUP-1042'
  ) $$,
  'account-scoped support access succeeds with a reason'
);
select is(
  jsonb_array_length(
    public.admin_get_account_detail(
      '20000000-0000-4000-8000-000000000001',
      'Повторная проверка обращения SUP-1042'
    ) -> 'users'
  ),
  4,
  'account detail returns the account roster'
);
select ok(
  public.admin_get_account_detail(
    '20000000-0000-4000-8000-000000000001',
    'Проверка безопасного контракта SUP-1042'
  )::text !~* 'password|encrypted_password',
  'account detail never returns password data'
);
reset role;
select cmp_ok(
  (select count(*) from private.admin_audit_logs where action = 'admin.support_access'),
  '>=',
  3::bigint,
  'each account-scoped support read captures its reason'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","aal":"aal2","role":"authenticated"}',
  true
);
select is(
  (public.admin_get_processing_errors(null, 50, 0) ->> 'total')::integer,
  1,
  'processing error queue reports the failed job'
);
select is(
  (public.admin_get_processing_errors('20000000-0000-4000-8000-000000000002', 50, 0) ->> 'total')::integer,
  0,
  'processing error queue respects account scope'
);

select lives_ok(
  $$ select public.admin_set_ar_item_suspended(
    '20000000-0000-4000-8000-000000000001',
    '70000000-0000-4000-8000-000000000001',
    true,
    'Приостановка по обращению правообладателя AB-42'
  ) $$,
  'admin can suspend a specific public work'
);
reset role;
select is(
  (select status::text from public.ar_items where id = '70000000-0000-4000-8000-000000000001'),
  'suspended',
  'content suspension closes the item lifecycle'
);
select is(
  (select visibility::text from public.ar_items where id = '70000000-0000-4000-8000-000000000001'),
  'private',
  'content suspension closes public visibility'
);
select is(
  (select count(*) from private.admin_ar_item_suspensions where released_at is null),
  1::bigint,
  'active suspension record preserves restore context'
);
set local role authenticated;
select lives_ok(
  $$ select public.admin_set_ar_item_suspended(
    '20000000-0000-4000-8000-000000000001',
    '70000000-0000-4000-8000-000000000001',
    false,
    'Восстановление после закрытия обращения AB-42'
  ) $$,
  'admin can release a content suspension'
);
reset role;
select is(
  (select status::text from public.ar_items where id = '70000000-0000-4000-8000-000000000001'),
  'ready',
  'released ready item returns to a safe private state'
);
select is(
  (select count(*) from private.admin_audit_logs where action in ('admin.ar_item.suspend', 'admin.ar_item.restore')),
  2::bigint,
  'both dangerous content mutations are audit logged'
);

set local role authenticated;
select lives_ok(
  $$ select public.admin_retry_processing_job(
    '20000000-0000-4000-8000-000000000001',
    current_setting('stage10.failed_job_id')::bigint,
    'Повтор после проверки безопасной ошибки worker'
  ) $$,
  'admin can retry a failed current-revision job'
);
reset role;
select is(
  (select status::text from public.processing_jobs where id = current_setting('stage10.failed_job_id')::bigint),
  'queued',
  'admin retry resets the failed job to queued'
);
select is(
  (select count(*) from private.admin_audit_logs where action = 'admin.processing.retry'),
  1::bigint,
  'processing retry is audit logged'
);

set local role authenticated;
select lives_ok(
  $$ select public.admin_set_account_status(
    '20000000-0000-4000-8000-000000000001',
    'suspended',
    'Приостановка аккаунта по обращению RISK-18'
  ) $$,
  'admin can suspend an account'
);
reset role;
select is(
  (select status::text from public.accounts where id = '20000000-0000-4000-8000-000000000001'),
  'suspended',
  'account suspension is persisted'
);
set local role authenticated;
select lives_ok(
  $$ select public.admin_set_account_status(
    '20000000-0000-4000-8000-000000000001',
    'active',
    'Восстановление аккаунта после проверки RISK-18'
  ) $$,
  'admin can restore a suspended account'
);
reset role;
select is(
  (select status::text from public.accounts where id = '20000000-0000-4000-8000-000000000001'),
  'active',
  'account restore is persisted'
);
select is(
  (select count(*) from private.admin_audit_logs where action = 'admin.account.status'),
  2::bigint,
  'both account status mutations are audit logged'
);

set local role authenticated;
select lives_ok(
  $$ select public.admin_upsert_plan(
    null,
    'agency',
    'Agency',
    'Synthetic admin test plan',
    214748364800,
    200,
    2000,
    20000,
    900,
    1073741824,
    50,
    true,
    'Создание тарифа для коммерческого предложения'
  ) $$,
  'admin can create a strictly validated plan'
);
reset role;
select is(
  (select count(*) from public.subscription_plans where code = 'agency'),
  1::bigint,
  'new plan is persisted once'
);
select is(
  (select count(*) from private.admin_audit_logs where action = 'admin.plan.upsert'),
  1::bigint,
  'plan mutation is audit logged'
);

set local role authenticated;
select throws_ok(
  $$ select public.admin_update_system_setting(
    'analytics_retention_days',
    '7'::jsonb,
    'Попытка небезопасного срока хранения'
  ) $$,
  '22023',
  'Invalid system setting',
  'unsafe analytics retention cannot be configured'
);
select lives_ok(
  $$ select public.admin_update_system_setting(
    'analytics_retention_days',
    '180'::jsonb,
    'Изменение срока хранения после legal review'
  ) $$,
  'safe system setting update succeeds'
);
select is(
  jsonb_array_length(public.admin_get_system_settings()),
  5,
  'protected settings reader returns the allowlisted registry'
);
reset role;
select is(
  (select value #>> '{}' from private.system_settings where key = 'analytics_retention_days'),
  '180',
  'system setting value is persisted'
);
select is(
  (select count(*) from private.admin_audit_logs where action = 'admin.settings.update'),
  1::bigint,
  'system setting mutation is audit logged'
);

set local role authenticated;
select lives_ok(
  $$ select public.admin_update_subscription_with_reason(
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'active',
    statement_timestamp() - interval '1 day',
    statement_timestamp() + interval '120 days',
    null,
    '{"project_limit":25}'::jsonb,
    'Продление подписки по договору CONTRACT-77'
  ) $$,
  'admin can extend a subscription with strict custom limits'
);
reset role;
select is(
  (select custom_limits ->> 'project_limit' from public.subscriptions where account_id = '20000000-0000-4000-8000-000000000001'),
  '25',
  'subscription custom limit is persisted'
);
select is(
  (select count(*) from private.admin_audit_logs where action = 'admin.subscription.update'),
  1::bigint,
  'subscription mutation is audit logged with reason'
);

set local role authenticated;
select throws_ok(
  $$ select public.admin_authorize_password_reset(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000020',
    'Запрос клиента на восстановление доступа'
  ) $$,
  '23503',
  'Account user not found',
  'password reset cannot cross account scope'
);
select is(
  (public.admin_authorize_password_reset(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000010',
    'Подтверждённый запрос владельца SUPPORT-55'
  ) ->> 'authorized')::boolean,
  true,
  'password reset delivery can be authorized without reading a password'
);
select cmp_ok(
  (public.admin_get_audit_logs(null, 200, 0) ->> 'total')::integer,
  '>=',
  12,
  'audit viewer returns all administrative operations'
);
select ok(
  public.admin_get_audit_logs(null, 200, 0)::text !~* 'password_hash|encrypted_password',
  'admin audit viewer contains no password material'
);
reset role;
select is(
  (select count(*) from private.admin_audit_logs where action = 'admin.password_reset.request'),
  1::bigint,
  'password reset authorization is audit logged'
);
select is(
  (select count(*) from private.admin_audit_logs where char_length(reason) < 10),
  0::bigint,
  'all stored administrative audit reasons are meaningful'
);

select * from finish();
rollback;
