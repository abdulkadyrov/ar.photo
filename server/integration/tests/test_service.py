import copy,hashlib,io,json,os,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
from integration.service import Service,Conflict
from integration.security import checked_url,download,normalize,Rejected
from integration.supabase_gateway import stable
from PIL import Image

HOST='crm-bucket.example.com';TOKEN='test-only-token-with-more-than-32-characters'

def image_bytes(orientation=1):
 out=io.BytesIO();im=Image.new('RGB',(12,20),'red');exif=Image.Exif();exif[274]=orientation;exif[270]='private-note';im.save(out,format='JPEG',exif=exif);return out.getvalue()

class FakeGateway:
 def __init__(self):
  self.item={'id':'item-id','public_slug':'a'*36,'status':'draft','version':1};self.assets={};self.uploads=0;self.prepares=0;self.publishes=0;self.unpublishes=0;self.fail_after_prepare=False;self.workspaces=0
 def workspace(self,p,w):self.workspaces+=1;return {'id':'project-id'},{'id':'group-id'},copy.deepcopy(self.item)
 def upload(self,p,g,kind,path,mime,digest,metadata,key):
  if key not in self.assets:self.assets[key]={'id':kind+'-'+str(len(self.assets)), 'metadata':metadata};self.uploads+=1
  return self.assets[key]
 def get(self,t,i):return copy.deepcopy(self.item)
 def jobs(self,item):
  if not self.item.get('marker_asset_id'):return []
  return [{'status':'succeeded' if self.item['status']=='ready' or self.item['status']=='published' else 'running','input_metadata':{'revision':self.item['version'],'assetId':self.source_video}}]
 def prepare(self,item,marker,video):
  self.prepares+=1;self.item.update(marker_asset_id=marker,video_asset_id=video,status='processing',version=self.item['version']+1);self.source_video=video
  if self.fail_after_prepare:self.fail_after_prepare=False;raise OSError('lost response')
  return copy.deepcopy(self.item)
 def unpublish(self,item):self.unpublishes+=1;self.item['status']='ready'
 def publish(self,item):
  if self.item['status'] not in ('ready','published'):raise ValueError('not ready')
  self.publishes+=1;self.item['status']='published';return {'public_url':'https://khanzama.ru/ar.photo/ar/'+self.item['public_slug']}

class ServiceFixture(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.gateway=FakeGateway();self.sources={'marker':image_bytes(),'video':b'\0\0\0\x18ftypisomvideo'}
  self.body={'version':1,'workId':'work-1','projectId':'project-1','studentId':'student-1','assets':{kind:{'mediaId':kind+'-1','sha256':hashlib.sha256(raw).hexdigest(),'mime':'image/jpeg' if kind=='marker' else 'video/mp4','url':'https://'+HOST+'/'+kind+'?signature=old'} for kind,raw in self.sources.items()}}
  def fake_download(asset,path,*args):
   raw=self.sources['marker' if asset['mime'].startswith('image/') else 'video'];self.assertEqual(hashlib.sha256(raw).hexdigest(),asset['sha256']);path.write_bytes(raw)
  self.service=Service(self.temp.name,TOKEN,HOST,self.gateway,downloader=fake_download)
 def call(self,body=None,key='request-111111111111',token=TOKEN):
  raw=json.dumps(body or self.body).encode();env={'REQUEST_METHOD':'POST','PATH_INFO':'/ar.photo/api/v1/works','CONTENT_LENGTH':str(len(raw)),'HTTP_AUTHORIZATION':'Bearer '+token,'HTTP_IDEMPOTENCY_KEY':key,'wsgi.input':io.BytesIO(raw)};response={}
  def start(status,headers):response['status']=int(status.split()[0])
  response['body']=json.loads(b''.join(self.service(env,start)));return response

class ServiceTest(ServiceFixture):
 def test_processing_poll_does_not_repeat_prepare_and_ready_requires_publish(self):
  self.assertEqual(self.call()['status'],202);self.assertEqual(self.gateway.prepares,1)
  self.assertEqual(self.call()['status'],202);self.assertEqual(self.gateway.prepares,1);self.assertEqual(self.gateway.publishes,0)
  self.gateway.item.update(status='ready',video_asset_id='transcoded-video')
  result=self.call();self.assertEqual(result['status'],200);self.assertEqual(result['body']['viewerUrl'],'https://khanzama.ru/ar.photo/ar/'+'a'*36)
  self.assertEqual(self.gateway.prepares,1);self.assertEqual(self.gateway.uploads,2)
  self.assertEqual(self.call()['body'],result['body']);self.assertEqual(self.gateway.publishes,1)
 def test_a4_frame_is_persisted_with_video_and_part_of_idempotency(self):
  self.body['frame']='a4-portrait'
  self.assertEqual(self.call()['status'],202)
  video=next(a for a in self.gateway.assets.values() if a['id'].startswith('video'))
  self.assertEqual(video['metadata']['crmFrame'],'a4-portrait')
  changed=copy.deepcopy(self.body);changed['frame']='a4-landscape'
  self.assertEqual(self.call(changed)['status'],409)
  self.assertEqual(self.gateway.uploads,2)
 def test_lost_prepare_response_recovers_from_rpc_state_after_restart(self):
  self.gateway.fail_after_prepare=True;self.assertEqual(self.call()['status'],503)
  self.service=Service(self.temp.name,TOKEN,HOST,self.gateway,downloader=self.service.downloader)
  self.assertEqual(self.call()['status'],202);self.assertEqual(self.gateway.prepares,1);self.assertEqual(self.gateway.uploads,2)
 def test_signed_url_refresh_identity_and_conflict(self):
  self.assertEqual(self.call()['status'],202);body=copy.deepcopy(self.body)
  body['assets']['video']['url']='https://'+HOST+'/video?signature=new'
  self.assertEqual(self.call(body)['status'],202);self.assertEqual(self.gateway.prepares,1)
  for key,value in [('sha256','f'*64),('mime','video/webm'),('mediaId','other')]:
   changed=copy.deepcopy(body);changed['assets']['video'][key]=value;self.assertEqual(self.call(changed)['status'],409)
  db=(Path(self.temp.name)/'integration.sqlite3').read_bytes();self.assertNotIn(b'signature=',db);self.assertNotIn(TOKEN.encode(),db)
 def test_new_key_update_retains_item_slug_and_old_receipt_cannot_revert(self):
  self.call();self.gateway.item['status']='ready';one=self.call()
  self.sources['video']+=b'new';updated=copy.deepcopy(self.body);updated['assets']['video']['sha256']=hashlib.sha256(self.sources['video']).hexdigest()
  self.assertEqual(self.call(updated,key='request-222222222222')['status'],202);self.assertEqual(self.gateway.unpublishes,1);self.assertEqual(self.gateway.prepares,2)
  self.assertEqual(self.call()['status'],202);self.assertEqual(self.gateway.prepares,2)
  self.gateway.item['status']='ready';two=self.call(updated,key='request-222222222222');self.assertEqual(two['body'],one['body'])
  self.assertEqual(self.call()['body'],one['body']);self.assertEqual(self.gateway.prepares,2)
 def test_auth_and_scope_conflict(self):
  self.assertEqual(self.call(token='wrong')['status'],401);self.assertEqual(self.gateway.workspaces,0)
  self.call();body=copy.deepcopy(self.body);body['studentId']='another';self.assertEqual(self.call(body,key='request-other111111')['status'],409)
 def test_no_ready_when_rpc_did_not_publish(self):
  self.call();self.gateway.item['status']='ready'
  with patch.object(self.gateway,'publish',return_value={'public_url':'https://khanzama.ru/ar.photo/ar/'+'a'*36}):self.assertEqual(self.call()['status'],503)
 def test_stable_rpc_keys(self):self.assertEqual(stable('crm','work','marker'),stable('crm','work','marker'));self.assertNotEqual(stable('crm','work','marker'),stable('crm','work','video'))

class SecurityTest(unittest.TestCase):
 def test_url_rejects_ssrf_and_allowlist_confusion(self):
  for url in ['http://'+HOST+'/a','https://127.0.0.1/a','https://'+HOST+'.evil/a','https://'+HOST+'@evil/a','https://'+HOST+':8443/a','https://'+HOST+'/a#fragment','https://evil/a']:
   with self.subTest(url=url),self.assertRaises((Rejected,ValueError)):checked_url(url,HOST)
  self.assertEqual(checked_url('https://'+HOST+'/a?signature=secret',HOST).hostname,HOST)
 def test_dns_private_address_never_connects(self):
  def forbidden(*args):raise AssertionError('must not connect')
  resolver=lambda *args,**kwargs:[(None,None,None,None,('127.0.0.1',443))]
  with tempfile.TemporaryDirectory() as root,self.assertRaises(Rejected):download({'url':'https://'+HOST+'/a','mime':'image/jpeg','sha256':'a'*64},Path(root)/'x',HOST,resolver=resolver,connection=forbidden)
 def test_hash_mime_redirect_and_size_checked(self):
  raw=b'bytes';asset={'url':'https://'+HOST+'/a','mime':'image/jpeg','sha256':hashlib.sha256(raw).hexdigest()}
  class Response:
   status=200
   def getheader(self,key,default=None):return {'Content-Type':'image/jpeg','Content-Length':str(len(raw))}.get(key,default)
   def read(self,n):nonlocal raw;result=raw;raw=b'';return result
  class Connection:
   def __init__(self,*args):pass
   def request(self,*args,**kwargs):pass
   def getresponse(self):return response
   def close(self):pass
  resolver=lambda *args,**kwargs:[(None,None,None,None,('8.8.8.8',443))]
  with tempfile.TemporaryDirectory() as root:
   response=Response();path=Path(root)/'x';self.assertEqual(download(asset,path,HOST,resolver=resolver,connection=Connection),5)
   response.status=302
   with self.assertRaises(Rejected):download(asset,path,HOST,resolver=resolver,connection=Connection)
   response.status=200;raw=b'other'
   with self.assertRaises(Rejected):download(asset,path,HOST,resolver=resolver,connection=Connection)
 def test_exif_orientation_applied_metadata_actually_removed(self):
  with tempfile.TemporaryDirectory() as root:
   path=Path(root)/'raw';path.write_bytes(image_bytes(6));result,mime,digest,metadata=normalize(path,'marker','image/jpeg',Path(root)/'clean.png')
   self.assertEqual((metadata['width'],metadata['height']),(20,12));self.assertTrue(metadata['exifStripped']);self.assertEqual(mime,'image/png')
   with Image.open(result) as image:self.assertEqual(len(image.getexif()),0);self.assertNotIn('private-note',str(image.info))
   self.assertNotEqual(digest,hashlib.sha256(path.read_bytes()).hexdigest())
 def test_video_source_metadata_does_not_claim_inspected_dimensions(self):
  with tempfile.TemporaryDirectory() as root:
   path=Path(root)/'video';path.write_bytes(b'\0\0\0\x18ftypisomvideo');_,mime,_,metadata=normalize(path,'video','video/quicktime',Path(root)/'unused')
   self.assertEqual(mime,'video/mp4');self.assertIsNone(metadata['width']);self.assertTrue(metadata['serverTranscodeRequired']);self.assertEqual(metadata['videoCodec'],'source')

class ConcurrencyAndTransportTest(ServiceFixture):
 def test_busy_work_serializes_and_different_payload_key_still_conflicts(self):
  import fcntl
  self.call()
  with (Path(self.temp.name)/(stable('crm','work-1')+'.lock')).open('a') as held:
   fcntl.flock(held,fcntl.LOCK_EX|fcntl.LOCK_NB)
   self.assertEqual(self.call()['status'],202)
   changed=copy.deepcopy(self.body);changed['assets']['marker']['sha256']='f'*64
   self.assertEqual(self.call(changed)['status'],409)
   self.assertEqual(self.gateway.prepares,1)
 def test_stale_sqlite_lease_without_live_os_lock_recovers(self):
  self.call()
  with self.service.db() as c:c.execute('UPDATE works SET lease=?,lease_until=?',('dead-process',time_future()))
  self.assertEqual(self.call()['status'],202);self.assertEqual(self.gateway.prepares,1)

def time_future():return 9999999999999

class GatewayContractTest(unittest.TestCase):
 def test_finalized_upload_does_not_restart_or_upload_again(self):
  from integration.supabase_gateway import SupabaseGateway
  from unittest.mock import Mock
  gateway=object.__new__(SupabaseGateway);gateway.account='account';gateway.rpc=Mock(return_value={'status':'finalized','asset_id':'asset'});gateway.get=Mock(return_value={'id':'asset'});gateway.call=Mock()
  with tempfile.TemporaryDirectory() as root:
   path=Path(root)/'marker';path.write_bytes(b'normalized')
   self.assertEqual(gateway.upload({'id':'p'},{'id':'g'},'marker',path,'image/png','a'*64,{},'deterministic')['id'],'asset')
  self.assertEqual(gateway.rpc.call_count,1);gateway.call.assert_not_called()
  args=gateway.rpc.call_args.args;self.assertEqual(args[0],'begin_media_upload');self.assertEqual(args[1]['p_request_id'],'deterministic')
 def test_prepare_uses_existing_enum_and_normal_publication_rpc(self):
  from integration.supabase_gateway import SupabaseGateway
  from unittest.mock import Mock
  gateway=object.__new__(SupabaseGateway);gateway.account='account';gateway.rpc=Mock()
  gateway.prepare('item','marker','video');self.assertEqual(gateway.rpc.call_args.args[1]['p_marker_lost_behavior'],'pause_hide')
  gateway.publish('item');self.assertEqual(gateway.rpc.call_args.args[0],'publish_ar_item');self.assertEqual(gateway.rpc.call_args.args[1]['p_public_base_url'],'https://khanzama.ru/ar.photo')
 def test_mime_size_signature_limits(self):
  resolver=lambda *args,**kwargs:[(None,None,None,None,('8.8.8.8',443))]
  class Response:
   status=200;mime='text/html';size='12'
   def getheader(self,k,d=None):return {'Content-Type':self.mime,'Content-Length':self.size}.get(k,d)
   def read(self,n):raise AssertionError('must reject headers before reading')
  response=Response()
  class Connection:
   def __init__(self,*args):pass
   def request(self,*args,**kwargs):pass
   def getresponse(self):return response
   def close(self):pass
  asset={'url':'https://'+HOST+'/a','mime':'image/jpeg','sha256':'a'*64}
  with tempfile.TemporaryDirectory() as root:
   for mime,size in [('text/html','12'),('image/jpeg',str(26*1024*1024))]:
    response.mime=mime;response.size=size
    with self.assertRaises(Rejected):download(asset,Path(root)/'x',HOST,resolver=resolver,connection=Connection)
   path=Path(root)/'bad';path.write_bytes(b'not video')
   with self.assertRaises(Rejected):normalize(path,'video','video/mp4',Path(root)/'unused')

class LimitReportingTest(ServiceFixture):
 def test_rpc_quota_is_clear_and_not_bypassed(self):
  from integration.supabase_gateway import GatewayError
  with patch.object(self.gateway,'workspace',side_effect=GatewayError('quota_or_limit_reached',409)):
   result=self.call();self.assertEqual(result['status'],409);self.assertEqual(result['body']['error'],'quota_or_limit_reached');self.assertEqual(self.gateway.uploads,0)

class MultiPictureJpegTest(unittest.TestCase):
 def assert_primary_normalized(self,path):
  from PIL import ImageOps,ImageChops
  before=hashlib.sha256(path.read_bytes()).hexdigest()
  with Image.open(path) as source:
   self.assertEqual(source.format,'MPO');self.assertGreater(source.n_frames,1)
   source.seek(0);expected=ImageOps.exif_transpose(source).convert('RGB').copy()
  with tempfile.TemporaryDirectory() as folder:
   result,mime,digest,metadata=normalize(path,'marker','image/jpeg',Path(folder)/'clean.png')
   self.assertEqual(mime,'image/png');self.assertTrue(metadata['exifStripped'])
   with Image.open(result) as image:
    self.assertEqual(image.format,'PNG');self.assertEqual(image.mode,'RGB');self.assertEqual(image.size,expected.size)
    self.assertIsNone(ImageChops.difference(image,expected).getbbox());self.assertFalse(image.getexif())
   self.assertEqual((metadata['width'],metadata['height']),expected.size)
   with self.assertRaises(Rejected):normalize(path,'marker','image/png',Path(folder)/'wrong.png')
   with self.assertRaises(Rejected):normalize(path,'marker','image/webp',Path(folder)/'wrong.webp')
  self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),before)
 def test_synthetic_mpo_primary_frame_orientation_and_strict_mime(self):
  with tempfile.TemporaryDirectory() as folder:
   path=Path(folder)/'multi.jpg';exif=Image.Exif();exif[274]=6;exif[270]='private-note'
   Image.new('RGB',(12,20),'red').save(path,format='MPO',save_all=True,append_images=[Image.new('RGB',(12,20),'blue')],exif=exif)
   self.assert_primary_normalized(path)
 def test_existing_public_fixture_mpo_smoke_without_mutating_original(self):
  fixture=Path(__file__).resolve().parents[3]/'public'/'test-assets'/'test.jpg'
  self.assertTrue(fixture.is_file());self.assert_primary_normalized(fixture)
