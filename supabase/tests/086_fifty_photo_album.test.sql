begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(12);
create temporary table album_credit_before as select spent from private.photo_credit_wallets where account_id='20000000-0000-4000-8000-000000000001';
update private.photo_credit_wallets set allowance=10000 where account_id='20000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000010',true);
select set_config('request.jwt.claim.role','authenticated',true);
select lives_ok($test$
 do $append$
 declare root uuid;
 begin
  select id into root from public.create_ar_item_draft('20000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001','Album root','','a7000000-0000-4000-8000-000000000001');
  for i in 2..50 loop
   perform public.create_ar_item_draft_in_bundle('20000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001',root,'Album photo '||i,'',('a7000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid);
  end loop;
 end $append$;
$test$,'an owner can create 50 photographs in one album');
select is((select count(*) from public.ar_items where idempotency_key::text like 'a7000000-%'),50::bigint,'all 50 drafts exist');
select throws_ok($test$
 select public.create_ar_item_draft_in_bundle('20000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001',
 (select id from public.ar_items where idempotency_key='a7000000-0000-4000-8000-000000000001'),'Photo 51','','a7000000-0000-4000-8000-000000000051');
$test$,'23514','AR bundle size must be between 1 and 50','the 51st draft is rejected before creation');
select lives_ok($test$
 select public.create_ar_item_draft_in_bundle('20000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001','60000000-0000-4000-8000-000000000001',
 (select id from public.ar_items where idempotency_key='a7000000-0000-4000-8000-000000000001'),'Photo 50','','a7000000-0000-4000-8000-000000000050');
$test$,'retrying the 50th request remains idempotent');
select is((select count(*) from public.ar_items where idempotency_key::text like 'a7000000-%'),50::bigint,'retries and rejection do not create extra work');
reset role;
select is((select spent from private.photo_credit_wallets where account_id='20000000-0000-4000-8000-000000000001')-(select spent from album_credit_before),50::bigint,'only 50 creation credits are spent');

-- Synthetic completed processing outputs: no real storage or customer data.
insert into public.media_assets(account_id,project_id,group_id,ar_item_id,kind,storage_bucket,storage_path,original_file_name,mime_type,size_bytes,sha256,version,metadata,created_by)
select i.account_id,i.project_id,i.group_id,i.id,k.kind,k.bucket,'album-test/'||i.id||'/'||k.file,k.file,k.mime,4096,repeat('2',64),1,
 case when k.kind='marker' then '{"width":640,"height":480,"exifStripped":true}'::jsonb else '{"width":640,"height":480,"durationSeconds":10,"videoCodec":"h264","audioCodec":"aac"}'::jsonb end,i.created_by
from public.ar_items i cross join (values ('marker','markers-private','marker.jpg','image/jpeg'),('video','videos-private','video.mp4','video/mp4')) k(kind,bucket,file,mime)
where i.idempotency_key::text like 'a7000000-%';
update public.ar_items i set status='ready',marker_asset_id=(select id from public.media_assets where ar_item_id=i.id and kind='marker'),video_asset_id=(select id from public.media_assets where ar_item_id=i.id and kind='video'),
 marker_width=640,marker_height=480,marker_quality_score=90,marker_quality_details='{"suitable":true}',tracking_status='ready',version=1,
 video_path='album-test/'||i.id||'/video.mp4',video_thumbnail_path='album-test/'||i.id||'/poster.webp',tracking_dataset_path='album-test/'||i.id||'/target.mind'
where i.idempotency_key::text like 'a7000000-%';
insert into public.processing_jobs(account_id,ar_item_id,type,status,progress,attempt_count,dedupe_key,input_metadata,output_metadata,completed_at)
select i.account_id,i.id,t.type,'succeeded',100,1,'album-test:'||i.id||':'||t.type,'{"revision":1}','{}',statement_timestamp()
from public.ar_items i cross join unnest(array['marker_analysis','video_inspection','marker_compilation','thumbnail_generation']::public.job_type[]) t(type)
where i.idempotency_key::text like 'a7000000-%';
set local role authenticated;
select lives_ok($test$ select public.publish_ar_bundle('20000000-0000-4000-8000-000000000001',
 (select id from public.ar_items where idempotency_key='a7000000-0000-4000-8000-000000000001'),'https://example.test/ar.photo',null); $test$,'a fully processed 50-photo album publishes atomically');
select is((select count(*) from public.qr_codes q join public.ar_items i on i.id=q.ar_item_id where i.idempotency_key::text like 'a7000000-%'),1::bigint,'50 photographs use one durable QR');
reset role;
set local role service_role;
select is((select count(*) from public.get_public_ar_manifest_source((select public_slug from public.ar_items where idempotency_key='a7000000-0000-4000-8000-000000000001'))),50::bigint,'the public boundary returns all 50 targets');
reset role;
select ok(not pg_catalog.has_function_privilege('authenticated','public.get_public_ar_manifest_source(text)','EXECUTE'),'the publication source stays service-only');
set local role authenticated;
select lives_ok($test$ select public.publish_ar_bundle('20000000-0000-4000-8000-000000000001',
 (select id from public.ar_items where idempotency_key='a7000000-0000-4000-8000-000000000001'),'https://example.test/ar.photo',null); $test$,'republishing preserves the existing QR');
reset role;
select is((select spent from private.photo_credit_wallets where account_id='20000000-0000-4000-8000-000000000001')-(select spent from album_credit_before),50::bigint,'republishing spends no additional credits');
select * from finish();
rollback;
