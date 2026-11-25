-- Purchaser capabilities are scoped to one printed card; no account membership,
-- auth impersonation, or changes to existing account permissions are introduced.
alter table public.postcard_batches
  add column project_id uuid,
  add column group_id uuid,
  add column issued_by uuid references auth.users(id) on delete restrict,
  add constraint postcard_batches_project_account_fkey foreign key(project_id,account_id) references public.projects(id,account_id) on delete restrict,
  add constraint postcard_batches_group_project_account_fkey foreign key(group_id,project_id,account_id) references public.groups(id,project_id,account_id) on delete restrict;
create index postcard_batches_project_account_idx on public.postcard_batches(project_id,account_id);
create index postcard_batches_group_project_account_idx on public.postcard_batches(group_id,project_id,account_id);
create index postcard_batches_issued_by_idx on public.postcard_batches(issued_by);

alter table public.postcard_cards
  add column print_marker_asset_id uuid,
  add column printed_at timestamptz,
  add column display_mode text not null default 'frame' check(display_mode in ('frame','full')),
  add column video_viewport jsonb,
  add constraint postcard_cards_print_marker_account_fkey foreign key(print_marker_asset_id,account_id) references public.media_assets(id,account_id) on delete restrict;
create unique index postcard_cards_ar_item_unique on public.postcard_cards(ar_item_id) where ar_item_id is not null;
create unique index postcard_cards_print_marker_unique on public.postcard_cards(print_marker_asset_id,account_id) where print_marker_asset_id is not null;

create table private.postcard_template_layouts (
  template_code text primary key,
  frame jsonb not null,
  constraint postcard_template_frame_valid check (
    jsonb_typeof(frame)='object' and (frame->>'x')::numeric >= 0 and (frame->>'y')::numeric >= 0
    and (frame->>'width')::numeric > 0 and (frame->>'height')::numeric > 0
    and (frame->>'x')::numeric+(frame->>'width')::numeric <= 1
    and (frame->>'y')::numeric+(frame->>'height')::numeric <= 1
  )
);
-- These immutable v1 inner-window coordinates are matched to the shipped artwork.
insert into private.postcard_template_layouts(template_code,frame) values
 ('new-year','{"x":0.09,"y":0.27,"width":0.82,"height":0.455}'),
 ('eid','{"x":0.1,"y":0.285,"width":0.8,"height":0.46}'),
 ('march-8','{"x":0.09,"y":0.19,"width":0.82,"height":0.59}'),
 ('autumn-ball','{"x":0.09,"y":0.186,"width":0.82,"height":0.56}'),
 ('best-friend','{"x":0.08,"y":0.255,"width":0.84,"height":0.47}'),
 ('brother-vip','{"x":0.1,"y":0.295,"width":0.8,"height":0.45}');

create table private.postcard_claims (
  card_id uuid primary key references public.postcard_cards(id) on delete restrict,
  edit_token_hash text not null check(edit_token_hash ~ '^[a-f0-9]{64}$'),
  latest_upload_id uuid,
  created_at timestamptz not null default now()
);
create table private.postcard_buyer_uploads (
  id uuid primary key,
  card_id uuid not null references public.postcard_cards(id) on delete restrict,
  session_id uuid not null unique references public.upload_sessions(id) on delete restrict,
  display_mode text not null check(display_mode in ('frame','full')),
  video_metadata jsonb not null,
  sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index postcard_buyer_uploads_card_idx on private.postcard_buyer_uploads(card_id);
alter table private.postcard_claims add foreign key(latest_upload_id) references private.postcard_buyer_uploads(id) on delete restrict;
create index postcard_claims_latest_upload_idx on private.postcard_claims(latest_upload_id);
alter table private.postcard_template_layouts enable row level security;
alter table private.postcard_claims enable row level security;
alter table private.postcard_buyer_uploads enable row level security;
revoke all on private.postcard_template_layouts, private.postcard_claims, private.postcard_buyer_uploads from public,anon,authenticated,service_role;

create function public.postcard_prepare_batch(p_account_id uuid,p_batch_id uuid) returns public.postcard_batches
language plpgsql security definer set search_path='' as $$
declare b public.postcard_batches; p public.projects; g public.groups;
begin
 perform private.require_postcard_manager(p_account_id);
 select * into b from public.postcard_batches where id=p_batch_id and account_id=p_account_id for update;
 if not found then raise exception 'Batch not found' using errcode='P0002'; end if;
 if b.group_id is not null then return b; end if;
 p := public.create_project(p_account_id,'AR-открытки','Тиражи печатных AR-открыток','other','7a000000-0000-4000-8000-000000000001');
 g := public.create_group(p_account_id,p.id,b.name,'Печатный тираж '||b.id::text,b.id);
 update public.postcard_batches set project_id=p.id,group_id=g.id,issued_by=auth.uid() where id=b.id returning * into b;
 return b;
end; $$;

create function public.postcard_attach_print_marker(p_account_id uuid,p_card_id uuid,p_asset_id uuid) returns public.postcard_cards
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; b public.postcard_batches; m public.media_assets;
begin
 perform private.require_postcard_manager(p_account_id);
 select * into c from public.postcard_cards where id=p_card_id and account_id=p_account_id for update;
 if not found then raise exception 'Card not found' using errcode='P0002'; end if;
 if c.print_marker_asset_id=p_asset_id then return c; end if;
 if c.print_marker_asset_id is not null or c.activated_at is not null then
   raise exception 'Printed artwork is immutable' using errcode='55000';
 end if;
 select * into b from public.postcard_batches where id=c.batch_id and account_id=p_account_id;
 select * into m from public.media_assets where id=p_asset_id and account_id=p_account_id and deleted_at is null;
 if not found or m.kind<>'marker' or m.project_id is distinct from b.project_id or m.group_id is distinct from b.group_id
   or m.ar_item_id is not null or m.mime_type<>'image/png' or m.sha256 is null
   or m.metadata->>'width'<>'1200' or m.metadata->>'height'<>'1800' then
   raise exception 'Canonical postcard marker required' using errcode='22023';
 end if;
 update public.postcard_cards set print_marker_asset_id=m.id,printed_at=statement_timestamp() where id=c.id returning * into c;
 insert into public.audit_logs(account_id,actor_user_id,action,entity_type,entity_id,metadata)
 values(p_account_id,auth.uid(),'postcard.print.registered','postcard_cards',c.id,jsonb_build_object('assetId',m.id));
 return c;
end; $$;
revoke all on function public.postcard_prepare_batch(uuid,uuid),public.postcard_attach_print_marker(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.postcard_prepare_batch(uuid,uuid),public.postcard_attach_print_marker(uuid,uuid,uuid) to authenticated;

create function private.require_postcard_service() returns void
language plpgsql security definer set search_path='' as $$
begin
 if coalesce(auth.jwt()->>'role','') <> 'service_role' then
   raise exception 'Service access required' using errcode='42501';
 end if;
end; $$;
revoke all on function private.require_postcard_service() from public,anon,authenticated,service_role;

create function public.postcard_buyer_state(p_public_token text,p_edit_hash text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; b public.postcard_batches; i public.ar_items; owned boolean; frame jsonb; state text; jobs jsonb;
begin
 perform private.require_postcard_service();
 select * into c from public.postcard_cards where public_token=p_public_token;
 if not found then return jsonb_build_object('error','invalid_card'); end if;
 select * into b from public.postcard_batches where id=c.batch_id;
 select l.frame into frame from private.postcard_template_layouts l where l.template_code=b.template_code;
 owned := exists(select 1 from private.postcard_claims where card_id=c.id and edit_token_hash=p_edit_hash);
 if c.ar_item_id is not null then select * into i from public.ar_items where id=c.ar_item_id and account_id=c.account_id; end if;
 state := case
   when i.status='published' and i.deleted_at is null then 'published'
   when c.shop_id is null or c.print_marker_asset_id is null or b.group_id is null or not private.subscription_allows_write(c.account_id) then 'unavailable'
   when c.ar_item_id is null then 'available'
   when i.deleted_at is not null or i.status in ('archived','suspended') then 'unavailable'
   when i.status='processing' then 'processing'
   when i.status='ready' then 'ready'
   else 'claimed' end;
 if owned and i.id is not null then
   select coalesce(jsonb_agg(jsonb_build_object('stage',j.type,'status',j.status,'progress',j.progress,'errorCode',j.error_code) order by j.id),'[]'::jsonb)
   into jobs from public.processing_jobs j where j.ar_item_id=i.id and j.account_id=c.account_id and j.input_metadata->>'revision'=i.version::text;
 end if;
 return jsonb_build_object(
   'card',jsonb_build_object('publicToken',c.public_token,'templateCode',b.template_code,'title',b.name,'state',state,'mode',c.display_mode,'frame',frame,'videoViewport',c.video_viewport,
     'publicSlug',case when i.status='published' and i.deleted_at is null then i.public_slug else null end),
   'limits',jsonb_build_object('maxVideoBytes',least(104857600::bigint,coalesce(private.effective_limit(c.account_id,'max_video_size_bytes'),104857600)),
     'maxVideoSeconds',least(120::bigint,coalesce(private.effective_limit(c.account_id,'video_duration_limit_seconds'),120))),
   'owned',owned,'jobs',coalesce(jobs,'[]'::jsonb),
   '_previewAssetId',c.print_marker_asset_id,
   '_videoAssetId',case when owned then i.video_asset_id else null end
 );
end; $$;

create function public.postcard_buyer_claim(p_public_token text,p_shop_code text,p_edit_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; b public.postcard_batches; i public.ar_items; existing_hash text; item_limit bigint;
begin
 perform private.require_postcard_service();
 if p_edit_hash is null or p_edit_hash !~ '^[a-f0-9]{64}$' then return jsonb_build_object('error','invalid_card'); end if;
 select * into c from public.postcard_cards where public_token=p_public_token for update;
 if not found then return jsonb_build_object('error','invalid_card'); end if;
 select edit_token_hash into existing_hash from private.postcard_claims where card_id=c.id;
 if found then
   if existing_hash=p_edit_hash then return public.postcard_buyer_state(p_public_token,p_edit_hash); end if;
   return jsonb_build_object('error','invalid_card');
 end if;
 select * into b from public.postcard_batches where id=c.batch_id;
 if c.shop_id is null or c.print_marker_asset_id is null or b.group_id is null
   or not exists(select 1 from private.postcard_shop_secrets where shop_id=c.shop_id and activation_code=regexp_replace(upper(trim(p_shop_code)),'[[:space:]·-]','','g')) then
   return jsonb_build_object('error','invalid_card');
 end if;
 if not private.subscription_allows_write(c.account_id) then return jsonb_build_object('error','activation_unavailable'); end if;
 if not exists(select 1 from public.groups g join public.projects p on p.id=g.project_id and p.account_id=g.account_id
    where g.id=b.group_id and g.account_id=c.account_id and g.archived_at is null and g.deleted_at is null and p.deleted_at is null and p.status<>'archived') then
   return jsonb_build_object('error','activation_unavailable');
 end if;
 perform pg_advisory_xact_lock(hashtextextended('ar-item-quota:'||c.account_id::text,0));
 item_limit := private.effective_limit(c.account_id,'ar_item_limit');
 if item_limit is not null and (select count(*) from public.ar_items where account_id=c.account_id and deleted_at is null)>=item_limit then
   return jsonb_build_object('error','activation_unavailable');
 end if;
 -- Existing credit-spend trigger is authoritative and runs exactly once here.
 insert into public.ar_items(account_id,project_id,group_id,title,description,idempotency_key,created_by)
 values(c.account_id,b.project_id,b.group_id,left(b.name||' № '||c.ordinal,160),'AR-открытка: самостоятельная активация покупателем',c.id,b.issued_by) returning * into i;
 insert into private.postcard_claims(card_id,edit_token_hash) values(c.id,p_edit_hash);
 update public.postcard_cards set ar_item_id=i.id,activated_at=statement_timestamp() where id=c.id;
 insert into public.audit_logs(account_id,actor_user_id,action,entity_type,entity_id,metadata)
 values(c.account_id,null,'postcard.buyer.claimed','postcard_cards',c.id,jsonb_build_object('arItemId',i.id,'actor','purchaser'));
 return public.postcard_buyer_state(p_public_token,p_edit_hash);
end; $$;

-- Service-only scoped adapter retains all storage/media/job/publication checks
-- from supabase/migrations/20260804162758_allow_server_transcode_source_uploads.sql. Original account RPC is unchanged.
create function private.postcard_finalize_media_upload(
  p_session_id uuid,
  p_sha256 text,
  p_metadata jsonb
)
returns public.media_assets
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session public.upload_sessions;
  existing_asset public.media_assets;
  created_asset public.media_assets;
  object_size bigint;
  object_mime text;
  storage_limit bigint;
  duration_limit bigint;
  server_transcode_required boolean;
begin
  select u.* into target_session
  from public.upload_sessions u
  where u.id = p_session_id
  for update;
  if not found then
    raise exception 'Upload session not found' using errcode = '23503';
  end if;
  perform private.require_postcard_service();
  if target_session.status = 'finalized' then
    select m.* into existing_asset from public.media_assets m where m.id = target_session.asset_id;
    return existing_asset;
  end if;
  if target_session.status <> 'uploading' or target_session.expires_at <= statement_timestamp() then
    raise exception 'Upload session is not ready to finalize' using errcode = '55000';
  end if;
  if p_sha256 is null or p_sha256 !~ '^[a-f0-9]{64}$' then
    raise exception 'Valid SHA-256 is required' using errcode = '22023';
  end if;
  if p_metadata is null or jsonb_typeof(p_metadata) <> 'object' then
    raise exception 'Media metadata must be an object' using errcode = '22023';
  end if;

  if target_session.kind = 'marker' then
    if jsonb_typeof(p_metadata -> 'width') is distinct from 'number'
      or jsonb_typeof(p_metadata -> 'height') is distinct from 'number'
      or p_metadata -> 'exifStripped' is distinct from 'true'::jsonb
    then
      raise exception 'Valid normalized marker metadata is required' using errcode = '22023';
    end if;
    if (p_metadata ->> 'width')::numeric not between 1 and 12000
      or (p_metadata ->> 'height')::numeric not between 1 and 12000
    then
      raise exception 'Valid normalized marker metadata is required' using errcode = '22023';
    end if;
  elsif target_session.kind = 'video' then
    server_transcode_required := p_metadata -> 'serverTranscodeRequired' = 'true'::jsonb;
    if server_transcode_required then
      if p_metadata ->> 'videoCodec' is distinct from 'source'
        or coalesce(p_metadata ->> 'audioCodec', '') not in ('source', 'aac', 'none')
        or p_metadata #>> '{optimization,strategy}' is distinct from 'server-transcode'
        or coalesce(jsonb_typeof(p_metadata -> 'width'), 'missing') not in ('number', 'null')
        or coalesce(jsonb_typeof(p_metadata -> 'height'), 'missing') not in ('number', 'null')
        or coalesce(jsonb_typeof(p_metadata -> 'durationSeconds'), 'missing') not in ('number', 'null')
      then
        raise exception 'Valid source video metadata is required' using errcode = '22023';
      end if;
      if (p_metadata ->> 'width')::numeric <= 0
        or (p_metadata ->> 'height')::numeric <= 0
        or (p_metadata ->> 'durationSeconds')::numeric <= 0
      then
        raise exception 'Valid source video metadata is required' using errcode = '22023';
      end if;
    else
      if jsonb_typeof(p_metadata -> 'width') is distinct from 'number'
        or jsonb_typeof(p_metadata -> 'height') is distinct from 'number'
        or jsonb_typeof(p_metadata -> 'durationSeconds') is distinct from 'number'
        or p_metadata ->> 'videoCodec' is distinct from 'h264'
        or coalesce(p_metadata ->> 'audioCodec', '') not in ('aac', 'none')
      then
        raise exception 'Valid H.264 video metadata is required' using errcode = '22023';
      end if;
      if (p_metadata ->> 'width')::numeric <= 0
        or (p_metadata ->> 'height')::numeric <= 0
        or (p_metadata ->> 'durationSeconds')::numeric <= 0
      then
        raise exception 'Valid H.264 video metadata is required' using errcode = '22023';
      end if;
    end if;

    duration_limit := private.effective_limit(target_session.account_id, 'video_duration_limit_seconds');
    if duration_limit is not null
      and jsonb_typeof(p_metadata -> 'durationSeconds') = 'number'
      and (p_metadata ->> 'durationSeconds')::numeric > duration_limit
    then
      raise exception 'Video duration limit reached' using errcode = '23514';
    end if;
  else
    raise exception 'Unsupported media kind' using errcode = '22023';
  end if;

  select
    nullif(o.metadata ->> 'size', '')::bigint,
    coalesce(nullif(o.metadata ->> 'mimetype', ''), nullif(o.metadata ->> 'mime_type', ''))
  into object_size, object_mime
  from storage.objects o
  where o.bucket_id = target_session.storage_bucket
    and o.name = target_session.storage_path;
  if not found then
    raise exception 'Uploaded Storage object not found' using errcode = '23503';
  end if;
  if object_size is null or object_size <> target_session.size_bytes then
    raise exception 'Uploaded object size mismatch' using errcode = '22000';
  end if;
  if object_mime is not null and object_mime <> target_session.mime_type then
    raise exception 'Uploaded object MIME mismatch' using errcode = '22000';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('media-quota:' || target_session.account_id::text, 0)
  );
  storage_limit := private.effective_limit(target_session.account_id, 'storage_limit_bytes');
  if storage_limit is not null and (
    select a.storage_used_bytes + object_size
    from public.accounts a
    where a.id = target_session.account_id
  ) > storage_limit then
    raise exception 'Storage limit reached' using errcode = '23514';
  end if;

  insert into public.media_assets (
    account_id, project_id, group_id, ar_item_id, kind, storage_bucket, storage_path,
    original_file_name, mime_type, size_bytes, sha256, version, metadata, created_by
  ) values (
    target_session.account_id, target_session.project_id, target_session.group_id,
    target_session.ar_item_id, target_session.kind, target_session.storage_bucket,
    target_session.storage_path, target_session.original_file_name, target_session.mime_type,
    object_size, p_sha256, target_session.version, p_metadata, target_session.created_by
  )
  returning * into created_asset;

  update public.accounts
  set storage_used_bytes = storage_used_bytes + object_size
  where id = target_session.account_id;

  update public.upload_sessions
  set status = 'finalized',
      bytes_uploaded = object_size,
      asset_id = created_asset.id,
      metadata = p_metadata,
      error_code = null,
      completed_at = statement_timestamp()
  where id = p_session_id;

  return created_asset;
end;
$$;

-- Service-only scoped adapter retains all storage/media/job/publication checks
-- from supabase/migrations/20260803030000_ar_item_processing.sql. Original account RPC is unchanged.
create function private.postcard_prepare_ar_item_processing(
  p_target_account_id uuid,
  p_item_id uuid,
  p_marker_asset_id uuid,
  p_video_asset_id uuid,
  p_autoplay boolean,
  p_loop_video boolean,
  p_marker_lost_behavior public.marker_lost_behavior,
  p_audio_default text,
  p_fallback_enabled boolean
)
returns public.ar_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item public.ar_items;
  marker_asset public.media_assets;
  video_asset public.media_assets;
  next_revision integer;
  media_changed boolean;
begin
  perform private.require_postcard_service();
  if p_audio_default not in ('muted', 'user_enabled') then
    raise exception 'Unsupported audio behavior' using errcode = '22023';
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
  if target_item.status = 'published' then
    raise exception 'Published AR item must be unpublished before replacement' using errcode = '55000';
  end if;

  select m.* into marker_asset
  from public.media_assets m
  where m.id = p_marker_asset_id
    and m.account_id = target_item.account_id
    and m.project_id = target_item.project_id
    and m.group_id = target_item.group_id
    and m.kind = 'marker'
    and m.deleted_at is null
  for update;
  if not found or (marker_asset.ar_item_id is not null and marker_asset.ar_item_id <> target_item.id) then
    raise exception 'Available marker asset not found' using errcode = '23503';
  end if;

  select m.* into video_asset
  from public.media_assets m
  where m.id = p_video_asset_id
    and m.account_id = target_item.account_id
    and m.project_id = target_item.project_id
    and m.group_id = target_item.group_id
    and m.kind = 'video'
    and m.deleted_at is null
  for update;
  if not found or (video_asset.ar_item_id is not null and video_asset.ar_item_id <> target_item.id) then
    raise exception 'Available video asset not found' using errcode = '23503';
  end if;

  media_changed := target_item.marker_asset_id is distinct from marker_asset.id
    or target_item.video_asset_id is distinct from video_asset.id;
  next_revision := case
    when target_item.marker_asset_id is null and target_item.video_asset_id is null then target_item.version
    when media_changed then target_item.version + 1
    else target_item.version
  end;

  if media_changed then
    update public.processing_jobs
    set status = 'cancelled', completed_at = statement_timestamp(), locked_at = null, locked_by = null
    where ar_item_id = target_item.id and status in ('queued', 'running');

    update public.media_assets
    set ar_item_id = null
    where ar_item_id = target_item.id
      and kind in ('marker', 'video')
      and id not in (marker_asset.id, video_asset.id);
  end if;

  update public.media_assets
  set ar_item_id = target_item.id
  where id in (marker_asset.id, video_asset.id);

  update public.ar_items
  set marker_asset_id = marker_asset.id,
      video_asset_id = video_asset.id,
      marker_image_path = marker_asset.storage_path,
      video_path = video_asset.storage_path,
      marker_width = (marker_asset.metadata ->> 'width')::integer,
      marker_height = (marker_asset.metadata ->> 'height')::integer,
      video_duration_seconds = (video_asset.metadata ->> 'durationSeconds')::numeric,
      autoplay = p_autoplay,
      loop_video = p_loop_video,
      marker_lost_behavior = p_marker_lost_behavior,
      audio_default = p_audio_default,
      fallback_enabled = p_fallback_enabled,
      version = next_revision,
      status = 'processing',
      tracking_status = 'uploaded',
      tracking_dataset_path = case when media_changed then null else tracking_dataset_path end,
      video_thumbnail_path = case when media_changed then null else video_thumbnail_path end,
      marker_quality_score = case when media_changed then null else marker_quality_score end,
      marker_quality_details = case when media_changed then '{}'::jsonb else marker_quality_details end,
      marker_quality_overridden_at = case when media_changed then null else marker_quality_overridden_at end,
      marker_quality_overridden_by = case when media_changed then null else marker_quality_overridden_by end,
      marker_quality_override_reason = case when media_changed then null else marker_quality_override_reason end
  where id = target_item.id
  returning * into target_item;

  insert into public.processing_jobs (account_id, ar_item_id, type, dedupe_key, input_metadata)
  values
    (
      target_item.account_id,
      target_item.id,
      'marker_analysis',
      target_item.id::text || ':v' || next_revision::text || ':marker_analysis',
      jsonb_build_object(
        'revision', next_revision,
        'assetId', marker_asset.id,
        'bucket', marker_asset.storage_bucket,
        'path', marker_asset.storage_path
      )
    ),
    (
      target_item.account_id,
      target_item.id,
      'video_inspection',
      target_item.id::text || ':v' || next_revision::text || ':video_inspection',
      jsonb_build_object(
        'revision', next_revision,
        'assetId', video_asset.id,
        'bucket', video_asset.storage_bucket,
        'path', video_asset.storage_path
      )
    ),
    (
      target_item.account_id,
      target_item.id,
      'marker_compilation',
      target_item.id::text || ':v' || next_revision::text || ':marker_compilation',
      jsonb_build_object(
        'revision', next_revision,
        'assetId', marker_asset.id,
        'bucket', marker_asset.storage_bucket,
        'path', marker_asset.storage_path
      )
    ),
    (
      target_item.account_id,
      target_item.id,
      'thumbnail_generation',
      target_item.id::text || ':v' || next_revision::text || ':thumbnail_generation',
      jsonb_build_object(
        'revision', next_revision,
        'assetId', video_asset.id,
        'bucket', video_asset.storage_bucket,
        'path', video_asset.storage_path
      )
    )
  on conflict (account_id, dedupe_key) do nothing;

  return target_item;
end;
$$;

-- Service-only scoped adapter retains all storage/media/job/publication checks
-- from supabase/migrations/20260803050000_ar_item_publication.sql. Original account RPC is unchanged.
create function private.postcard_publish_ar_item(
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
  perform private.require_postcard_service();
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

create function public.postcard_buyer_start_upload(
 p_public_token text,p_edit_hash text,p_request_id uuid,p_mode text,p_video jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; b public.postcard_batches; old private.postcard_buyer_uploads; u public.upload_sessions;
 size_bytes bigint; size_limit bigint; duration_limit bigint; storage_limit bigint; reserved bigint; next_version integer; ext text;
begin
 perform private.require_postcard_service();
 select * into c from public.postcard_cards where public_token=p_public_token for update;
 if not found or not exists(select 1 from private.postcard_claims where card_id=c.id and edit_token_hash=p_edit_hash) then
   return jsonb_build_object('error','invalid_card');
 end if;
 perform private.require_active_postcard_work(c);
 if not private.subscription_allows_write(c.account_id) or c.ar_item_id is null then return jsonb_build_object('error','activation_unavailable'); end if;
 if not exists(select 1 from public.ar_items where id=c.ar_item_id and deleted_at is null and status not in ('archived','suspended')) then
   return jsonb_build_object('error','activation_unavailable');
 end if;
 select * into b from public.postcard_batches where id=c.batch_id;
 if p_request_id is null or p_mode is null or p_mode not in ('frame','full') or jsonb_typeof(p_video) is distinct from 'object'
   or coalesce(p_video->>'name','')='' or char_length(p_video->>'name')>255
   or coalesce(p_video->>'mimeType','') not in ('video/mp4','video/quicktime','video/webm')
   or coalesce(p_video->>'sha256','') !~ '^[a-f0-9]{64}$'
   or jsonb_typeof(p_video->'sizeBytes') is distinct from 'number'
   or jsonb_typeof(p_video->'width') is distinct from 'number'
   or jsonb_typeof(p_video->'height') is distinct from 'number'
   or jsonb_typeof(p_video->'durationSeconds') is distinct from 'number'
   or (p_video->>'width')::numeric not between 1 and 16384 or (p_video->>'height')::numeric not between 1 and 16384 then
   return jsonb_build_object('error','invalid_upload');
 end if;
 size_bytes := (p_video->>'sizeBytes')::bigint;
 size_limit := least(104857600::bigint,coalesce(private.effective_limit(c.account_id,'max_video_size_bytes'),104857600));
 duration_limit := least(120::bigint,coalesce(private.effective_limit(c.account_id,'video_duration_limit_seconds'),120));
 if size_bytes not between 1 and size_limit or (p_video->>'durationSeconds')::numeric <= 0 or (p_video->>'durationSeconds')::numeric > duration_limit then
   return jsonb_build_object('error','media_limit_reached');
 end if;
 select * into old from private.postcard_buyer_uploads where id=p_request_id;
 if found then
   if old.card_id<>c.id or old.display_mode<>p_mode or old.video_metadata<>p_video then return jsonb_build_object('error','request_conflict'); end if;
   select * into u from public.upload_sessions where id=old.session_id;
   if u.expires_at <= statement_timestamp() then return jsonb_build_object('error','upload_expired'); end if;
   return jsonb_build_object('uploadId',old.id,'bucket',u.storage_bucket,'path',u.storage_path,'sizeBytes',u.size_bytes);
 end if;
 if (select count(*) from private.postcard_buyer_uploads x join public.upload_sessions s on s.id=x.session_id
    where x.card_id=c.id and x.completed_at is null and s.expires_at>statement_timestamp())>=2 then
   return jsonb_build_object('error','too_many_uploads');
 end if;
 perform pg_advisory_xact_lock(hashtextextended('media-quota:'||c.account_id::text,0));
 select coalesce(sum(s.size_bytes),0) into reserved from public.upload_sessions s where s.account_id=c.account_id and s.status in ('pending','uploading','failed') and s.expires_at>statement_timestamp();
 storage_limit := private.effective_limit(c.account_id,'storage_limit_bytes');
 if storage_limit is not null and (select storage_used_bytes+reserved+size_bytes>storage_limit from public.accounts where id=c.account_id) then
   return jsonb_build_object('error','storage_limit_reached');
 end if;
 select coalesce(max(v),0)+1 into next_version from (
   select version v from public.media_assets where account_id=c.account_id and group_id=b.group_id and kind='video' and deleted_at is null
   union all select version v from public.upload_sessions where account_id=c.account_id and group_id=b.group_id and kind='video'
 ) versions;
 ext := case p_video->>'mimeType' when 'video/quicktime' then 'mov' when 'video/webm' then 'webm' else 'mp4' end;
 insert into public.upload_sessions(account_id,project_id,group_id,ar_item_id,kind,status,storage_bucket,storage_path,original_file_name,mime_type,size_bytes,version,idempotency_key,created_by,expires_at)
 values(c.account_id,b.project_id,b.group_id,c.ar_item_id,'video','uploading','videos-private',
   'accounts/'||c.account_id::text||'/projects/'||b.project_id::text||'/groups/'||b.group_id::text||'/uploads/'||p_request_id::text||'/v'||next_version::text||'/video.'||ext,
   p_video->>'name',p_video->>'mimeType',size_bytes,next_version,p_request_id,b.issued_by,statement_timestamp()+interval '2 hours') returning * into u;
 insert into private.postcard_buyer_uploads(id,card_id,session_id,display_mode,video_metadata,sha256)
 values(p_request_id,c.id,u.id,p_mode,p_video,p_video->>'sha256');
 update private.postcard_claims set latest_upload_id=p_request_id where card_id=c.id;
 return jsonb_build_object('uploadId',p_request_id,'bucket',u.storage_bucket,'path',u.storage_path,'sizeBytes',u.size_bytes);
end; $$;

create function public.postcard_buyer_complete_upload(p_public_token text,p_edit_hash text,p_upload_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; x private.postcard_buyer_uploads; v public.media_assets; metadata jsonb; frame jsonb;
begin
 perform private.require_postcard_service();
 select * into c from public.postcard_cards where public_token=p_public_token for update;
 if not found or not exists(select 1 from private.postcard_claims where card_id=c.id and edit_token_hash=p_edit_hash) then return jsonb_build_object('error','invalid_card'); end if;
 perform private.require_active_postcard_work(c);
 if not private.subscription_allows_write(c.account_id) then return jsonb_build_object('error','activation_unavailable'); end if;
 select * into x from private.postcard_buyer_uploads where id=p_upload_id and card_id=c.id for update;
 if not found then return jsonb_build_object('error','invalid_upload'); end if;
 if x.completed_at is not null then return public.postcard_buyer_state(p_public_token,p_edit_hash); end if;
 if not exists(select 1 from private.postcard_claims where card_id=c.id and latest_upload_id=x.id) then return jsonb_build_object('error','upload_superseded'); end if;
 metadata := jsonb_build_object('width',(x.video_metadata->>'width')::integer,'height',(x.video_metadata->>'height')::integer,
   'durationSeconds',(x.video_metadata->>'durationSeconds')::numeric,'videoCodec','source','audioCodec','source','serverTranscodeRequired',true,
   'optimization',jsonb_build_object('strategy','server-transcode','originalBytes',(x.video_metadata->>'sizeBytes')::bigint,'uploadBytes',(x.video_metadata->>'sizeBytes')::bigint,'savedBytes',0,'reductionPercent',0,'optimized',false));
 v := private.postcard_finalize_media_upload(x.session_id,x.sha256,metadata);
 -- Existing publication remains visible during upload; only successful finalization
 -- atomically starts replacement processing on the same work, without another credit.
 update public.ar_items set status='draft',visibility='private' where id=c.ar_item_id and account_id=c.account_id and status='published';
 perform private.postcard_prepare_ar_item_processing(c.account_id,c.ar_item_id,c.print_marker_asset_id,v.id,true,true,'pause_hide','user_enabled',true);
 select l.frame into frame from private.postcard_template_layouts l join public.postcard_batches b on b.template_code=l.template_code where b.id=c.batch_id;
 update public.postcard_cards set display_mode=x.display_mode,video_viewport=case when x.display_mode='full' then '{"x":0,"y":0,"width":1,"height":1}'::jsonb else frame end where id=c.id;
 update private.postcard_buyer_uploads set completed_at=statement_timestamp() where id=x.id;
 insert into public.audit_logs(account_id,actor_user_id,action,entity_type,entity_id,metadata)
 values(c.account_id,null,'postcard.buyer.video_submitted','postcard_cards',c.id,jsonb_build_object('actor','purchaser','mode',x.display_mode));
 return public.postcard_buyer_state(p_public_token,p_edit_hash);
end; $$;

create function public.postcard_buyer_publish(p_public_token text,p_edit_hash text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards;
begin
 perform private.require_postcard_service();
 select * into c from public.postcard_cards where public_token=p_public_token for update;
 if not found or not exists(select 1 from private.postcard_claims where card_id=c.id and edit_token_hash=p_edit_hash) then return jsonb_build_object('error','invalid_card'); end if;
 perform private.require_active_postcard_work(c);
 if not private.subscription_allows_write(c.account_id) then return jsonb_build_object('error','activation_unavailable'); end if;
 perform private.postcard_publish_ar_item(c.account_id,c.ar_item_id,'https://khanzama.ru/ar.photo',null);
 insert into public.audit_logs(account_id,actor_user_id,action,entity_type,entity_id,metadata)
 values(c.account_id,null,'postcard.buyer.published','postcard_cards',c.id,jsonb_build_object('actor','purchaser'));
 return public.postcard_buyer_state(p_public_token,p_edit_hash);
end; $$;

revoke all on function private.postcard_finalize_media_upload(uuid,text,jsonb),
 private.postcard_prepare_ar_item_processing(uuid,uuid,uuid,uuid,boolean,boolean,public.marker_lost_behavior,text,boolean),
 private.postcard_publish_ar_item(uuid,uuid,text,timestamptz) from public,anon,authenticated,service_role;
revoke all on function public.postcard_buyer_state(text,text),public.postcard_buyer_claim(text,text,text),
 public.postcard_buyer_start_upload(text,text,uuid,text,jsonb),public.postcard_buyer_complete_upload(text,text,uuid),public.postcard_buyer_publish(text,text) from public,anon,authenticated,service_role;
grant execute on function public.postcard_buyer_state(text,text),public.postcard_buyer_claim(text,text,text),
 public.postcard_buyer_start_upload(text,text,uuid,text,jsonb),public.postcard_buyer_complete_upload(text,text,uuid),public.postcard_buyer_publish(text,text) to service_role;

-- Private source formats are inspected and transcoded by the existing worker.
update storage.buckets set allowed_mime_types = array(
 select distinct mime from unnest(coalesce(allowed_mime_types,array[]::text[]) || array['video/mp4','video/quicktime','video/webm']) mime
) where id='videos-private';

-- Recheck lifecycle after claim: a later administrative suspension or archived
-- group must not be undone by a purchaser's in-flight upload or publication.
create function private.require_active_postcard_work(p_card public.postcard_cards) returns void
language plpgsql security definer set search_path='' as $$
declare i public.ar_items;
begin
 perform private.require_postcard_service();
 select * into i from public.ar_items where id=p_card.ar_item_id and account_id=p_card.account_id for update;
 if not found or i.deleted_at is not null or i.status in ('archived','suspended')
   or not private.subscription_allows_write(p_card.account_id)
   or not exists(select 1 from public.groups g join public.projects p on p.id=g.project_id and p.account_id=g.account_id
     where g.id=i.group_id and g.project_id=i.project_id and g.account_id=i.account_id
       and g.deleted_at is null and g.archived_at is null and p.deleted_at is null and p.status<>'archived') then
   raise exception 'Postcard work unavailable' using errcode='42501';
 end if;
end; $$;
revoke all on function private.require_active_postcard_work(public.postcard_cards) from public,anon,authenticated,service_role;

create function public.postcard_buyer_upload_target(p_public_token text,p_edit_hash text,p_upload_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; x private.postcard_buyer_uploads; u public.upload_sessions;
begin
 perform private.require_postcard_service();
 select * into c from public.postcard_cards where public_token=p_public_token for update;
 if not found or not exists(select 1 from private.postcard_claims where card_id=c.id and edit_token_hash=p_edit_hash and latest_upload_id=p_upload_id) then return jsonb_build_object('error','invalid_card'); end if;
 perform private.require_active_postcard_work(c);
 select * into x from private.postcard_buyer_uploads where id=p_upload_id and card_id=c.id;
 if not found then return jsonb_build_object('error','invalid_upload'); end if;
 select * into u from public.upload_sessions where id=x.session_id;
 if u.expires_at<=statement_timestamp() or u.status not in ('uploading','finalized') then return jsonb_build_object('error','upload_expired'); end if;
 return jsonb_build_object('bucket',u.storage_bucket,'path',u.storage_path,'sizeBytes',u.size_bytes,'mimeType',u.mime_type,
   'uploadedSize',(select nullif(o.metadata->>'size','')::bigint from storage.objects o where o.bucket_id=u.storage_bucket and o.name=u.storage_path));
end; $$;
revoke all on function public.postcard_buyer_upload_target(text,text,uuid) from public,anon,authenticated,service_role;
grant execute on function public.postcard_buyer_upload_target(text,text,uuid) to service_role;

-- FFmpeg's actual duration, not browser metadata, controls the postcard cap.
create function private.enforce_postcard_video_duration() returns trigger
language plpgsql security definer set search_path='' as $$
declare duration_limit bigint;
begin
 if new.type not in ('video_inspection','video_transcode') or new.status<>'succeeded' or old.status='succeeded'
   or not exists(select 1 from public.postcard_cards c where c.ar_item_id=new.ar_item_id and c.account_id=new.account_id) then return new; end if;
 duration_limit:=least(120::bigint,coalesce(private.effective_limit(new.account_id,'video_duration_limit_seconds'),120));
 if jsonb_typeof(new.output_metadata->'durationSeconds') is distinct from 'number'
   or (new.output_metadata->>'durationSeconds')::numeric <= 0
   or (new.output_metadata->>'durationSeconds')::numeric>duration_limit then
   raise exception 'Postcard video duration limit reached' using errcode='23514';
 end if;
 return new;
end; $$;
create trigger enforce_postcard_video_duration before update of status,output_metadata on public.processing_jobs
 for each row execute function private.enforce_postcard_video_duration();
revoke all on function private.enforce_postcard_video_duration() from public,anon,authenticated,service_role;
