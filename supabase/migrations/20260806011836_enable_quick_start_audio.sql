-- The quick-start launch button is an explicit user gesture, so these items
-- may request audio while retaining the viewer's visible mute control.
update public.ar_items item
set audio_default = 'user_enabled',
    updated_at = statement_timestamp()
from public.projects project
where project.id = item.project_id
  and project.account_id = item.account_id
  and project.idempotency_key = 'fe7f735d-dc37-4ba8-9df1-8c2a50d2c101'
  and project.deleted_at is null
  and item.deleted_at is null
  and item.audio_default = 'muted';
