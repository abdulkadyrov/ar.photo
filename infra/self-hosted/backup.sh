#!/usr/bin/env bash
set -euo pipefail
umask 077

root=/opt/ar-photo
exec 9>"$root/backups/.backup.lock"
flock -n 9 || { echo "Another backup is running" >&2; exit 1; }
stamp=$(date -u +%Y%m%dT%H%M%SZ)
destination="$root/backups/daily/$stamp"
install -d -m 700 "$destination"

docker exec supabase-db pg_dump -U supabase_admin -d postgres -Fc > "$destination/database.dump.tmp"
mv "$destination/database.dump.tmp" "$destination/database.dump"
docker exec -i supabase-db pg_restore --list < "$destination/database.dump" > "$destination/database.contents"
files=(.env .env.functions docker-compose.yml compose.budget.yml volumes/functions)
if [[ -f "$root/supabase/.env.storage-s3" ]]; then
  python3 "$root/s3-backup.py" "$destination/s3"
  files+=(.env.storage-s3 .s3-beget.json compose.s3.yml)
else
  files+=(volumes/storage)
fi
tar --xattrs -czf "$destination/files-and-config.tar.gz.tmp" -C "$root/supabase" "${files[@]}"
mv "$destination/files-and-config.tar.gz.tmp" "$destination/files-and-config.tar.gz"
sha256sum "$destination/database.dump" "$destination/files-and-config.tar.gz" > "$destination/SHA256SUMS"
touch "$destination/COMPLETE"

# Delete only complete backups created by this script, retaining seven days.
find "$root/backups/daily" -mindepth 2 -maxdepth 2 -name COMPLETE -mtime +7 -print0 |
  while IFS= read -r -d '' marker; do rm -rf -- "$(dirname "$marker")"; done
printf 'Backup completed: %s\n' "$stamp"
