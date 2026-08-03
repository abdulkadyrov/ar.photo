#!/usr/bin/env bash
set -euo pipefail

readonly db_container="supabase_db_ar-photo"
readonly source_database="postgres"
readonly restore_database="ar_photo_restore_rehearsal"
readonly dump_path="/tmp/ar-photo-restore-rehearsal.dump"
readonly evidence_path="${1:-artifacts/local-restore-evidence.txt}"

cleanup() {
  docker exec "$db_container" dropdb --username postgres --if-exists "$restore_database" >/dev/null 2>&1 || true
  docker exec "$db_container" rm -f "$dump_path" >/dev/null 2>&1 || true
}

trap cleanup EXIT

if [[ "$(docker inspect --format '{{.State.Running}}' "$db_container")" != "true" ]]; then
  echo "Local Supabase database container is not running" >&2
  exit 1
fi

cleanup
docker exec "$db_container" pg_dump \
  --username postgres \
  --dbname "$source_database" \
  --format custom \
  --no-owner \
  --file "$dump_path"
docker exec "$db_container" pg_restore --list "$dump_path" >/dev/null

docker exec "$db_container" createdb \
  --username postgres \
  --template template0 \
  --encoding UTF8 \
  "$restore_database"

docker exec "$db_container" pg_restore \
  --username postgres \
  --dbname "$restore_database" \
  --no-owner \
  --exit-on-error \
  "$dump_path"

query_database() {
  local database="$1"
  local query="$2"
  docker exec "$db_container" psql \
    --username postgres \
    --dbname "$database" \
    --no-psqlrc \
    --tuples-only \
    --no-align \
    --command "$query"
}

readonly source_migration_count="$(query_database "$source_database" "select count(*) from supabase_migrations.schema_migrations;")"
readonly source_account_count="$(query_database "$source_database" "select count(*) from public.accounts;")"
readonly migration_count="$(query_database "$restore_database" "select count(*) from supabase_migrations.schema_migrations;")"
readonly account_count="$(query_database "$restore_database" "select count(*) from public.accounts;")"
readonly accounts_rls="$(query_database "$restore_database" "select relrowsecurity::text || ':' || relforcerowsecurity::text from pg_class where oid = 'public.accounts'::regclass;")"
readonly anon_accounts_select="$(query_database "$restore_database" "select has_table_privilege('anon', 'public.accounts', 'select');")"
readonly anon_private_usage="$(query_database "$restore_database" "select has_schema_privilege('anon', 'private', 'usage');")"
readonly dump_sha256="$(docker exec "$db_container" sha256sum "$dump_path" | awk '{print $1}')"
readonly dump_bytes="$(docker exec "$db_container" stat --format '%s' "$dump_path")"

[[ "$source_migration_count" -ge 1 ]] || { echo "Source migration history is empty" >&2; exit 1; }
[[ "$migration_count" == "$source_migration_count" ]] || { echo "Restored migration history does not match source" >&2; exit 1; }
[[ "$source_account_count" -ge 2 ]] || { echo "Source synthetic account fixtures are missing" >&2; exit 1; }
[[ "$account_count" == "$source_account_count" ]] || { echo "Restored account fixtures do not match source" >&2; exit 1; }
[[ "$accounts_rls" == "true:true" ]] || { echo "Forced RLS was not restored for public.accounts" >&2; exit 1; }
[[ "$anon_accounts_select" == "f" ]] || { echo "anon unexpectedly gained public.accounts SELECT" >&2; exit 1; }
[[ "$anon_private_usage" == "f" ]] || { echo "anon unexpectedly gained private schema usage" >&2; exit 1; }
[[ "$dump_sha256" =~ ^[a-f0-9]{64}$ ]] || { echo "Backup SHA-256 is invalid" >&2; exit 1; }
[[ "$dump_bytes" -gt 0 ]] || { echo "Backup is empty" >&2; exit 1; }

mkdir -p "$(dirname "$evidence_path")"
{
  echo "product=AR Photo"
  echo "rehearsal=local-supabase-full-backup-restore"
  echo "source_database=$source_database"
  echo "restore_database=$restore_database"
  echo "migration_count=$migration_count"
  echo "synthetic_account_count=$account_count"
  echo "accounts_rls=$accounts_rls"
  echo "anon_accounts_select=$anon_accounts_select"
  echo "anon_private_usage=$anon_private_usage"
  echo "dump_bytes=$dump_bytes"
  echo "dump_sha256=$dump_sha256"
} > "$evidence_path"

echo "Local Supabase backup/restore rehearsal passed; sanitized evidence written to $evidence_path."
