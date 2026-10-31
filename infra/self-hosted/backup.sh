#!/usr/bin/env bash
set -euo pipefail
umask 077

root=/opt/ar-photo
stamp=$(date -u +%Y%m%dT%H%M%SZ)
destination="$root/backups/daily/$stamp"
install -d -m 700 "$destination"

docker exec supabase-db pg_dump -U supabase_admin -d postgres -Fc > "$destination/database.dump.tmp"
mv "$destination/database.dump.tmp" "$destination/database.dump"
docker exec -i supabase-db pg_restore --list < "$destination/database.dump" > "$destination/database.contents"
tar -czf "$destination/files-and-config.tar.gz.tmp" -C "$root/supabase" \
  .env .env.functions docker-compose.yml compose.budget.yml volumes/storage volumes/functions
mv "$destination/files-and-config.tar.gz.tmp" "$destination/files-and-config.tar.gz"
sha256sum "$destination/database.dump" "$destination/files-and-config.tar.gz" > "$destination/SHA256SUMS"
touch "$destination/COMPLETE"

# Delete only complete backups created by this script, retaining seven days.
find "$root/backups/daily" -mindepth 2 -maxdepth 2 -name COMPLETE -mtime +7 -print0 |
  while IFS= read -r -d '' marker; do rm -rf -- "$(dirname "$marker")"; done
printf 'Backup completed: %s\n' "$stamp"
