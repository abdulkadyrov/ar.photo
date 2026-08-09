-- Optional grouped AR: every existing item starts in its own one-item bundle,
-- while Quick Start can attach additional drafts to the first item's bundle.
alter table public.ar_items
  add column qr_bundle_id uuid not null default gen_random_uuid();

create index ar_items_qr_bundle_idx
  on public.ar_items(account_id, qr_bundle_id, created_at, id)
  where deleted_at is null;

create or replace function public.create_ar_item_draft_in_bundle(
  p_target_account_id uuid,
  p_target_project_id uuid,
  p_target_group_id uuid,
  p_bundle_root_item_id uuid,
  p_title text,
  p_description text,
  p_request_id uuid
)
returns public.ar_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  bundle_root public.ar_items;
  created_item public.ar_items;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;

  select i.* into bundle_root
  from public.ar_items i
  where i.id = p_bundle_root_item_id
    and i.account_id = p_target_account_id
    and i.project_id = p_target_project_id
    and i.group_id = p_target_group_id
    and i.deleted_at is null
  for update;
  if not found then
    raise exception 'AR bundle root not found' using errcode = '23503';
  end if;
  if bundle_root.status not in ('draft', 'processing', 'ready') then
    raise exception 'Published AR bundle cannot accept new items' using errcode = '55000';
  end if;

  created_item := public.create_ar_item_draft(
    p_target_account_id,
    p_target_project_id,
    p_target_group_id,
    p_title,
    p_description,
    p_request_id
  );

  if created_item.qr_bundle_id <> bundle_root.qr_bundle_id then
    if created_item.status <> 'draft'
      or created_item.project_id <> bundle_root.project_id
      or created_item.group_id <> bundle_root.group_id then
      raise exception 'Existing AR item belongs to another bundle' using errcode = '55000';
    end if;
    update public.ar_items
    set qr_bundle_id = bundle_root.qr_bundle_id
    where id = created_item.id
      and account_id = p_target_account_id
    returning * into created_item;
  end if;

  return created_item;
end;
$$;

create or replace function public.publish_ar_bundle(
  p_target_account_id uuid,
  p_root_item_id uuid,
  p_public_base_url text,
  p_expires_at timestamptz default null
)
returns public.qr_codes
language plpgsql
security definer
set search_path = ''
as $$
declare
  bundle_root public.ar_items;
  bundle_item public.ar_items;
  publication_qr public.qr_codes;
  bundle_size integer;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;

  select i.* into bundle_root
  from public.ar_items i
  where i.id = p_root_item_id
    and i.account_id = p_target_account_id
    and i.deleted_at is null
  for update;
  if not found then
    raise exception 'AR bundle root not found' using errcode = '23503';
  end if;

  select count(*) into bundle_size
  from public.ar_items i
  where i.account_id = bundle_root.account_id
    and i.qr_bundle_id = bundle_root.qr_bundle_id
    and i.deleted_at is null;
  if bundle_size < 1 or bundle_size > 20 then
    raise exception 'AR bundle size must be between 1 and 20' using errcode = '23514';
  end if;

  for bundle_item in
    select i.*
    from public.ar_items i
    where i.account_id = bundle_root.account_id
      and i.qr_bundle_id = bundle_root.qr_bundle_id
      and i.deleted_at is null
    order by (i.id = bundle_root.id) desc, i.created_at, i.id
  loop
    publication_qr := public.publish_ar_item(
      p_target_account_id,
      bundle_item.id,
      p_public_base_url,
      p_expires_at
    );
  end loop;

  delete from public.qr_codes q
  using public.ar_items i
  where q.ar_item_id = i.id
    and i.account_id = bundle_root.account_id
    and i.qr_bundle_id = bundle_root.qr_bundle_id
    and i.id <> bundle_root.id;

  select q.* into publication_qr
  from public.qr_codes q
  where q.account_id = bundle_root.account_id
    and q.ar_item_id = bundle_root.id;
  return publication_qr;
end;
$$;

create or replace function public.unpublish_ar_bundle(
  p_target_account_id uuid,
  p_root_item_id uuid
)
returns public.ar_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  bundle_root public.ar_items;
  bundle_item public.ar_items;
begin
  if (select auth.uid()) is null
    or not (select private.has_account_role(
      p_target_account_id,
      array['owner'::public.member_role, 'manager'::public.member_role, 'editor'::public.member_role]
    )) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;

  select i.* into bundle_root
  from public.ar_items i
  where i.id = p_root_item_id
    and i.account_id = p_target_account_id
    and i.deleted_at is null;
  if not found then
    raise exception 'AR bundle root not found' using errcode = '23503';
  end if;

  for bundle_item in
    select i.*
    from public.ar_items i
    where i.account_id = bundle_root.account_id
      and i.qr_bundle_id = bundle_root.qr_bundle_id
      and i.deleted_at is null
      and i.status = 'published'
    order by (i.id = bundle_root.id), i.created_at desc, i.id desc
  loop
    perform public.unpublish_ar_item(p_target_account_id, bundle_item.id);
  end loop;

  select i.* into bundle_root
  from public.ar_items i
  where i.id = p_root_item_id and i.account_id = p_target_account_id;
  return bundle_root;
end;
$$;

-- Keep the original RPC name so an older deployed Edge Function can safely
-- read the first row until the bundle-aware function deployment reaches it.
drop function public.get_public_ar_manifest_source(text);
create function public.get_public_ar_manifest_source(p_public_slug text)
returns table (
  target_index integer,
  title text,
  marker_width integer,
  marker_height integer,
  autoplay boolean,
  loop_video boolean,
  marker_lost_behavior public.marker_lost_behavior,
  audio_default text,
  fallback_enabled boolean,
  tracking_bucket text,
  tracking_path text,
  video_bucket text,
  video_path text,
  poster_bucket text,
  poster_path text
)
language sql
stable
security definer
set search_path = ''
as $$
  with bundle_root as (
    select root.account_id, root.id, root.qr_bundle_id
    from public.ar_items root
    join public.accounts a on a.id = root.account_id
    join public.subscriptions s on s.account_id = root.account_id
    where p_public_slug ~ '^[a-f0-9]{36}$'
      and root.public_slug = p_public_slug
      and root.status = 'published'
      and root.visibility = 'public'
      and root.published_at is not null
      and root.deleted_at is null
      and (root.expires_at is null or root.expires_at > statement_timestamp())
      and a.status = 'active'
      and (
        (s.status in ('trial', 'active') and (s.expires_at is null or s.expires_at > statement_timestamp()))
        or (s.status = 'grace_period' and s.grace_period_ends_at > statement_timestamp())
      )
    limit 1
  )
  select
    (row_number() over (order by (i.id = root.id) desc, i.created_at, i.id) - 1)::integer as target_index,
    i.title,
    i.marker_width,
    i.marker_height,
    i.autoplay,
    i.loop_video,
    i.marker_lost_behavior,
    i.audio_default,
    i.fallback_enabled,
    'generated-private'::text as tracking_bucket,
    i.tracking_dataset_path as tracking_path,
    video.storage_bucket as video_bucket,
    video.storage_path as video_path,
    'generated-private'::text as poster_bucket,
    i.video_thumbnail_path as poster_path
  from bundle_root root
  join public.ar_items i
    on i.account_id = root.account_id
   and i.qr_bundle_id = root.qr_bundle_id
  join public.media_assets video
    on video.id = i.video_asset_id
   and video.account_id = i.account_id
   and video.kind = 'video'
   and video.deleted_at is null
  where i.status = 'published'
    and i.visibility = 'public'
    and i.published_at is not null
    and i.deleted_at is null
    and (i.expires_at is null or i.expires_at > statement_timestamp())
    and i.tracking_status = 'ready'
    and i.tracking_dataset_path is not null
    and i.video_thumbnail_path is not null
    and i.marker_width > 0
    and i.marker_height > 0
  order by target_index
  limit 20;
$$;

revoke all on function public.create_ar_item_draft_in_bundle(uuid, uuid, uuid, uuid, text, text, uuid)
from public, anon, authenticated;
revoke all on function public.publish_ar_bundle(uuid, uuid, text, timestamptz)
from public, anon, authenticated;
revoke all on function public.unpublish_ar_bundle(uuid, uuid)
from public, anon, authenticated;
revoke all on function public.get_public_ar_manifest_source(text)
from public, anon, authenticated;

grant execute on function public.create_ar_item_draft_in_bundle(uuid, uuid, uuid, uuid, text, text, uuid)
to authenticated;
grant execute on function public.publish_ar_bundle(uuid, uuid, text, timestamptz)
to authenticated;
grant execute on function public.unpublish_ar_bundle(uuid, uuid)
to authenticated;
grant execute on function public.get_public_ar_manifest_source(text)
to service_role;
