insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('markers-private', 'markers-private', false, 26214400, array['image/jpeg', 'image/png', 'image/webp']),
  ('videos-private', 'videos-private', false, 524288000, array['video/mp4']),
  ('generated-private', 'generated-private', false, 52428800, array['application/octet-stream', 'image/png', 'image/svg+xml', 'image/webp']),
  ('project-covers-private', 'project-covers-private', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars-private', 'avatars-private', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy ar_photo_storage_read on storage.objects
for select to authenticated
using (
  bucket_id in (
    'markers-private',
    'videos-private',
    'generated-private',
    'project-covers-private',
    'avatars-private'
  )
  and (select private.has_storage_access(name, false))
);

create policy ar_photo_storage_insert on storage.objects
for insert to authenticated
with check (
  bucket_id in (
    'markers-private',
    'videos-private',
    'generated-private',
    'project-covers-private',
    'avatars-private'
  )
  and (select private.has_storage_access(name, true))
);

create policy ar_photo_storage_update on storage.objects
for update to authenticated
using (
  bucket_id in (
    'markers-private',
    'videos-private',
    'generated-private',
    'project-covers-private',
    'avatars-private'
  )
  and (select private.has_storage_access(name, true))
)
with check (
  bucket_id in (
    'markers-private',
    'videos-private',
    'generated-private',
    'project-covers-private',
    'avatars-private'
  )
  and (select private.has_storage_access(name, true))
);

create policy ar_photo_storage_delete on storage.objects
for delete to authenticated
using (
  bucket_id in (
    'markers-private',
    'videos-private',
    'generated-private',
    'project-covers-private',
    'avatars-private'
  )
  and (select private.has_storage_access(name, true))
);
