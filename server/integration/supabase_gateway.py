"""Normal user-bound Auth/PostgREST/Storage. No service role or SQL bypass."""
import base64,json,os,time,uuid
from urllib.parse import quote,urlsplit
import requests

class GatewayError(RuntimeError):
 def __init__(self,code,status=503):super().__init__(code);self.status=status;self.code=code
NAMESPACE=uuid.UUID('99f4275c-a20b-41b9-99b7-a04e2d062183')
def stable(*parts):return str(uuid.uuid5(NAMESPACE,json.dumps(parts,separators=(',',':'))))

class SupabaseGateway:
 def __init__(self):
  self.base=os.environ['AR_SUPABASE_URL'].rstrip('/');p=urlsplit(self.base)
  if p.scheme!='https' and not (p.scheme=='http' and os.environ.get('AR_SUPABASE_ALLOW_INTERNAL_HTTP')=='1'):raise GatewayError('supabase_requires_https')
  if p.username or p.password or p.query or p.fragment:raise GatewayError('invalid_supabase_url')
  self.key=os.environ['AR_SUPABASE_ANON_KEY'];self.account=os.environ['AR_INTEGRATION_ACCOUNT_ID'];uuid.UUID(self.account)
  if self.key.startswith('sb_secret_'):raise GatewayError('service_role_not_allowed')
  if self.key.count('.')==2:
   try:role=json.loads(base64.urlsafe_b64decode(self.key.split('.')[1]+'===')).get('role')
   except Exception:raise GatewayError('invalid_api_key') from None
   if role!='anon':raise GatewayError('service_role_not_allowed')
  self.session=requests.Session();self.session.trust_env=False;self.token='';self.expires=0;self.namespace=os.environ.get('AR_CRM_NAMESPACE','crm')
 def call(self,path,body=None,method=None,data=None,mime=None,auth=True):
  if auth and self.expires<time.time()+60:
   credentials={'email':os.environ['AR_INTEGRATION_EMAIL'],'password':os.environ['AR_INTEGRATION_PASSWORD']}
   result=self.call('/auth/v1/token?grant_type=password',credentials,auth=False)
   self.token=result['access_token'];self.expires=time.time()+result.get('expires_in',3600)
  headers={'apikey':self.key}
  if auth:headers['Authorization']='Bearer '+self.token
  if mime:headers['Content-Type']=mime;headers['x-upsert']='true'
  try:
   response=self.session.request(method or ('POST' if body is not None or data is not None else 'GET'),self.base+path,headers=headers,json=body,data=data,timeout=(15,120),allow_redirects=False)
  except requests.RequestException:raise GatewayError('supabase_unavailable') from None
  if response.status_code==401:self.expires=0
  if not 200<=response.status_code<300:
   try:code=response.json().get('code','')
   except (ValueError,AttributeError):code=''
   known={'23514':('quota_or_limit_reached',409),'42501':('integration_account_forbidden',403),'55000':('rpc_state_guard_requires_review',409),'23503':('required_workspace_or_asset_missing',409),'22000':('upload_object_mismatch',409),'22023':('rpc_input_rejected',400)}
   if code in known:raise GatewayError(*known[code])
   raise GatewayError('supabase_request_failed_'+str(response.status_code))
  return response.json()
 def rpc(self,name,args):return self.call('/rest/v1/rpc/'+name,args)
 def get(self,table,item):
  rows=self.call('/rest/v1/'+table+'?id=eq.'+quote(item,safe='')+'&account_id=eq.'+self.account+'&select=*')
  if len(rows)!=1:raise GatewayError('record_not_found')
  return rows[0]
 def jobs(self,item):return self.call('/rest/v1/processing_jobs?ar_item_id=eq.'+quote(item,safe='')+'&account_id=eq.'+self.account+'&select=*')
 def workspace(self,project,work):
  common={'target_account_id':self.account}
  p=self.rpc('create_project',{**common,'project_name':'CRM project '+project[:80],'project_description':'CRM integration','project_category':'other','request_id':stable(self.namespace,self.account,'project',project)})
  g=self.rpc('create_group',{**common,'target_project_id':p['id'],'group_name':'CRM imports','group_description':'Integration assets','request_id':stable(self.namespace,self.account,'group',project)})
  i=self.rpc('create_ar_item_draft',{'p_target_account_id':self.account,'p_target_project_id':p['id'],'p_target_group_id':g['id'],'p_title':'CRM work '+work[:80],'p_description':'Ready video from CRM','p_request_id':stable(self.namespace,self.account,'item',work)})
  return p,g,i
 def upload(self,p,g,kind,path,mime,digest,metadata,request_id):
  session=self.rpc('begin_media_upload',{'p_target_account_id':self.account,'p_target_project_id':p['id'],'p_target_group_id':g['id'],'p_kind':kind,'p_original_file_name':'marker.png' if kind=='marker' else 'video.source.mp4','p_mime_type':mime,'p_size_bytes':path.stat().st_size,'p_request_id':request_id})
  if session['status']=='finalized':return self.get('media_assets',session['asset_id'])
  if session['status']=='expired':raise GatewayError('upload_session_expired_manual_recovery_required')
  started=self.rpc('start_media_upload',{'p_session_id':session['id']})
  if started['status']=='expired':raise GatewayError('upload_session_expired_manual_recovery_required')
  with path.open('rb') as stream:self.call('/storage/v1/object/'+quote(started['storage_bucket'],safe='')+'/'+quote(started['storage_path'],safe='/'),data=stream,mime=mime)
  return self.rpc('finalize_media_upload',{'p_session_id':session['id'],'p_sha256':digest,'p_metadata':metadata})
 def prepare(self,item,marker,video):return self.rpc('prepare_ar_item_processing',{'p_target_account_id':self.account,'p_item_id':item,'p_marker_asset_id':marker,'p_video_asset_id':video,'p_autoplay':True,'p_loop_video':True,'p_marker_lost_behavior':'pause_hide','p_audio_default':'muted','p_fallback_enabled':True})
 def unpublish(self,item):return self.rpc('unpublish_ar_item',{'p_target_account_id':self.account,'p_item_id':item})
 def publish(self,item):return self.rpc('publish_ar_item',{'p_target_account_id':self.account,'p_item_id':item,'p_public_base_url':'https://khanzama.ru/ar.photo','p_expires_at':None})
