-- Self-service registration: confirmed email users receive one isolated trial workspace.

insert into public.subscription_plans (
  code,
  name,
  description,
  storage_limit_bytes,
  project_limit,
  group_limit,
  ar_item_limit,
  video_duration_limit_seconds,
  max_video_size_bytes,
  team_limit,
  is_active
)
values (
  'trial',
  'Trial',
  '14-day self-service trial',
  1073741824,
  3,
  12,
  100,
  120,
  52428800,
  3,
  true
)
on conflict (code) do nothing;

create or replace function public.bootstrap_self_service_account()
returns public.accounts
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  caller auth.users;
  trial_plan_id uuid;
  account_name text;
  account_slug text;
  existing_account public.accounts;
  created_account public.accounts;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select u.* into caller
  from auth.users u
  where u.id = caller_id;

  if not found or caller.email_confirmed_at is null then
    raise exception 'Email confirmation required' using errcode = '42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('self-service-account:' || caller_id::text, 0)
  );

  select a.* into existing_account
  from public.accounts a
  where a.owner_user_id = caller_id
    and a.status <> 'closed'
  limit 1;
  if found then
    return existing_account;
  end if;

  select p.id into trial_plan_id
  from public.subscription_plans p
  where p.code = 'trial'
    and p.is_active;
  if trial_plan_id is null then
    raise exception 'Self-service trial is unavailable' using errcode = '55000';
  end if;

  account_name := left(
    coalesce(
      nullif(btrim(caller.raw_user_meta_data ->> 'account_name'), ''),
      nullif(btrim(caller.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(caller.email, ''), '@', 1), ''),
      'AR Photo workspace'
    ),
    120
  );
  account_slug := trim(both '-' from left(
    regexp_replace(lower(account_name), '[^a-z0-9]+', '-', 'g'),
    48
  ));
  if char_length(account_slug) < 3 then
    account_slug := 'workspace';
  end if;
  account_slug := account_slug || '-' || left(replace(caller_id::text, '-', ''), 8);

  insert into public.accounts (name, slug, owner_user_id)
  values (account_name, account_slug, caller_id)
  returning * into created_account;

  update public.profiles
  set account_id = created_account.id,
      is_active = true,
      full_name = coalesce(
        nullif(btrim(caller.raw_user_meta_data ->> 'full_name'), ''),
        full_name
      )
  where id = caller_id;

  insert into public.account_members (
    account_id,
    user_id,
    role,
    permissions,
    is_active,
    accepted_at
  ) values (
    created_account.id,
    caller_id,
    'owner',
    '{}'::jsonb,
    true,
    statement_timestamp()
  );

  insert into public.subscriptions (
    account_id,
    plan_id,
    status,
    starts_at,
    expires_at,
    grace_period_ends_at
  ) values (
    created_account.id,
    trial_plan_id,
    'trial',
    statement_timestamp(),
    statement_timestamp() + interval '14 days',
    statement_timestamp() + interval '21 days'
  );

  return created_account;
end;
$$;

revoke all on function public.bootstrap_self_service_account() from public, anon, authenticated;
grant execute on function public.bootstrap_self_service_account() to authenticated;
