"""Local-only WSGI adapter; every request advances or polls one durable publication."""
import fcntl,hashlib,hmac,json,os,re,sqlite3,tempfile,time
from contextlib import contextmanager
from pathlib import Path
from urllib.parse import urlsplit
from .security import checked_url,download,normalize,Rejected
from .supabase_gateway import stable,GatewayError

class Conflict(ValueError):pass

class Service:
 def __init__(self,root,token,host,gateway,namespace='crm',downloader=download,prefix='/'):
  if not token.isascii() or len(token)<32:raise ValueError('integration_token_too_short')
  self.root=Path(root);self.root.mkdir(parents=True,exist_ok=True,mode=0o700);os.chmod(self.root,0o700)
  self.token=token;self.host=host;self.gateway=gateway;self.namespace=namespace;self.downloader=downloader;self.prefix=prefix
  with self.db() as c:c.executescript('''
   CREATE TABLE IF NOT EXISTS receipts(namespace TEXT,key TEXT,identity TEXT,work TEXT,result TEXT,PRIMARY KEY(namespace,key));
   CREATE TABLE IF NOT EXISTS works(namespace TEXT,work TEXT,project TEXT,student TEXT,state TEXT NOT NULL DEFAULT '{}',lease TEXT,lease_until REAL NOT NULL DEFAULT 0,PRIMARY KEY(namespace,work));
  ''')
 @contextmanager
 def db(self):
  c=sqlite3.connect(self.root/'integration.sqlite3',timeout=10);c.row_factory=sqlite3.Row
  try:yield c;c.commit()
  except BaseException:c.rollback();raise
  finally:c.close()
 def validate(self,body):
  if not isinstance(body,dict) or type(body.get('version')) is not int or body.get('version')!=1:raise Rejected('invalid_version')
  def ident(value):
   if not isinstance(value,str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,200}',value):raise Rejected('invalid_identity')
   return value
  result={'version':1,**{key:ident(body.get(key)) for key in ('workId','projectId','studentId')}}
  if 'frame' in body:
   if body['frame'] not in ('a4-portrait','a4-landscape'):raise Rejected('invalid_frame')
   result['frame']=body['frame']
  assets=body.get('assets')
  if not isinstance(assets,dict) or set(assets)!= {'marker','video'}:raise Rejected('invalid_assets')
  result['assets']={}
  for kind,allowed in [('marker',('image/jpeg','image/png','image/webp')),('video',('video/mp4','video/quicktime','video/webm'))]:
   asset=assets[kind]
   if not isinstance(asset,dict) or asset.get('mime') not in allowed or not re.fullmatch('[a-f0-9]{64}',str(asset.get('sha256',''))):raise Rejected('invalid_asset_identity')
   checked_url(asset.get('url',''),self.host,self.prefix)
   result['assets'][kind]={'mediaId':ident(asset.get('mediaId')),'mime':asset['mime'],'sha256':asset['sha256']}
  return result
 def process(self,key,body):
  if not isinstance(key,str) or not re.fullmatch('[A-Za-z0-9_-]{16,200}',key):raise Rejected('invalid_idempotency_key')
  identity=json.dumps(self.validate(body),sort_keys=True,separators=(',',':'));work=body['workId'];fingerprint=hashlib.sha256(identity.encode()).hexdigest()
  with self.db() as c:
   prior=c.execute('SELECT identity FROM receipts WHERE namespace=? AND key=?',(self.namespace,key)).fetchone()
   if prior and prior['identity']!=identity:raise Conflict('idempotency_key_identity_conflict')
  lock_path=self.root/(stable(self.namespace,work)+'.lock')
  with lock_path.open('a') as lock:
   try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
   except BlockingIOError:return 202,{'status':'processing'}
   try:
    with self.db() as c:
     completed=c.execute('SELECT * FROM receipts WHERE namespace=? AND key=?',(self.namespace,key)).fetchone()
    if completed and completed['result']:
     if completed['identity']!=identity:raise Conflict('idempotency_key_identity_conflict')
     original=json.loads(completed['result']);remote=self.gateway.get('ar_items',original['arWorkId'])
     if remote['status']=='published' and original['viewerUrl']=='https://khanzama.ru/ar.photo/ar/'+remote.get('public_slug',''):return 200,original
     return 202,{'status':'processing','arWorkId':original['arWorkId']}
    with self.db() as c:
     c.execute('BEGIN IMMEDIATE')
     receipt=c.execute('SELECT * FROM receipts WHERE namespace=? AND key=?',(self.namespace,key)).fetchone()
     if receipt and receipt['identity']!=identity:raise Conflict('idempotency_key_identity_conflict')
     current=c.execute('SELECT * FROM works WHERE namespace=? AND work=?',(self.namespace,work)).fetchone()
     if current and (current['project']!=body['projectId'] or current['student']!=body['studentId']):raise Conflict('work_owner_conflict')
     if not current:c.execute('INSERT INTO works(namespace,work,project,student) VALUES(?,?,?,?)',(self.namespace,work,body['projectId'],body['studentId']))
     if not receipt:c.execute('INSERT INTO receipts VALUES(?,?,?,?,NULL)',(self.namespace,key,identity,work))
     state=json.loads(current['state']) if current else {}
     if state.get('active') and state['active']!=fingerprint and not state.get('ready'):raise Conflict('previous_revision_still_processing')
     if state.get('active')!=fingerprint:state={**{k:v for k,v in state.items() if k in ('itemId','slug')},'active':fingerprint}
     # OS lock prevents live lease stealing. Process death releases lock; recovery revalidates remote state.
     c.execute('UPDATE works SET lease=?,lease_until=?,state=? WHERE namespace=? AND work=?',(key,time.time()+900,json.dumps(state),self.namespace,work))
    def checkpoint(**changes):
     state.update(changes)
     with self.db() as c:c.execute('UPDATE works SET state=?,lease_until=? WHERE namespace=? AND work=?',(json.dumps(state),time.time()+900,self.namespace,work))
    p,g,item=self.gateway.workspace(body['projectId'],work)
    if state.get('itemId') and state['itemId']!=item['id']:raise Conflict('remote_item_mapping_changed')
    checkpoint(itemId=item['id'])
    for kind in ('marker','video'):
     if state.get(kind+'Id'):continue
     asset=body['assets'][kind]
     with tempfile.TemporaryDirectory(dir=self.root,prefix='asset-') as folder:
      path=Path(folder)/'original';self.downloader(asset,path,self.host,self.prefix)
      upload,mime,digest,metadata=normalize(path,kind,asset['mime'],Path(folder)/'normalized.png')
      if kind=='video' and body.get('frame'):metadata={**metadata,'crmFrame':body['frame']}
      session_key=stable(self.namespace,work,kind,asset['sha256'],asset['mime'],body['frame']) if body.get('frame') else stable(self.namespace,work,kind,asset['sha256'],asset['mime'])
      uploaded=self.gateway.upload(p,g,kind,upload,mime,digest,metadata,session_key)
      checkpoint(**{kind+'Id':uploaded['id']})
    item=self.gateway.get('ar_items',state['itemId']);jobs=self.gateway.jobs(item['id'])
    revision=item['version']
    same_marker=item.get('marker_asset_id')==state['markerId']
    same_video=item.get('video_asset_id')==state['videoId'] or any(str(job.get('input_metadata',{}).get('revision'))==str(revision) and job.get('input_metadata',{}).get('assetId')==state['videoId'] for job in jobs)
    attached=same_marker and same_video
    if state.get('prepared') and not attached:raise Conflict('remote_revision_changed')
    if not attached:
     if item['status']=='published':self.gateway.unpublish(item['id'])
     item=self.gateway.prepare(item['id'],state['markerId'],state['videoId'])
     checkpoint(prepared=item['version'])
     return 202,{'status':'processing','arWorkId':item['id']}
    checkpoint(prepared=revision)
    if item['status']=='failed' or any(job.get('status')=='failed' and str(job.get('input_metadata',{}).get('revision'))==str(revision) for job in jobs):
     raise Conflict('processing_failed_manual_review_required')
    if item['status'] not in ('ready','published'):return 202,{'status':'processing','arWorkId':item['id']}
    qr=self.gateway.publish(item['id']) # Authoritative RPC enforces four succeeded current-revision jobs.
    actual=self.gateway.get('ar_items',item['id']);slug=actual.get('public_slug','')
    if actual['status']!='published' or not re.fullmatch('[a-f0-9]{36}',slug):raise GatewayError('publication_not_confirmed')
    viewer='https://khanzama.ru/ar.photo/ar/'+slug
    if qr.get('public_url')!=viewer or state.get('slug') and state['slug']!=slug:raise Conflict('stable_viewer_changed')
    result={'status':'ready','arWorkId':item['id'],'viewerUrl':viewer}
    checkpoint(ready=True,slug=slug)
    with self.db() as c:c.execute('UPDATE receipts SET result=? WHERE namespace=? AND key=?',(json.dumps(result),self.namespace,key))
    return 200,result
   finally:
    with self.db() as c:c.execute('UPDATE works SET lease=NULL,lease_until=0 WHERE namespace=? AND work=?',(self.namespace,work))
    fcntl.flock(lock,fcntl.LOCK_UN)
 def __call__(self,environ,start_response):
  status=500;result={'error':'integration_unavailable'}
  try:
   supplied=environ.get('HTTP_AUTHORIZATION','')
   if not hmac.compare_digest(supplied,'Bearer '+self.token):status=401;result={'error':'unauthorized'}
   elif environ.get('PATH_INFO')!='/ar.photo/api/v1/works':status=404;result={'error':'not_found'}
   elif environ.get('REQUEST_METHOD')!='POST':status=405;result={'error':'method_not_allowed'}
   else:
    length=int(environ.get('CONTENT_LENGTH','0'))
    if not 0<length<=65536:raise Rejected('invalid_request_size')
    raw=environ['wsgi.input'].read(length)
    if len(raw)!=length:raise Rejected('truncated_request')
    body=json.loads(raw,parse_constant=lambda value:(_ for _ in ()).throw(Rejected('nonfinite_json')))
    status,result=self.process(environ.get('HTTP_IDEMPOTENCY_KEY',''),body)
  except Conflict as error:status=409;result={'error':str(error)}
  except GatewayError as error:status=error.status;result={'error':error.code}
  except (Rejected,ValueError,KeyError,TypeError):status=400;result={'error':'invalid_request_or_asset'}
  except Exception:status=503;result={'error':'integration_unavailable'} # Never log URLs/keys/upstream response text.
  raw=json.dumps(result).encode();reasons={200:'OK',202:'Accepted',400:'Bad Request',401:'Unauthorized',403:'Forbidden',404:'Not Found',405:'Method Not Allowed',409:'Conflict',503:'Service Unavailable'}
  start_response(str(status)+' '+reasons.get(status,'Internal Server Error'),[('Content-Type','application/json'),('Cache-Control','no-store'),('Content-Length',str(len(raw)))])
  return [raw]
