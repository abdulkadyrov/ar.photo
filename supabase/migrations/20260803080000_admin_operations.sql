-- Stage 10: MFA-protected operations console, support audit and safe admin mutations.

create table private.admin_audit_logs (
  id bigint generated always as identity primary key,
  account_id uuid references public.accounts(id) on delete set null,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id text,
  reason text not null,
  metadata_safe jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint admin_audit_logs_action_length check (char_length(action) between 3 and 100),
  constraint admin_audit_logs_entity_type_length check (char_length(entity_type) between 1 and 80),
  constraint admin_audit_logs_entity_id_length check (entity_id is null or char_length(entity_id) <= 160),
  constraint admin_audit_logs_reason_length check (char_length(reason) between 10 and 500),
  constraint admin_audit_logs_metadata_object check (jsonb_typeof(metadata_safe) = 'object')
);

create index admin_audit_logs_account_created_idx
on private.admin_audit_logs(account_id, created_at desc, id);
create index admin_audit_logs_actor_created_idx
on private.admin_audit_logs(actor_user_id, created_at desc, id);

create table private.admin_ar_item_suspensions (
  id bigint generated always as identity primary key,
  account_id uuid not null references public.accounts(id) on delete cascade,
  ar_item_id uuid not null references public.ar_items(id) on delete cascade,
  previous_status public.ar_item_status not null,
  reason text not null,
  suspended_by uuid not null references auth.users(id) on delete restrict,
  suspended_at timestamptz not null default now(),
  released_by uuid references auth.users(id) on delete restrict,
  released_at timestamptz,
  constraint admin_ar_item_suspensions_reason_length check (char_length(reason) between 10 and 500),
  constraint admin_ar_item_suspensions_release_consistency check (
    (released_at is null and released_by is null) or (released_at is not null and released_by is not null)
  )
);

create unique index admin_ar_item_suspensions_active_idx
on private.admin_ar_item_suspensions(ar_item_id) where released_at is null;
create index admin_ar_item_suspensions_account_idx
on private.admin_ar_item_suspensions(account_id, suspended_at desc, id);

create table private.system_settings (
  key text primary key,
  value jsonb not null,
  description text not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint system_settings_key_format check (key ~ '^[a-z][a-z0-9_]{2,63}$'),
  constraint system_settings_description_length check (char_length(description) between 3 and 200)
);

insert into private.system_settings (key, value, description)
values
  ('maintenance_mode', 'false'::jsonb, 'Отключает клиентские операции во время аварийных работ.'),
  ('registration_enabled', 'false'::jsonb, 'Разрешает создание аккаунтов только через защищённый admin flow.'),
  ('public_ar_enabled', 'true'::jsonb, 'Глобальный operational switch публичного AR.'),
  ('analytics_retention_days', '90'::jsonb, 'Срок хранения privacy-minimized analytics в днях.'),
  ('support_banner', '""'::jsonb, 'Короткое operational сообщение для команды поддержки.')
on conflict (key) do nothing;

revoke all on table private.admin_audit_logs from public, anon, authenticated;
revoke all on sequence private.admin_audit_logs_id_seq from public, anon, authenticated;
revoke all on table private.admin_ar_item_suspensions from public, anon, authenticated;
revoke all on sequence private.admin_ar_item_suspensions_id_seq from public, anon, authenticated;
revoke all on table private.system_settings from public, anon, authenticated;

create or replace function private.admin_mfa_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_superadmin())
    and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2';
$$;

create or replace function private.require_admin_mfa()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not (select private.is_superadmin()) then
    raise exception 'Superadmin access required' using errcode = '42501';
  end if;
  if not (select private.admin_mfa_verified()) then
    raise exception 'MFA verification required' using errcode = '42501';
  end if;
end;
$$;

create or replace function private.write_admin_audit(
  p_account_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_reason text,
  p_metadata_safe jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_reason text := btrim(p_reason);
begin
  perform private.require_admin_mfa();
  if char_length(normalized_reason) not between 10 and 500
    or p_action is null
    or p_entity_type is null
    or p_metadata_safe is null
    or jsonb_typeof(p_metadata_safe) <> 'object'
  then
    raise exception 'Administrative reason is required' using errcode = '22023';
  end if;

  insert into private.admin_audit_logs (
    account_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    reason,
    metadata_safe
  ) values (
    p_account_id,
    (select auth.uid()),
    p_action,
    p_entity_type,
    p_entity_id,
    normalized_reason,
    p_metadata_safe
  );
end;
$$;

create or replace function public.get_admin_access()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'isSuperadmin', (select private.is_superadmin()),
    'mfaVerified', (select private.admin_mfa_verified())
  );
$$;

create or replace function public.admin_get_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform private.require_admin_mfa();
  select jsonb_build_object(
    'accounts', jsonb_build_object(
      'total', count(*),
      'active', count(*) filter (where a.status = 'active'),
      'suspended', count(*) filter (where a.status = 'suspended')
    ),
    'users', jsonb_build_object(
      'total', (select count(*) from public.profiles p where p.role = 'account_user'),
      'active', (select count(*) from public.profiles p where p.role = 'account_user' and p.is_active)
    ),
    'subscriptions', jsonb_build_object(
      'active', (select count(*) from public.subscriptions s where s.status in ('trial', 'active', 'grace_period')),
      'attention', (select count(*) from public.subscriptions s where s.status in ('expired', 'suspended', 'cancelled'))
    ),
    'storageBytes', coalesce(sum(a.storage_used_bytes), 0),
    'arItems', (select count(*) from public.ar_items i where i.deleted_at is null),
    'publishedItems', (select count(*) from public.ar_items i where i.status = 'published' and i.deleted_at is null),
    'failedJobs', (select count(*) from public.processing_jobs j where j.status = 'failed')
  ) into result
  from public.accounts a
  where a.status <> 'closed';
  return result;
end;
$$;

create or replace function public.admin_list_accounts(
  p_search text default '',
  p_limit integer default 50,
  p_offset integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_search text := left(btrim(coalesce(p_search, '')), 80);
  result jsonb;
begin
  perform private.require_admin_mfa();
  if p_limit not between 1 and 100 or p_offset not between 0 and 100000 then
    raise exception 'Invalid admin list query' using errcode = '22023';
  end if;

  with filtered as (
    select a.*
    from public.accounts a
    where a.status <> 'closed'
      and (
        normalized_search = ''
        or a.name ilike '%' || normalized_search || '%'
        or a.slug ilike '%' || normalized_search || '%'
        or a.id::text = normalized_search
      )
  ), page as (
    select a.* from filtered a order by a.created_at desc, a.id limit p_limit offset p_offset
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered),
    'items', coalesce(jsonb_agg(jsonb_build_object(
      'id', a.id,
      'name', a.name,
      'slug', a.slug,
      'status', a.status,
      'ownerName', owner_profile.full_name,
      'planCode', plan.code,
      'planName', plan.name,
      'subscriptionStatus', subscription.status,
      'subscriptionExpiresAt', subscription.expires_at,
      'storageUsedBytes', a.storage_used_bytes,
      'arItemCount', (select count(*) from public.ar_items item where item.account_id = a.id and item.deleted_at is null),
      'failedJobCount', (select count(*) from public.processing_jobs job where job.account_id = a.id and job.status = 'failed'),
      'createdAt', a.created_at
    ) order by a.created_at desc, a.id), '[]'::jsonb)
  ) into result
  from page a
  left join public.profiles owner_profile on owner_profile.id = a.owner_user_id
  left join public.subscriptions subscription on subscription.account_id = a.id
  left join public.subscription_plans plan on plan.id = subscription.plan_id;
  return result;
end;
$$;

create or replace function public.admin_get_account_detail(
  p_target_account_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform private.require_admin_mfa();
  if not exists (select 1 from public.accounts a where a.id = p_target_account_id and a.status <> 'closed') then
    raise exception 'Account not found' using errcode = '23503';
  end if;
  perform private.write_admin_audit(
    p_target_account_id,
    'admin.support_access',
    'accounts',
    p_target_account_id::text,
    p_reason,
    '{}'::jsonb
  );

  select jsonb_build_object(
    'account', jsonb_build_object(
      'id', a.id,
      'name', a.name,
      'slug', a.slug,
      'status', a.status,
      'timezone', a.timezone,
      'storageUsedBytes', a.storage_used_bytes,
      'createdAt', a.created_at
    ),
    'subscription', jsonb_build_object(
      'id', subscription.id,
      'planId', plan.id,
      'planCode', plan.code,
      'planName', plan.name,
      'status', subscription.status,
      'startsAt', subscription.starts_at,
      'expiresAt', subscription.expires_at,
      'gracePeriodEndsAt', subscription.grace_period_ends_at,
      'customLimits', subscription.custom_limits
    ),
    'users', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', profile.id,
        'fullName', profile.full_name,
        'emailDisplay', profile.email_display,
        'role', member.role,
        'isActive', member.is_active,
        'acceptedAt', member.accepted_at,
        'lastLoginAt', profile.last_login_at
      ) order by member.role, profile.full_name, profile.id)
      from public.account_members member
      join public.profiles profile on profile.id = member.user_id
      where member.account_id = a.id
    ), '[]'::jsonb),
    'usage', jsonb_build_object(
      'projects', (select count(*) from public.projects p where p.account_id = a.id and p.deleted_at is null),
      'groups', (select count(*) from public.groups g where g.account_id = a.id and g.deleted_at is null),
      'arItems', (select count(*) from public.ar_items i where i.account_id = a.id and i.deleted_at is null),
      'publishedItems', (select count(*) from public.ar_items i where i.account_id = a.id and i.status = 'published' and i.deleted_at is null),
      'storageBytes', a.storage_used_bytes,
      'failedJobs', (select count(*) from public.processing_jobs j where j.account_id = a.id and j.status = 'failed')
    )
  ) into result
  from public.accounts a
  join public.subscriptions subscription on subscription.account_id = a.id
  join public.subscription_plans plan on plan.id = subscription.plan_id
  where a.id = p_target_account_id;
  return result;
end;
$$;

create or replace function public.admin_list_plans()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform private.require_admin_mfa();
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', plan.id,
    'code', plan.code,
    'name', plan.name,
    'description', plan.description,
    'storageLimitBytes', plan.storage_limit_bytes,
    'projectLimit', plan.project_limit,
    'groupLimit', plan.group_limit,
    'arItemLimit', plan.ar_item_limit,
    'videoDurationLimitSeconds', plan.video_duration_limit_seconds,
    'maxVideoSizeBytes', plan.max_video_size_bytes,
    'teamLimit', plan.team_limit,
    'isActive', plan.is_active,
    'updatedAt', plan.updated_at
  ) order by plan.created_at, plan.code), '[]'::jsonb)
  into result from public.subscription_plans plan;
  return result;
end;
$$;

create or replace function public.admin_get_processing_errors(
  p_target_account_id uuid default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform private.require_admin_mfa();
  if p_limit not between 1 and 100 or p_offset not between 0 and 100000 then
    raise exception 'Invalid admin list query' using errcode = '22023';
  end if;
  with failed as (
    select job.*, account.name as account_name, item.title as item_title
    from public.processing_jobs job
    join public.accounts account on account.id = job.account_id
    join public.ar_items item on item.id = job.ar_item_id
    where job.status = 'failed'
      and (p_target_account_id is null or job.account_id = p_target_account_id)
  ), page as (
    select * from failed order by updated_at desc, id desc limit p_limit offset p_offset
  )
  select jsonb_build_object(
    'total', (select count(*) from failed),
    'items', coalesce(jsonb_agg(jsonb_build_object(
      'id', job.id,
      'accountId', job.account_id,
      'accountName', job.account_name,
      'arItemId', job.ar_item_id,
      'arItemTitle', job.item_title,
      'type', job.type,
      'errorCode', coalesce(job.error_code, 'processing_failed'),
      'errorMessage', coalesce(job.error_message, 'Обработка не завершена.'),
      'attemptCount', job.attempt_count,
      'maxAttempts', job.max_attempts,
      'updatedAt', job.updated_at
    ) order by job.updated_at desc, job.id desc), '[]'::jsonb)
  ) into result from page job;
  return result;
end;
$$;

create or replace function public.admin_search_content(
  p_search text,
  p_limit integer default 50
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_search text := btrim(coalesce(p_search, ''));
  result jsonb;
begin
  perform private.require_admin_mfa();
  if char_length(normalized_search) not between 2 and 80 or p_limit not between 1 and 100 then
    raise exception 'Invalid content search' using errcode = '22023';
  end if;
  with matches as (
    select
      account.id as account_id,
      account.name as account_name,
      project.id as project_id,
      project.name as project_name,
      group_row.id as group_id,
      group_row.name as group_name,
      group_row.sort_order,
      item.id as item_id,
      item.title as item_title,
      item.status as item_status
    from public.ar_items item
    join public.accounts account on account.id = item.account_id
    join public.projects project on project.id = item.project_id
    join public.groups group_row on group_row.id = item.group_id
    where item.deleted_at is null
      and (
        item.id::text = normalized_search
        or project.id::text = normalized_search
        or item.title ilike '%' || normalized_search || '%'
        or project.name ilike '%' || normalized_search || '%'
        or group_row.name ilike '%' || normalized_search || '%'
      )
    order by account.name, project.name, group_row.sort_order, item.title
    limit p_limit
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'accountId', match.account_id,
    'accountName', match.account_name,
    'projectId', match.project_id,
    'projectName', match.project_name,
    'groupId', match.group_id,
    'groupName', match.group_name,
    'arItemId', match.item_id,
    'arItemTitle', match.item_title,
    'arItemStatus', match.item_status
  ) order by match.account_name, match.project_name, match.sort_order, match.item_title), '[]'::jsonb)
  into result from matches match;
  return result;
end;
$$;

create or replace function public.admin_get_audit_logs(
  p_target_account_id uuid default null,
  p_limit integer default 100,
  p_offset integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform private.require_admin_mfa();
  if p_limit not between 1 and 200 or p_offset not between 0 and 100000 then
    raise exception 'Invalid admin list query' using errcode = '22023';
  end if;
  with filtered as (
    select log.*, profile.full_name as actor_name
    from private.admin_audit_logs log
    left join public.profiles profile on profile.id = log.actor_user_id
    where p_target_account_id is null or log.account_id = p_target_account_id
  ), page as (
    select * from filtered order by created_at desc, id desc limit p_limit offset p_offset
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered),
    'items', coalesce(jsonb_agg(jsonb_build_object(
      'id', log.id,
      'accountId', log.account_id,
      'actorUserId', log.actor_user_id,
      'actorName', log.actor_name,
      'action', log.action,
      'entityType', log.entity_type,
      'entityId', log.entity_id,
      'reason', log.reason,
      'metadataSafe', log.metadata_safe,
      'createdAt', log.created_at
    ) order by log.created_at desc, log.id desc), '[]'::jsonb)
  ) into result from page log;
  return result;
end;
$$;

create or replace function public.admin_get_system_settings()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform private.require_admin_mfa();
  select coalesce(jsonb_agg(jsonb_build_object(
    'key', setting.key,
    'value', setting.value,
    'description', setting.description,
    'updatedAt', setting.updated_at
  ) order by setting.key), '[]'::jsonb)
  into result from private.system_settings setting;
  return result;
end;
$$;

create or replace function public.admin_update_system_setting(
  p_key text,
  p_value jsonb,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_setting private.system_settings;
begin
  perform private.require_admin_mfa();
  if not exists (select 1 from private.system_settings setting where setting.key = p_key)
    or p_value is null
    or case p_key
      when 'maintenance_mode' then jsonb_typeof(p_value) <> 'boolean'
      when 'registration_enabled' then jsonb_typeof(p_value) <> 'boolean'
      when 'public_ar_enabled' then jsonb_typeof(p_value) <> 'boolean'
      when 'analytics_retention_days' then
        jsonb_typeof(p_value) <> 'number' or (p_value #>> '{}')::numeric <> trunc((p_value #>> '{}')::numeric)
          or (p_value #>> '{}')::integer not between 30 and 730
      when 'support_banner' then
        jsonb_typeof(p_value) <> 'string' or char_length(p_value #>> '{}') > 160
      else true
    end
  then
    raise exception 'Invalid system setting' using errcode = '22023';
  end if;

  update private.system_settings
  set value = p_value,
      updated_by = (select auth.uid()),
      updated_at = statement_timestamp()
  where key = p_key
  returning * into updated_setting;

  perform private.write_admin_audit(
    null,
    'admin.settings.update',
    'system_settings',
    p_key,
    p_reason,
    jsonb_build_object('key', p_key)
  );
  return jsonb_build_object(
    'key', updated_setting.key,
    'value', updated_setting.value,
    'description', updated_setting.description,
    'updatedAt', updated_setting.updated_at
  );
end;
$$;

create or replace function public.admin_upsert_plan(
  p_plan_id uuid,
  p_code text,
  p_name text,
  p_description text,
  p_storage_limit_bytes bigint,
  p_project_limit integer,
  p_group_limit integer,
  p_ar_item_limit integer,
  p_video_duration_limit_seconds integer,
  p_max_video_size_bytes bigint,
  p_team_limit integer,
  p_is_active boolean,
  p_reason text
)
returns public.subscription_plans
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid := coalesce(p_plan_id, extensions.gen_random_uuid());
  updated_plan public.subscription_plans;
begin
  perform private.require_admin_mfa();
  insert into public.subscription_plans (
    id, code, name, description, storage_limit_bytes, project_limit, group_limit,
    ar_item_limit, video_duration_limit_seconds, max_video_size_bytes, team_limit, is_active
  ) values (
    target_id, lower(btrim(p_code)), btrim(p_name), nullif(btrim(p_description), ''),
    p_storage_limit_bytes, p_project_limit, p_group_limit, p_ar_item_limit,
    p_video_duration_limit_seconds, p_max_video_size_bytes, p_team_limit, p_is_active
  )
  on conflict (id) do update
  set code = excluded.code,
      name = excluded.name,
      description = excluded.description,
      storage_limit_bytes = excluded.storage_limit_bytes,
      project_limit = excluded.project_limit,
      group_limit = excluded.group_limit,
      ar_item_limit = excluded.ar_item_limit,
      video_duration_limit_seconds = excluded.video_duration_limit_seconds,
      max_video_size_bytes = excluded.max_video_size_bytes,
      team_limit = excluded.team_limit,
      is_active = excluded.is_active
  returning * into updated_plan;

  perform private.write_admin_audit(
    null,
    'admin.plan.upsert',
    'subscription_plans',
    updated_plan.id::text,
    p_reason,
    jsonb_build_object('code', updated_plan.code, 'isActive', updated_plan.is_active)
  );
  return updated_plan;
end;
$$;

create or replace function public.admin_update_subscription_with_reason(
  p_target_account_id uuid,
  p_plan_id uuid,
  p_status public.subscription_status,
  p_starts_at timestamptz,
  p_expires_at timestamptz,
  p_grace_period_ends_at timestamptz,
  p_custom_limits jsonb,
  p_reason text
)
returns public.subscriptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_subscription public.subscriptions;
begin
  perform private.require_admin_mfa();
  updated_subscription := public.admin_update_subscription(
    p_target_account_id,
    p_plan_id,
    p_status,
    p_starts_at,
    p_expires_at,
    p_grace_period_ends_at,
    p_custom_limits
  );
  perform private.write_admin_audit(
    p_target_account_id,
    'admin.subscription.update',
    'subscriptions',
    updated_subscription.id::text,
    p_reason,
    jsonb_build_object('planId', p_plan_id, 'status', p_status)
  );
  return updated_subscription;
end;
$$;

create or replace function public.admin_set_account_status(
  p_target_account_id uuid,
  p_status public.account_status,
  p_reason text
)
returns public.accounts
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_account public.accounts;
begin
  perform private.require_admin_mfa();
  if p_status not in ('active'::public.account_status, 'suspended'::public.account_status) then
    raise exception 'Invalid account status operation' using errcode = '22023';
  end if;
  update public.accounts
  set status = p_status
  where id = p_target_account_id and status <> 'closed'
  returning * into updated_account;
  if not found then raise exception 'Account not found' using errcode = '23503'; end if;

  perform private.write_admin_audit(
    p_target_account_id,
    'admin.account.status',
    'accounts',
    p_target_account_id::text,
    p_reason,
    jsonb_build_object('status', p_status)
  );
  return updated_account;
end;
$$;

create or replace function public.admin_set_ar_item_suspended(
  p_target_account_id uuid,
  p_ar_item_id uuid,
  p_suspended boolean,
  p_reason text
)
returns public.ar_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item public.ar_items;
  suspension private.admin_ar_item_suspensions;
begin
  perform private.require_admin_mfa();
  select item.* into target_item
  from public.ar_items item
  where item.id = p_ar_item_id and item.account_id = p_target_account_id and item.deleted_at is null
  for update;
  if not found then raise exception 'AR item not found' using errcode = '23503'; end if;

  if p_suspended then
    if target_item.status = 'suspended' then return target_item; end if;
    insert into private.admin_ar_item_suspensions (
      account_id, ar_item_id, previous_status, reason, suspended_by
    ) values (
      p_target_account_id, p_ar_item_id, target_item.status, btrim(p_reason), (select auth.uid())
    ) returning * into suspension;
    update public.ar_items
    set status = 'suspended', visibility = 'private', published_at = null
    where id = p_ar_item_id returning * into target_item;
  else
    select record.* into suspension
    from private.admin_ar_item_suspensions record
    where record.ar_item_id = p_ar_item_id and record.released_at is null
    for update;
    if not found or target_item.status <> 'suspended' then
      raise exception 'Active suspension not found' using errcode = '23503';
    end if;
    update private.admin_ar_item_suspensions
    set released_by = (select auth.uid()), released_at = statement_timestamp()
    where id = suspension.id;
    update public.ar_items
    set status = case
          when suspension.previous_status = 'published' then 'ready'::public.ar_item_status
          else suspension.previous_status
        end,
        visibility = 'private',
        published_at = null
    where id = p_ar_item_id returning * into target_item;
  end if;

  perform private.write_admin_audit(
    p_target_account_id,
    case when p_suspended then 'admin.ar_item.suspend' else 'admin.ar_item.restore' end,
    'ar_items',
    p_ar_item_id::text,
    p_reason,
    jsonb_build_object('suspended', p_suspended, 'previousStatus', suspension.previous_status)
  );
  return target_item;
end;
$$;

create or replace function public.admin_retry_processing_job(
  p_target_account_id uuid,
  p_job_id bigint,
  p_reason text
)
returns public.processing_jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_job public.processing_jobs;
begin
  perform private.require_admin_mfa();
  update public.processing_jobs job
  set status = 'queued',
      progress = 0,
      attempt_count = 0,
      error_code = null,
      error_message = null,
      started_at = null,
      completed_at = null,
      locked_at = null,
      locked_by = null
  where job.id = p_job_id
    and job.account_id = p_target_account_id
    and job.status = 'failed'
    and exists (
      select 1 from public.ar_items item
      where item.id = job.ar_item_id
        and item.account_id = job.account_id
        and item.deleted_at is null
        and (job.input_metadata ->> 'revision')::integer = item.version
    )
  returning * into target_job;
  if not found then raise exception 'Retryable processing job not found' using errcode = '23503'; end if;

  update public.ar_items
  set status = 'processing',
      tracking_status = case when tracking_status = 'failed' then 'analyzing' else tracking_status end
  where id = target_job.ar_item_id;
  perform private.write_admin_audit(
    p_target_account_id,
    'admin.processing.retry',
    'processing_jobs',
    p_job_id::text,
    p_reason,
    jsonb_build_object('arItemId', target_job.ar_item_id, 'jobType', target_job.type)
  );
  return target_job;
end;
$$;

create or replace function public.admin_authorize_password_reset(
  p_target_account_id uuid,
  p_target_user_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.require_admin_mfa();
  if not exists (
    select 1
    from public.account_members member
    join public.profiles profile on profile.id = member.user_id
    where member.account_id = p_target_account_id
      and member.user_id = p_target_user_id
      and profile.is_active
  ) then
    raise exception 'Account user not found' using errcode = '23503';
  end if;
  perform private.write_admin_audit(
    p_target_account_id,
    'admin.password_reset.request',
    'profiles',
    p_target_user_id::text,
    p_reason,
    '{}'::jsonb
  );
  return jsonb_build_object('authorized', true, 'userId', p_target_user_id);
end;
$$;

create or replace function public.admin_create_account_with_reason(
  p_owner_user_id uuid,
  p_account_name text,
  p_account_slug text,
  p_subscription_plan_id uuid,
  p_subscription_status public.subscription_status,
  p_subscription_starts_at timestamptz,
  p_subscription_expires_at timestamptz,
  p_subscription_grace_ends_at timestamptz,
  p_custom_limits jsonb,
  p_reason text
)
returns public.accounts
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_account public.accounts;
begin
  perform private.require_admin_mfa();
  created_account := public.admin_create_account(
    p_owner_user_id,
    p_account_name,
    p_account_slug,
    p_subscription_plan_id,
    p_subscription_status,
    p_subscription_starts_at,
    p_subscription_expires_at,
    p_subscription_grace_ends_at,
    p_custom_limits
  );
  perform private.write_admin_audit(
    created_account.id,
    'admin.account.create',
    'accounts',
    created_account.id::text,
    p_reason,
    jsonb_build_object('subscriptionPlanId', p_subscription_plan_id)
  );
  return created_account;
end;
$$;

revoke execute on function public.admin_create_account(
  uuid, text, text, uuid, public.subscription_status, timestamptz, timestamptz, timestamptz, jsonb
) from authenticated;
revoke execute on function public.admin_update_subscription(
  uuid, uuid, public.subscription_status, timestamptz, timestamptz, timestamptz, jsonb
) from authenticated;

revoke all on function private.admin_mfa_verified() from public, anon, authenticated;
revoke all on function private.require_admin_mfa() from public, anon, authenticated;
revoke all on function private.write_admin_audit(uuid, text, text, text, text, jsonb)
from public, anon, authenticated;

revoke all on function public.get_admin_access() from public, anon, authenticated;
revoke all on function public.admin_get_overview() from public, anon, authenticated;
revoke all on function public.admin_list_accounts(text, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_get_account_detail(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_list_plans() from public, anon, authenticated;
revoke all on function public.admin_get_processing_errors(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_search_content(text, integer) from public, anon, authenticated;
revoke all on function public.admin_get_audit_logs(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_get_system_settings() from public, anon, authenticated;
revoke all on function public.admin_update_system_setting(text, jsonb, text) from public, anon, authenticated;
revoke all on function public.admin_upsert_plan(
  uuid, text, text, text, bigint, integer, integer, integer, integer, bigint, integer, boolean, text
) from public, anon, authenticated;
revoke all on function public.admin_update_subscription_with_reason(
  uuid, uuid, public.subscription_status, timestamptz, timestamptz, timestamptz, jsonb, text
) from public, anon, authenticated;
revoke all on function public.admin_set_account_status(uuid, public.account_status, text)
from public, anon, authenticated;
revoke all on function public.admin_set_ar_item_suspended(uuid, uuid, boolean, text)
from public, anon, authenticated;
revoke all on function public.admin_retry_processing_job(uuid, bigint, text)
from public, anon, authenticated;
revoke all on function public.admin_authorize_password_reset(uuid, uuid, text)
from public, anon, authenticated;
revoke all on function public.admin_create_account_with_reason(
  uuid, text, text, uuid, public.subscription_status, timestamptz, timestamptz, timestamptz, jsonb, text
) from public, anon, authenticated;

grant execute on function public.get_admin_access() to authenticated;
grant execute on function public.admin_get_overview() to authenticated;
grant execute on function public.admin_list_accounts(text, integer, integer) to authenticated;
grant execute on function public.admin_get_account_detail(uuid, text) to authenticated;
grant execute on function public.admin_list_plans() to authenticated;
grant execute on function public.admin_get_processing_errors(uuid, integer, integer) to authenticated;
grant execute on function public.admin_search_content(text, integer) to authenticated;
grant execute on function public.admin_get_audit_logs(uuid, integer, integer) to authenticated;
grant execute on function public.admin_get_system_settings() to authenticated;
grant execute on function public.admin_update_system_setting(text, jsonb, text) to authenticated;
grant execute on function public.admin_upsert_plan(
  uuid, text, text, text, bigint, integer, integer, integer, integer, bigint, integer, boolean, text
) to authenticated;
grant execute on function public.admin_update_subscription_with_reason(
  uuid, uuid, public.subscription_status, timestamptz, timestamptz, timestamptz, jsonb, text
) to authenticated;
grant execute on function public.admin_set_account_status(uuid, public.account_status, text) to authenticated;
grant execute on function public.admin_set_ar_item_suspended(uuid, uuid, boolean, text) to authenticated;
grant execute on function public.admin_retry_processing_job(uuid, bigint, text) to authenticated;
grant execute on function public.admin_authorize_password_reset(uuid, uuid, text) to authenticated;
grant execute on function public.admin_create_account_with_reason(
  uuid, text, text, uuid, public.subscription_status, timestamptz, timestamptz, timestamptz, jsonb, text
) to authenticated;
