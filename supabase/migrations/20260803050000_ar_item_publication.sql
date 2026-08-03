-- Stage 7: trusted publication lifecycle and durable QR metadata.
create or replace function private.build_public_ar_url(
  p_public_base_url text,
  p_public_slug text
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized_base text := pg_catalog.rtrim(pg_catalog.btrim(coalesce(p_public_base_url, '')), '/');
begin
  if char_length(normalized_base) not between 10 and 1900
    or normalized_base !~ '^https://[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?(:[0-9]{1,5})?(/[A-Za-z0-9._~!$&''()*+,;=:@%/-]*)?$'
    or p_public_slug !~ '^[a-f0-9]{36}$'
  then
    raise exception 'Invalid public application URL' using errcode = '22023';
  end if;

  return normalized_base || '/ar/' || p_public_slug;
end;
$$;

create or replace function private.normalize_qr_style(p_style jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized jsonb := coalesce(p_style, '{}'::jsonb);
  preset text;
  foreground text;
  background text;
  quiet_zone numeric;
  include_logo boolean;
  logo_scale numeric;
begin
  if jsonb_typeof(normalized) <> 'object'
    or normalized - 'preset' - 'foreground' - 'background' - 'quietZone' - 'logo' - 'logoScale' <> '{}'::jsonb
  then
    raise exception 'Invalid QR style' using errcode = '22023';
  end if;

  preset := coalesce(normalized ->> 'preset', 'white');
  foreground := coalesce(normalized ->> 'foreground', '#0B0F14');
  background := coalesce(normalized ->> 'background', '#FFFFFF');
  quiet_zone := coalesce((normalized ->> 'quietZone')::numeric, 4);
  include_logo := coalesce((normalized ->> 'logo')::boolean, false);
  logo_scale := coalesce((normalized ->> 'logoScale')::numeric, 0.12);

  if preset not in ('white', 'transparent', 'brand')
    or foreground !~ '^#[0-9A-Fa-f]{6}$'
    or (background <> 'transparent' and background !~ '^#[0-9A-Fa-f]{6}$')
    or quiet_zone <> trunc(quiet_zone)
    or quiet_zone not between 4 and 8
    or logo_scale not between 0.08 and 0.20
  then
    raise exception 'Invalid QR style' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'preset', preset,
    'foreground', upper(foreground),
    'background', case when background = 'transparent' then background else upper(background) end,
    'quietZone', quiet_zone::integer,
    'logo', include_logo,
    'logoScale', logo_scale
  );
exception
  when invalid_text_representation then
    raise exception 'Invalid QR style' using errcode = '22023';
end;
$$;

create or replace function public.publish_ar_item(
  p_target_account_id uuid,
  p_item_id uuid,
  p_public_base_url text,
  p_expires_at timestamptz default null
)
returns public.qr_codes
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item public.ar_items;
  public_url text;
  current_revision_job_count integer;
  publication_qr public.qr_codes;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if p_expires_at is not null and p_expires_at <= statement_timestamp() + interval '5 minutes' then
    raise exception 'Publication expiry must be at least five minutes in the future' using errcode = '22023';
  end if;

  select i.* into target_item
  from public.ar_items i
  where i.id = p_item_id
    and i.account_id = p_target_account_id
    and i.deleted_at is null
  for update;
  if not found then
    raise exception 'AR item not found' using errcode = '23503';
  end if;

  if target_item.status not in ('ready', 'published')
    or target_item.tracking_status <> 'ready'
    or target_item.marker_asset_id is null
    or target_item.video_asset_id is null
    or target_item.marker_width is null
    or target_item.marker_height is null
    or target_item.tracking_dataset_path is null
    or target_item.video_thumbnail_path is null
    or not exists (
      select 1 from public.media_assets m
      where m.id = target_item.marker_asset_id
        and m.account_id = target_item.account_id
        and m.ar_item_id = target_item.id
        and m.kind = 'marker'
        and m.deleted_at is null
    )
    or not exists (
      select 1 from public.media_assets v
      where v.id = target_item.video_asset_id
        and v.account_id = target_item.account_id
        and v.ar_item_id = target_item.id
        and v.kind = 'video'
        and v.deleted_at is null
    )
  then
    raise exception 'AR item is not ready for publication' using errcode = '55000';
  end if;

  select count(*) into current_revision_job_count
  from public.processing_jobs j
  where j.account_id = target_item.account_id
    and j.ar_item_id = target_item.id
    and j.type in ('marker_analysis', 'video_inspection', 'marker_compilation', 'thumbnail_generation')
    and j.status = 'succeeded'
    and j.input_metadata ->> 'revision' = target_item.version::text;
  if current_revision_job_count <> 4 then
    raise exception 'AR item processing is incomplete' using errcode = '55000';
  end if;

  public_url := private.build_public_ar_url(p_public_base_url, target_item.public_slug);

  update public.ar_items
  set status = 'published',
      visibility = 'public',
      published_at = coalesce(published_at, statement_timestamp()),
      expires_at = p_expires_at
  where id = target_item.id;

  insert into public.qr_codes (account_id, ar_item_id, public_url, style)
  values (
    target_item.account_id,
    target_item.id,
    public_url,
    private.normalize_qr_style(null)
  )
  on conflict (ar_item_id) do update
  set public_url = excluded.public_url
  returning * into publication_qr;

  return publication_qr;
end;
$$;

create or replace function public.unpublish_ar_item(
  p_target_account_id uuid,
  p_item_id uuid
)
returns public.ar_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item public.ar_items;
begin
  if (select auth.uid()) is null
    or not (select private.has_account_role(
      p_target_account_id,
      array['owner'::public.member_role, 'manager'::public.member_role, 'editor'::public.member_role]
    )) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;

  select i.* into target_item
  from public.ar_items i
  where i.id = p_item_id
    and i.account_id = p_target_account_id
    and i.deleted_at is null
  for update;
  if not found then
    raise exception 'AR item not found' using errcode = '23503';
  end if;
  if target_item.status <> 'published' then
    raise exception 'AR item is not published' using errcode = '55000';
  end if;

  update public.ar_items
  set status = 'ready',
      visibility = 'private',
      published_at = null
  where id = target_item.id
  returning * into target_item;
  return target_item;
end;
$$;

create or replace function public.rotate_ar_item_public_slug(
  p_target_account_id uuid,
  p_item_id uuid,
  p_public_base_url text
)
returns public.qr_codes
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item public.ar_items;
  new_slug text;
  rotated_qr public.qr_codes;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;

  select i.* into target_item
  from public.ar_items i
  where i.id = p_item_id
    and i.account_id = p_target_account_id
    and i.deleted_at is null
  for update;
  if not found then
    raise exception 'AR item not found' using errcode = '23503';
  end if;
  if target_item.status <> 'published' then
    raise exception 'AR item must be published before slug rotation' using errcode = '55000';
  end if;

  new_slug := private.new_public_slug();
  update public.ar_items set public_slug = new_slug where id = target_item.id;

  update public.qr_codes
  set public_url = private.build_public_ar_url(p_public_base_url, new_slug),
      svg_path = null,
      png_path = null,
      version = version + 1
  where ar_item_id = target_item.id and account_id = target_item.account_id
  returning * into rotated_qr;
  if not found then
    raise exception 'QR publication metadata not found' using errcode = '55000';
  end if;
  return rotated_qr;
end;
$$;

create or replace function public.update_ar_item_qr_style(
  p_target_account_id uuid,
  p_item_id uuid,
  p_style jsonb
)
returns public.qr_codes
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_qr public.qr_codes;
begin
  if (select auth.uid()) is null
    or not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;

  update public.qr_codes q
  set style = private.normalize_qr_style(p_style),
      svg_path = null,
      png_path = null,
      version = q.version + 1
  where q.account_id = p_target_account_id
    and q.ar_item_id = p_item_id
    and exists (
      select 1 from public.ar_items i
      where i.id = q.ar_item_id
        and i.account_id = q.account_id
        and i.status = 'published'
        and i.deleted_at is null
    )
  returning * into updated_qr;
  if not found then
    raise exception 'Published QR metadata not found' using errcode = '23503';
  end if;
  return updated_qr;
end;
$$;

create trigger qr_codes_audit
after insert or update or delete on public.qr_codes
for each row execute function private.write_audit_log();

revoke update (
  status,
  marker_image_path,
  marker_preview_path,
  video_path,
  video_thumbnail_path,
  video_duration_seconds,
  marker_width,
  marker_height,
  tracking_dataset_path,
  tracking_status,
  visibility,
  autoplay,
  loop_video,
  marker_lost_behavior,
  audio_default,
  fallback_enabled,
  version,
  published_at,
  expires_at,
  deleted_at
) on public.ar_items from authenticated;

revoke all on function private.build_public_ar_url(text, text) from public, anon, authenticated;
revoke all on function private.normalize_qr_style(jsonb) from public, anon, authenticated;
revoke all on function public.publish_ar_item(uuid, uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.unpublish_ar_item(uuid, uuid) from public, anon, authenticated;
revoke all on function public.rotate_ar_item_public_slug(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.update_ar_item_qr_style(uuid, uuid, jsonb) from public, anon, authenticated;

grant execute on function public.publish_ar_item(uuid, uuid, text, timestamptz) to authenticated;
grant execute on function public.unpublish_ar_item(uuid, uuid) to authenticated;
grant execute on function public.rotate_ar_item_public_slug(uuid, uuid, text) to authenticated;
grant execute on function public.update_ar_item_qr_style(uuid, uuid, jsonb) to authenticated;
