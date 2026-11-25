-- Synthetic integration fixtures only. Every change, including the extension,
-- is rolled back; no real mail, Storage bytes or FFmpeg process is involved.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

-- Record authoritative counters before any purchaser claim.
select set_config('test.pc_spent', (select spent::text from private.photo_credit_wallets where account_id='20000000-0000-4000-8000-000000000001'), true);
select set_config('test.pc_members', (select count(*)::text from public.account_members where account_id='20000000-0000-4000-8000-000000000001'), true);
select set_config('test.pc_allowance', (select coalesce(allowance::text,'unlimited') from private.photo_credit_wallets where account_id='20000000-0000-4000-8000-000000000001'), true);
select set_config('test.pc_subscription_expires', (select expires_at::text from public.subscriptions where account_id='20000000-0000-4000-8000-000000000001'), true);
select set_config('test.pc_custom_limits', (select custom_limits::text from public.subscriptions where account_id='20000000-0000-4000-8000-000000000001'), true);
select set_config('test.pc_frame', (select frame::text from private.postcard_template_layouts where template_code='eid'), true);
select set_config('test.pc_video', '{"name":"gift.mp4","mimeType":"video/mp4","sizeBytes":4096,"width":1920,"height":1080,"durationSeconds":10,"sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}', true);

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000010',true);
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000010","role":"authenticated","aal":"aal1"}',true);
select lives_ok($$select public.postcard_create_shop('20000000-0000-4000-8000-000000000001','Buyer integration shop','Synthetic only','a8000000-0000-4000-8000-000000000001')$$,'owner creates the issuing shop');
select set_config('test.pc_shop_code',public.postcard_get_shop_code('20000000-0000-4000-8000-000000000001','a8000000-0000-4000-8000-000000000001'),true);
select matches(current_setting('test.pc_shop_code'),'^[0-9]{4}$','manager receives exactly four numeric digits');
select is(public.postcard_get_shop_code('20000000-0000-4000-8000-000000000001','a8000000-0000-4000-8000-000000000001'),current_setting('test.pc_shop_code'),'shop PIN remains stable on repeated read');
select lives_ok($$select public.postcard_create_batch('20000000-0000-4000-8000-000000000001','eid','Buyer integration batch',4,'a8000000-0000-4000-8000-000000000002')$$,'owner reserves a four-card batch');
select set_config('test.pc_batch',(select id::text from public.postcard_batches where request_id='a8000000-0000-4000-8000-000000000002'),true);
select lives_ok($$select public.postcard_prepare_batch('20000000-0000-4000-8000-000000000001',current_setting('test.pc_batch')::uuid)$$,'owner prepares the account-scoped printing project and group');
select lives_ok($$select public.postcard_prepare_batch('20000000-0000-4000-8000-000000000001',current_setting('test.pc_batch')::uuid)$$,'preparing the same batch twice is idempotent');
select set_config('test.pc_group',(select group_id::text from public.postcard_batches where id=current_setting('test.pc_batch')::uuid),true);
select set_config('test.pc_project',(select project_id::text from public.postcard_batches where id=current_setting('test.pc_batch')::uuid),true);
select set_config('test.pc_card_1',(select id::text from public.postcard_cards where batch_id=current_setting('test.pc_batch')::uuid and ordinal=1),true);
select set_config('test.pc_token_1',(select public_token from public.postcard_cards where id=current_setting('test.pc_card_1')::uuid),true);
select set_config('test.pc_card_2',(select id::text from public.postcard_cards where batch_id=current_setting('test.pc_batch')::uuid and ordinal=2),true);
select set_config('test.pc_token_2',(select public_token from public.postcard_cards where id=current_setting('test.pc_card_2')::uuid),true);
select set_config('test.pc_card_3',(select id::text from public.postcard_cards where batch_id=current_setting('test.pc_batch')::uuid and ordinal=3),true);
select set_config('test.pc_token_3',(select public_token from public.postcard_cards where id=current_setting('test.pc_card_3')::uuid),true);
select set_config('test.pc_token_4',(select public_token from public.postcard_cards where batch_id=current_setting('test.pc_batch')::uuid and ordinal=4),true);
select lives_ok($$select public.postcard_move_cards('20000000-0000-4000-8000-000000000001','assign','a8000000-0000-4000-8000-000000000001',array(select id from public.postcard_cards where batch_id=current_setting('test.pc_batch')::uuid),'a8000000-0000-4000-8000-000000000003')$$,'the printed cards are assigned to this shop');
select lives_ok($$select public.create_group('20000000-0000-4000-8000-000000000001',current_setting('test.pc_project')::uuid,'Unrelated group','Synthetic mismatch fixture','a8000000-0000-4000-8000-000000000004')$$,'owner creates a different group for cross-group upload rejection');
select set_config('test.pc_other_group',(select id::text from public.groups where account_id='20000000-0000-4000-8000-000000000001' and idempotency_key='a8000000-0000-4000-8000-000000000004'),true);
reset role;

select set_config('test.pc_legacy_code',(select activation_code from private.postcard_shop_secrets where shop_id='a8000000-0000-4000-8000-000000000001'),true);
select ok((select bool_and(pin ~ '^[0-9]{4}$') from (select private.generate_postcard_shop_pin() pin from generate_series(1,1000)) samples),'all generated PINs contain four digits');
select throws_ok($$update private.postcard_shop_secrets set activation_pin='42' where shop_id='a8000000-0000-4000-8000-000000000001'$$,'23514',null,'PIN constraint prevents losing leading zeros');
update private.postcard_shop_secrets set activation_pin='0042' where shop_id='a8000000-0000-4000-8000-000000000001';
set local role authenticated;
select is(public.postcard_get_shop_code('20000000-0000-4000-8000-000000000001','a8000000-0000-4000-8000-000000000001'),'0042','manager receives leading-zero PIN verbatim');
reset role;
select set_config('test.pc_shop_code','0042',true);

-- The PNG metadata mirrors the canonical server-uploaded 1200x1800 artwork.
-- Card four intentionally has no registered print marker and cannot activate.
insert into public.media_assets(id,account_id,project_id,group_id,kind,storage_bucket,storage_path,original_file_name,mime_type,size_bytes,sha256,version,metadata,created_by)
select ('a8100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
 '20000000-0000-4000-8000-000000000001',current_setting('test.pc_project')::uuid,current_setting('test.pc_group')::uuid,
 'marker','markers-private','postcard-buyer-test/canonical-'||n::text||'.png','card.png','image/png',2048,repeat('b',64),n,
 '{"width":1200,"height":1800,"exifStripped":true}'::jsonb,'10000000-0000-4000-8000-000000000010'
from generate_series(1,3) n;
set local role authenticated;
select lives_ok($$select public.postcard_attach_print_marker('20000000-0000-4000-8000-000000000001',current_setting('test.pc_card_1')::uuid,'a8100000-0000-4000-8000-000000000001')$$,'first card registers canonical print artwork');
select lives_ok($$select public.postcard_attach_print_marker('20000000-0000-4000-8000-000000000001',current_setting('test.pc_card_2')::uuid,'a8100000-0000-4000-8000-000000000002')$$,'second card registers separate artwork');
select lives_ok($$select public.postcard_attach_print_marker('20000000-0000-4000-8000-000000000001',current_setting('test.pc_card_3')::uuid,'a8100000-0000-4000-8000-000000000003')$$,'third card registers separate artwork');
select throws_ok($$select public.postcard_buyer_claim(current_setting('test.pc_token_1'),current_setting('test.pc_shop_code'),repeat('1',64))$$,'42501',null,'an ordinary authenticated session cannot call the service buyer API');
select throws_ok($$select * from private.postcard_claims$$,'42501',null,'account members cannot read purchaser capability hashes');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000012',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000012","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.postcard_prepare_batch('20000000-0000-4000-8000-000000000001',current_setting('test.pc_batch')::uuid)$$,'42501',null,'read-only account member cannot prepare a print batch');
reset role;
set local role anon;
select throws_ok($$select public.postcard_buyer_state(current_setting('test.pc_token_1'),null)$$,'42501',null,'anonymous direct RPC use cannot bypass the bounded Edge gateway');
select throws_ok($$select * from private.postcard_claims$$,'42501',null,'anonymous visitors cannot read purchaser capabilities');
reset role;

-- Service calls have no user subject and therefore never impersonate the issuer.
set local role service_role;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claim.role','service_role',true);
select set_config('request.jwt.claims','{"role":"service_role"}',true);
select throws_ok($$select * from private.postcard_claims$$,'42501',null,'even the service role has no direct capability-table read grant');
select is(public.postcard_buyer_claim(current_setting('test.pc_token_1'),'WRONG',repeat('1',64))::text,
 public.postcard_buyer_claim(repeat('f',32),'WRONG',repeat('1',64))::text,'wrong code and unknown card produce the same generic response');
select is(public.postcard_buyer_claim(current_setting('test.pc_token_4'),current_setting('test.pc_shop_code'),repeat('4',64))->>'error','invalid_card','unprinted stock cannot be activated');
select is(public.postcard_buyer_claim(current_setting('test.pc_token_1'),'42',repeat('1',64))->>'error','invalid_card','claim requires all four digits including leading zeros');
select set_config('test.pc_claim_1',public.postcard_buyer_claim(current_setting('test.pc_token_1'),current_setting('test.pc_shop_code'),repeat('1',64))::text,true);
select ok((current_setting('test.pc_claim_1')::jsonb->>'owned')::boolean,'correct shop code atomically claims the specific card');
select is(current_setting('test.pc_claim_1')::jsonb#>>'{card,state}','claimed','claim creates a draft, not an invented ready video');
select ok((public.postcard_buyer_claim(current_setting('test.pc_token_1'),current_setting('test.pc_shop_code'),repeat('1',64))->>'owned')::boolean,'same capability retries the claim safely');
select is(public.postcard_buyer_claim(current_setting('test.pc_token_1'),current_setting('test.pc_shop_code'),repeat('9',64))->>'error','invalid_card','shared shop code cannot overwrite an already claimed card');
select ok(not (public.postcard_buyer_state(current_setting('test.pc_token_1'),repeat('9',64))->>'owned')::boolean,'a different edit token does not own the card');
select is(public.postcard_buyer_state(current_setting('test.pc_token_1'),repeat('9',64))->'jobs','[]'::jsonb,'private processing details are not returned to a non-owner');
select ok(public.postcard_buyer_state(current_setting('test.pc_token_1'),repeat('9',64))->>'_videoAssetId' is null,'another edit token cannot receive a private video preview asset');
reset role;
select is((select spent from private.photo_credit_wallets where account_id='20000000-0000-4000-8000-000000000001'),current_setting('test.pc_spent')::bigint+1,'claim and retry spend exactly one creation credit');
select is((select count(*) from public.ar_items where idempotency_key=current_setting('test.pc_card_1')::uuid),1::bigint,'claim retry creates exactly one AR work');
select is((select count(*) from public.account_members where account_id='20000000-0000-4000-8000-000000000001'),current_setting('test.pc_members')::bigint,'buyer acquires no studio account membership');
select ok((select sold_at is null from public.postcard_cards where id=current_setting('test.pc_card_1')::uuid),'activation never invents a store sale');
select set_config('test.pc_item',(select ar_item_id::text from public.postcard_cards where id=current_setting('test.pc_card_1')::uuid),true);
set local role service_role;
select ok((public.postcard_buyer_claim(current_setting('test.pc_token_2'),
 lower(substr(current_setting('test.pc_legacy_code'),1,4)||' · '||substr(current_setting('test.pc_legacy_code'),5,4)||'-'||substr(current_setting('test.pc_legacy_code'),9,4)),repeat('2',64))->>'owned')::boolean,
 'previously printed legacy codes still activate cards after the PIN migration');
-- Safe fallback also makes a normalization regression fail only its own check.
select public.postcard_buyer_claim(current_setting('test.pc_token_2'),current_setting('test.pc_shop_code'),repeat('2',64));
reset role;
select is((select count(*) from public.ar_items where idempotency_key in (current_setting('test.pc_card_1')::uuid,current_setting('test.pc_card_2')::uuid)),2::bigint,'one shop code activates different cards with independent works');
update private.photo_credit_wallets set allowance=spent where account_id='20000000-0000-4000-8000-000000000001';
set local role service_role;
select is(public.postcard_buyer_claim(current_setting('test.pc_token_3'),current_setting('test.pc_shop_code'),repeat('3',64))->>'error','activation_unavailable','activation cannot bypass an exhausted creation wallet');
reset role;
select ok((select ar_item_id is null from public.postcard_cards where id=current_setting('test.pc_card_3')::uuid),'failed credit spend rolls back the whole claim');
update private.photo_credit_wallets set allowance=case when current_setting('test.pc_allowance')='unlimited' then null else current_setting('test.pc_allowance')::bigint end where account_id='20000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000010',true);
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000010","role":"authenticated","aal":"aal1"}',true);
select throws_ok($$select public.postcard_attach_print_marker('20000000-0000-4000-8000-000000000001',current_setting('test.pc_card_1')::uuid,'a8100000-0000-4000-8000-000000000002')$$,'55000','Printed artwork is immutable','claimed printed artwork cannot be silently replaced');
select lives_ok($$select public.postcard_attach_print_marker('20000000-0000-4000-8000-000000000001',current_setting('test.pc_card_1')::uuid,'a8100000-0000-4000-8000-000000000001')$$,'registering the same printed artwork remains idempotent');
select lives_ok($$select public.postcard_move_cards('20000000-0000-4000-8000-000000000001','sell','a8000000-0000-4000-8000-000000000001',array[current_setting('test.pc_card_1')::uuid],'a8000000-0000-4000-8000-000000000005')$$,'real sale may be recorded after activation');
reset role;
select ok((select sold_at is not null from public.postcard_cards where id=current_setting('test.pc_card_1')::uuid),'sale and activation have independent timestamps');

set local role service_role;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claim.role','service_role',true);
select set_config('request.jwt.claims','{"role":"service_role"}',true);
select is(public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('9',64),'a8200000-0000-4000-8000-000000000001','frame',current_setting('test.pc_video')::jsonb)->>'error','invalid_card','upload requires the specific purchaser capability');
select is(public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000010','frame',jsonb_set(current_setting('test.pc_video')::jsonb,'{sha256}','"invalid"'))->>'error','invalid_upload','malformed source hashes are rejected');
select is(public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000011','frame',jsonb_set(current_setting('test.pc_video')::jsonb,'{sizeBytes}','104857601'))->>'error','media_limit_reached','public source size cap holds even for a large sponsor package');
select is(public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000012','frame',jsonb_set(current_setting('test.pc_video')::jsonb,'{durationSeconds}','121'))->>'error','media_limit_reached','declared source duration above 120 seconds is rejected');
select set_config('test.pc_upload_1',public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001','frame',current_setting('test.pc_video')::jsonb)::text,true);
select is(current_setting('test.pc_upload_1')::jsonb->>'uploadId','a8200000-0000-4000-8000-000000000001','owner receives a scoped upload reservation');
select is(public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001','frame',current_setting('test.pc_video')::jsonb)::text,current_setting('test.pc_upload_1'),'same upload request retries without another reservation');
select is(public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001','full',current_setting('test.pc_video')::jsonb)->>'error','request_conflict','a retried upload ID cannot change display mode');
select is(public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000099')->>'error','invalid_upload','forged upload IDs cannot finalize media');
select is(public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('9',64),'a8200000-0000-4000-8000-000000000001')->>'error','invalid_card','another capability cannot finalize a real upload');
select is(public.postcard_buyer_upload_target(current_setting('test.pc_token_1'),repeat('9',64),'a8200000-0000-4000-8000-000000000001')->>'error','invalid_card','streaming target lookup is capability-bound');
select is((public.postcard_buyer_upload_target(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001')->>'sizeBytes')::bigint,4096::bigint,'streaming target binds the exact reserved size');
reset role;
select is((select count(*) from public.upload_sessions where idempotency_key='a8200000-0000-4000-8000-000000000001'),1::bigint,'upload retry creates one session');
select ok((select account_id='20000000-0000-4000-8000-000000000001'::uuid and ar_item_id=current_setting('test.pc_item')::uuid and group_id=current_setting('test.pc_group')::uuid from public.upload_sessions where idempotency_key='a8200000-0000-4000-8000-000000000001'),'upload reservation inherits only the printed card account/work/group');
select ok((select allowed_mime_types @> array['video/mp4','video/quicktime','video/webm'] from storage.buckets where id='videos-private'),'private source storage accepts supported iPhone and browser video containers');
update public.subscriptions set custom_limits=custom_limits||'{"storage_limit_bytes":0}'::jsonb where account_id='20000000-0000-4000-8000-000000000001';
set local role service_role;
select is(public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000013','frame',current_setting('test.pc_video')::jsonb)->>'error','storage_limit_reached','buyer reservations cannot bypass sponsor storage limits');
reset role;
update public.subscriptions set custom_limits=current_setting('test.pc_custom_limits')::jsonb where account_id='20000000-0000-4000-8000-000000000001';
update public.ar_items set status='suspended' where id=current_setting('test.pc_item')::uuid;
set local role service_role;
select throws_ok($$select public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001')$$,'42501',null,'suspension after upload start cannot be undone by completion');
select throws_ok($$select public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000014','frame',current_setting('test.pc_video')::jsonb)$$,'42501',null,'suspended work cannot reserve a new upload');
reset role;
select is((select status::text from public.ar_items where id=current_setting('test.pc_item')::uuid),'suspended','blocked completion preserves administrative suspension');
update public.ar_items set status='draft' where id=current_setting('test.pc_item')::uuid;
update public.groups set archived_at=now() where id=current_setting('test.pc_group')::uuid;
set local role service_role;
select throws_ok($$select public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001')$$,'42501',null,'archiving a group during upload blocks completion');
reset role;
update public.groups set archived_at=null where id=current_setting('test.pc_group')::uuid;
update public.ar_items set status='archived' where id=current_setting('test.pc_item')::uuid;
set local role service_role;
select throws_ok($$select public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001')$$,'42501',null,'archiving an individual work also blocks its in-flight upload');
reset role;
update public.ar_items set status='draft' where id=current_setting('test.pc_item')::uuid;
update public.subscriptions set expires_at=now()-interval '12 hours' where account_id='20000000-0000-4000-8000-000000000001';
set local role service_role;
select throws_ok($$select public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001')$$,'42501',null,'package expiry between reservation and completion is rechecked');
reset role;
update public.subscriptions set expires_at=current_setting('test.pc_subscription_expires')::timestamptz where account_id='20000000-0000-4000-8000-000000000001';

-- Storage metadata is a DB fixture; source bytes are intentionally not uploaded.
insert into storage.objects(bucket_id,name,metadata)
select storage_bucket,storage_path,jsonb_build_object('size',size_bytes,'mimetype',mime_type)
from public.upload_sessions where idempotency_key='a8200000-0000-4000-8000-000000000001';
update public.upload_sessions set group_id=current_setting('test.pc_other_group')::uuid where idempotency_key='a8200000-0000-4000-8000-000000000001';
set local role service_role;
select throws_ok($$select public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001')$$,'23503',null,'a video reservation from another group cannot attach to the printed card');
reset role;
update public.upload_sessions set group_id=current_setting('test.pc_group')::uuid where idempotency_key='a8200000-0000-4000-8000-000000000001';
update storage.objects set metadata=metadata||'{"size":4095}'::jsonb where bucket_id=current_setting('test.pc_upload_1')::jsonb->>'bucket' and name=current_setting('test.pc_upload_1')::jsonb->>'path';
set local role service_role;
select throws_ok($$select public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001')$$,'22000',null,'actual Storage metadata size must equal the reserved byte count');
reset role;
update storage.objects set metadata=metadata||'{"size":4096}'::jsonb where bucket_id=current_setting('test.pc_upload_1')::jsonb->>'bucket' and name=current_setting('test.pc_upload_1')::jsonb->>'path';
set local role service_role;
select is(public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001')#>>'{card,state}','processing','valid source finalization starts the existing worker pipeline');
select is(public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000001')#>>'{card,state}','processing','lost completion responses can retry without reattaching media');
select throws_ok($$select public.postcard_buyer_publish(current_setting('test.pc_token_1'),repeat('1',64))$$,'55000',null,'unprocessed video cannot be published');
reset role;
select is((select video_viewport from public.postcard_cards where id=current_setting('test.pc_card_1')::uuid),current_setting('test.pc_frame')::jsonb,'frame mode uses the canonical print window');
select is((select count(*) from public.processing_jobs where ar_item_id=current_setting('test.pc_item')::uuid),5::bigint,'finalization and retry create one set of analysis/transcode/compile/poster jobs');
select is((select spent from private.photo_credit_wallets where account_id='20000000-0000-4000-8000-000000000001'),current_setting('test.pc_spent')::bigint+2,'upload/finalization retries never spend another creation');
select is((select metadata->>'serverTranscodeRequired' from public.media_assets where id=(select video_asset_id from public.ar_items where id=current_setting('test.pc_item')::uuid)),'true','arbitrary source codecs remain private until existing server transcoding');
select throws_ok($$update public.processing_jobs set status='succeeded',completed_at=now(),output_metadata='{"durationSeconds":121}'::jsonb where ar_item_id=current_setting('test.pc_item')::uuid and type='video_inspection'$$,'23514','Postcard video duration limit reached','authoritative inspection cannot bypass the public duration cap');
select throws_ok($$update public.processing_jobs set status='succeeded',completed_at=now(),output_metadata='{"durationSeconds":121}'::jsonb where ar_item_id=current_setting('test.pc_item')::uuid and type='video_transcode'$$,'23514','Postcard video duration limit reached','authoritative transcoding cannot bypass the public duration cap');

-- Stand in for already verified worker output to exercise publication guards.
update public.processing_jobs set status='succeeded',progress=100,completed_at=now(),output_metadata=case when type in ('video_inspection','video_transcode') then '{"durationSeconds":10}'::jsonb else '{}'::jsonb end where ar_item_id=current_setting('test.pc_item')::uuid;
update public.ar_items set status='ready',tracking_status='ready',tracking_dataset_path='postcard-buyer-test/ready.mind',video_thumbnail_path='postcard-buyer-test/poster.webp' where id=current_setting('test.pc_item')::uuid;
set local role service_role;
select is(public.postcard_buyer_publish(current_setting('test.pc_token_1'),repeat('9',64))->>'error','invalid_card','only its purchaser can publish a ready gift');
select is(public.postcard_buyer_publish(current_setting('test.pc_token_1'),repeat('1',64))#>>'{card,state}','published','ready processed gift publishes through the existing publication rules');
select is(public.postcard_buyer_publish(current_setting('test.pc_token_1'),repeat('1',64))#>>'{card,state}','published','publication retry keeps the same gift and public slug');
select set_config('test.pc_upload_2',public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000002','full',current_setting('test.pc_video')::jsonb)::text,true);
reset role;
select is((select status::text from public.ar_items where id=current_setting('test.pc_item')::uuid),'published','beginning an edit leaves the previously published gift visible');
set local role service_role;
select set_config('test.pc_upload_3',public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000003','full',current_setting('test.pc_video')::jsonb)::text,true);
select is(public.postcard_buyer_start_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000004','full',current_setting('test.pc_video')::jsonb)->>'error','too_many_uploads','one card cannot reserve unlimited simultaneous uploads');
select is(public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000002')->>'error','upload_superseded','an older upload cannot replace a newer chosen video');
select is(public.postcard_buyer_upload_target(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000002')->>'error','invalid_card','streaming cannot write a superseded upload');
reset role;
insert into storage.objects(bucket_id,name,metadata)
select storage_bucket,storage_path,jsonb_build_object('size',size_bytes,'mimetype',mime_type)
from public.upload_sessions where idempotency_key='a8200000-0000-4000-8000-000000000003';
set local role service_role;
select is(public.postcard_buyer_complete_upload(current_setting('test.pc_token_1'),repeat('1',64),'a8200000-0000-4000-8000-000000000003')#>>'{card,state}','processing','the selected replacement processes on the same existing work');
reset role;
select is((select video_viewport from public.postcard_cards where id=current_setting('test.pc_card_1')::uuid),'{"x":0,"y":0,"width":1,"height":1}'::jsonb,'full mode covers the whole printed marker');
select is((select spent from private.photo_credit_wallets where account_id='20000000-0000-4000-8000-000000000001'),current_setting('test.pc_spent')::bigint+2,'editing a published card never spends a second creation');
select is((select count(*) from public.ar_items where idempotency_key=current_setting('test.pc_card_1')::uuid),1::bigint,'all edits retain one work per physical card');
select ok(exists(select 1 from public.audit_logs where entity_id=current_setting('test.pc_card_1')::uuid and action='postcard.buyer.claimed' and actor_user_id is null),'purchaser actions are audited without impersonating the issuer');

select * from finish();
rollback;
