-- Preserve the card row lock shared with publication so older clients cannot replace a published gift.
create or replace function public.postcard_buyer_start_upload(
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
 if exists(select 1 from public.ar_items a where a.id=c.ar_item_id and a.account_id=c.account_id and a.published_at is not null) then
   return jsonb_build_object('error','postcard_locked');
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

create or replace function public.postcard_buyer_complete_upload(p_public_token text,p_edit_hash text,p_upload_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; x private.postcard_buyer_uploads; v public.media_assets; metadata jsonb; frame jsonb;
begin
 perform private.require_postcard_service();
 select * into c from public.postcard_cards where public_token=p_public_token for update;
 if not found or not exists(select 1 from private.postcard_claims where card_id=c.id and edit_token_hash=p_edit_hash) then return jsonb_build_object('error','invalid_card'); end if;
 if exists(select 1 from public.ar_items a where a.id=c.ar_item_id and a.account_id=c.account_id and a.published_at is not null) then
   return jsonb_build_object('error','postcard_locked');
 end if;
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
 perform private.postcard_prepare_ar_item_processing(c.account_id,c.ar_item_id,c.print_marker_asset_id,v.id,true,true,'pause_hide','user_enabled',true);
 select l.frame into frame from private.postcard_template_layouts l join public.postcard_batches b on b.template_code=l.template_code where b.id=c.batch_id;
 update public.postcard_cards set display_mode=x.display_mode,video_viewport=case when x.display_mode='full' then '{"x":0,"y":0,"width":1,"height":1}'::jsonb else frame end where id=c.id;
 update private.postcard_buyer_uploads set completed_at=statement_timestamp() where id=x.id;
 insert into public.audit_logs(account_id,actor_user_id,action,entity_type,entity_id,metadata)
 values(c.account_id,null,'postcard.buyer.video_submitted','postcard_cards',c.id,jsonb_build_object('actor','purchaser','mode',x.display_mode));
 return public.postcard_buyer_state(p_public_token,p_edit_hash);
end; $$;
create or replace function public.postcard_buyer_upload_target(p_public_token text,p_edit_hash text,p_upload_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c public.postcard_cards; x private.postcard_buyer_uploads; u public.upload_sessions;
begin
 perform private.require_postcard_service();
 select * into c from public.postcard_cards where public_token=p_public_token for update;
 if not found or not exists(select 1 from private.postcard_claims where card_id=c.id and edit_token_hash=p_edit_hash and latest_upload_id=p_upload_id) then return jsonb_build_object('error','invalid_card'); end if;
 if exists(select 1 from public.ar_items a where a.id=c.ar_item_id and a.account_id=c.account_id and a.published_at is not null) then
   return jsonb_build_object('error','postcard_locked');
 end if;
 perform private.require_active_postcard_work(c);
 select * into x from private.postcard_buyer_uploads where id=p_upload_id and card_id=c.id;
 if not found then return jsonb_build_object('error','invalid_upload'); end if;
 select * into u from public.upload_sessions where id=x.session_id;
 if u.expires_at<=statement_timestamp() or u.status not in ('uploading','finalized') then return jsonb_build_object('error','upload_expired'); end if;
 return jsonb_build_object('bucket',u.storage_bucket,'path',u.storage_path,'sizeBytes',u.size_bytes,'mimeType',u.mime_type,
   'uploadedSize',(select nullif(o.metadata->>'size','')::bigint from storage.objects o where o.bucket_id=u.storage_bucket and o.name=u.storage_path));
end; $$;
