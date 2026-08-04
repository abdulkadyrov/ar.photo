-- SQL three-valued logic made a missing flag look eligible in the first
-- version. Require the explicit JSON boolean and remove only untouched jobs
-- that were enqueued during the short deployment window.

create or replace function private.enqueue_video_transcode()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_asset public.media_assets;
  revision integer;
begin
  if new.type <> 'video_inspection' then
    return new;
  end if;

  select m.* into source_asset
  from public.media_assets m
  where m.id = (new.input_metadata ->> 'assetId')::uuid
    and m.account_id = new.account_id
    and m.deleted_at is null;

  if not found or source_asset.metadata ->> 'serverTranscodeRequired' is distinct from 'true' then
    return new;
  end if;

  revision := (new.input_metadata ->> 'revision')::integer;
  insert into public.processing_jobs (
    account_id,
    ar_item_id,
    type,
    dedupe_key,
    input_metadata
  ) values (
    new.account_id,
    new.ar_item_id,
    'video_transcode',
    new.ar_item_id::text || ':v' || revision::text || ':video_transcode',
    new.input_metadata
  )
  on conflict (account_id, dedupe_key) do nothing;

  return new;
end;
$$;

delete from public.processing_jobs transcode
where transcode.type = 'video_transcode'
  and transcode.status in ('queued', 'cancelled')
  and exists (
    select 1
    from public.media_assets source_asset
    where source_asset.id = (transcode.input_metadata ->> 'assetId')::uuid
      and source_asset.account_id = transcode.account_id
      and source_asset.metadata ->> 'serverTranscodeRequired' is distinct from 'true'
  );

revoke all on function private.enqueue_video_transcode() from public, anon, authenticated;
