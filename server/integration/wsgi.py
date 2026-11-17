"""Gunicorn factory. Bind to localhost only; configuration never enters the browser."""
import os
from .service import Service
from .supabase_gateway import SupabaseGateway

def create_app():
 return Service(os.environ['AR_INTEGRATION_DATA_DIR'],os.environ['AR_CRM_BEARER_TOKEN'],os.environ['AR_CRM_S3_HOST'],SupabaseGateway(),namespace=os.environ.get('AR_CRM_NAMESPACE','crm'),prefix=os.environ.get('AR_CRM_S3_PATH_PREFIX','/'))
