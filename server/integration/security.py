"""Bounded, DNS-pinned HTTPS downloads from one exact private CRM bucket host."""
import hashlib,http.client,ipaddress,os,re,socket,ssl,time
from pathlib import Path
from urllib.parse import urlsplit

class Rejected(ValueError):pass

def checked_url(url,host,prefix='/'):
 if not isinstance(url,str):raise Rejected('invalid_asset_url')
 try:p=urlsplit(url)
 except ValueError:raise Rejected('invalid_asset_url') from None
 if not host or '*' in host or host.lower()!=host or not re.fullmatch('[a-z0-9.-]+',host):raise Rejected('invalid_allowlist')
 try:ipaddress.ip_address(host)
 except ValueError:pass
 else:raise Rejected('ip_host_not_allowed')
 if p.scheme!='https' or p.hostname!=host or p.username or p.password or p.port not in (None,443) or p.fragment or not p.path.startswith(prefix) or len(url)>16384:raise Rejected('asset_url_not_allowed')
 if any(ord(c)<33 or ord(c)>126 for c in url):raise Rejected('invalid_asset_url')
 return p

class PinnedHTTPS(http.client.HTTPSConnection):
 def __init__(self,host,address):super().__init__(host,timeout=15,context=ssl.create_default_context());self.address=address
 def connect(self):
  sock=socket.create_connection((self.address,443),self.timeout)
  try:self.sock=self._context.wrap_socket(sock,server_hostname=self.host)
  except BaseException:sock.close();raise

def download(asset,target,host,prefix='/',resolver=socket.getaddrinfo,connection=PinnedHTTPS):
 p=checked_url(asset['url'],host,prefix)
 addresses=list(dict.fromkeys(row[4][0] for row in resolver(host,443,type=socket.SOCK_STREAM)))
 if not addresses or any(not ipaddress.ip_address(ip).is_global for ip in addresses):raise Rejected('non_public_asset_address')
 limit=25*1024*1024 if asset['mime'].startswith('image/') else 500*1024*1024
 conn=connection(host,addresses[0]);size=0;digest=hashlib.sha256();started=time.monotonic()
 try:
  conn.request('GET',p.path+('?' + p.query if p.query else ''),headers={'Accept':asset['mime'],'Accept-Encoding':'identity'})
  response=conn.getresponse()
  if response.status!=200:raise Rejected('asset_http_status') # includes redirects, never followed
  if response.getheader('Content-Encoding','identity')!='identity':raise Rejected('encoded_asset')
  if response.getheader('Content-Type','').split(';')[0].strip().lower()!=asset['mime']:raise Rejected('asset_mime_mismatch')
  length=response.getheader('Content-Length')
  if length is not None and (not length.isdecimal() or not 0<int(length)<=limit):raise Rejected('asset_size_limit')
  with Path(target).open('wb') as out:
   while True:
    chunk=response.read(1024*1024)
    if not chunk:break
    size+=len(chunk)
    if size>limit or time.monotonic()-started>120:raise Rejected('asset_size_or_time_limit')
    digest.update(chunk);out.write(chunk)
  if not size or length is not None and size!=int(length):raise Rejected('asset_truncated')
  if digest.hexdigest()!=asset['sha256']:raise Rejected('asset_hash_mismatch')
  return size
 except BaseException:
  Path(target).unlink(missing_ok=True);raise
 finally:conn.close()

def normalize(path,kind,mime,destination):
 """Return upload path/MIME/hash/metadata. Marker EXIF is applied then removed."""
 import warnings
 from PIL import Image,ImageOps
 raw=Path(path);size=raw.stat().st_size
 if kind=='marker':
  with warnings.catch_warnings():
   warnings.simplefilter('error',Image.DecompressionBombWarning)
   with Image.open(raw) as image:
    formats={'image/jpeg':('JPEG','MPO'),'image/png':('PNG',),'image/webp':('WEBP',)}
    if image.format not in formats.get(mime,()):raise Rejected('image_signature_mismatch')
    # MPO is a JPEG multi-picture container. Normalize only the primary photograph.
    image.seek(0)
    if image.width>12000 or image.height>12000 or image.width*image.height>40_000_000:raise Rejected('image_dimensions_limit')
    image.load();oriented=ImageOps.exif_transpose(image)
    clean=Image.new('RGB',oriented.size);clean.paste(oriented.convert('RGB'));clean.save(destination,format='PNG')
    metadata={'width':clean.width,'height':clean.height,'exifStripped':True}
  result=Path(destination);upload_mime='image/png'
 else:
  if mime not in ('video/mp4','video/quicktime','video/webm'):raise Rejected('video_mime_not_allowed')
  with raw.open('rb') as f:signature=f.read(16)
  if mime in ('video/mp4','video/quicktime') and signature[4:8]!=b'ftyp' or mime=='video/webm' and signature[:4]!=b'\x1aE\xdf\xa3':raise Rejected('video_signature_mismatch')
  # Exact existing frontend fallback: source bytes labelled MP4, authoritative worker probes/transcodes.
  result=raw;upload_mime='video/mp4'
  metadata={'width':None,'height':None,'durationSeconds':None,'videoCodec':'source','audioCodec':'source','serverTranscodeRequired':True,'sourceMime':mime,'optimization':{'strategy':'server-transcode','originalBytes':size,'uploadBytes':size,'savedBytes':0,'reductionPercent':0,'optimized':False}}
 digest=hashlib.sha256()
 with result.open('rb') as f:
  for chunk in iter(lambda:f.read(1024*1024),b''):digest.update(chunk)
 return result,upload_mime,digest.hexdigest(),metadata
