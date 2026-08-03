begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(13);

select is(
  (
    select count(*)
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relname = any(array[
        'subscription_plans', 'accounts', 'profiles', 'account_members', 'subscriptions',
        'projects', 'groups', 'ar_items', 'media_assets', 'upload_sessions', 'processing_jobs', 'qr_codes',
        'ar_view_sessions', 'audit_logs'
      ])
  ),
  14::bigint,
  'all application tables exist'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relrowsecurity
      and c.relname = any(array[
        'subscription_plans', 'accounts', 'profiles', 'account_members', 'subscriptions',
        'projects', 'groups', 'ar_items', 'media_assets', 'upload_sessions', 'processing_jobs', 'qr_codes',
        'ar_view_sessions', 'audit_logs'
      ])
  ),
  14::bigint,
  'RLS is enabled on every application table'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relforcerowsecurity
      and c.relname = any(array[
        'subscription_plans', 'accounts', 'profiles', 'account_members', 'subscriptions',
        'projects', 'groups', 'ar_items', 'media_assets', 'upload_sessions', 'processing_jobs', 'qr_codes',
        'ar_view_sessions', 'audit_logs'
      ])
  ),
  14::bigint,
  'RLS is forced on every application table'
);

select is(
  (
    select count(*)
    from information_schema.role_table_grants g
    where g.table_schema = 'public'
      and g.grantee = 'anon'
      and g.table_name = any(array[
        'subscription_plans', 'accounts', 'profiles', 'account_members', 'subscriptions',
        'projects', 'groups', 'ar_items', 'media_assets', 'upload_sessions', 'processing_jobs', 'qr_codes',
        'ar_view_sessions', 'audit_logs'
      ])
  ),
  0::bigint,
  'anon has no direct application-table grants'
);

select is(
  (
    select count(*)
    from information_schema.role_table_grants g
    where g.table_schema = 'public'
      and g.grantee = 'authenticated'
      and g.privilege_type in ('INSERT', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER')
      and g.table_name = any(array[
        'subscription_plans', 'accounts', 'profiles', 'account_members', 'subscriptions',
        'projects', 'groups', 'ar_items', 'media_assets', 'upload_sessions', 'processing_jobs', 'qr_codes',
        'ar_view_sessions', 'audit_logs'
      ])
  ),
  0::bigint,
  'authenticated has no unsafe table-level write grants'
);

select is(
  (select count(*) from storage.buckets where id like '%-private' and not public),
  5::bigint,
  'five private Storage buckets are configured'
);

select ok(
  (
    select column_default like '%private.new_public_slug%'
    from information_schema.columns
    where table_schema = 'public' and table_name = 'ar_items' and column_name = 'public_slug'
  ),
  'public slug uses a server-generated random default'
);

select ok(
  pg_catalog.has_function_privilege(
    'authenticated',
    'public.create_project(uuid,text,text,public.project_category,uuid)',
    'EXECUTE'
  ),
  'authenticated can execute trusted project creation'
);

select ok(
  not pg_catalog.has_function_privilege(
    'anon',
    'public.create_project(uuid,text,text,public.project_category,uuid)',
    'EXECUTE'
  ),
  'anon cannot execute trusted project creation'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('private', 'public')
      and p.prosecdef
      and p.proname in (
        'is_superadmin', 'has_account_access', 'has_account_role', 'shares_account',
        'subscription_allows_write', 'can_write_account', 'effective_limit',
        'has_storage_access', 'handle_new_user', 'write_audit_log', 'admin_create_account',
        'create_project', 'create_group', 'create_ar_item', 'reorder_groups', 'move_group',
        'begin_media_upload', 'start_media_upload', 'fail_media_upload', 'finalize_media_upload',
        'abort_media_upload', 'expire_stale_uploads', 'complete_upload_cleanup',
        'create_ar_item_draft', 'prepare_ar_item_processing', 'claim_processing_jobs',
        'report_processing_progress', 'complete_processing_job', 'fail_processing_job',
        'retry_ar_item_processing', 'override_marker_quality', 'publish_ar_item',
        'unpublish_ar_item', 'rotate_ar_item_public_slug', 'update_ar_item_qr_style'
      )
      and not exists (
        select 1
        from unnest(coalesce(p.proconfig, array[]::text[])) as config(value)
        where config.value in ('search_path=', 'search_path=""')
      )
  ),
  0::bigint,
  'every security-definer function pins an empty search_path'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_constraint c
    join pg_catalog.pg_namespace n on n.oid = c.connamespace
    where n.nspname = 'public'
      and c.contype = 'f'
      and not exists (
        select 1
        from pg_catalog.pg_index i
        where i.indrelid = c.conrelid
          and c.conkey <@ (i.indkey::smallint[])
      )
  ),
  0::bigint,
  'every foreign key has a supporting index'
);

select is(
  (select char_length(public_slug) from public.ar_items where id = '70000000-0000-4000-8000-000000000001'),
  36,
  'public slugs have at least 144 bits of encoded entropy'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname like 'ar_photo_storage_%'
  ),
  4::bigint,
  'Storage has explicit read/insert/update/delete policies'
);

select * from finish();
rollback;
