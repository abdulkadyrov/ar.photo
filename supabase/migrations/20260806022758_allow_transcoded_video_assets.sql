-- A source upload and its server-generated replacement intentionally share the
-- same group, media kind and revision. The former unique index also prevented
-- separate AR items in one group from using the same revision number.
drop index if exists public.media_assets_group_kind_version_idx;

create index media_assets_group_kind_version_idx
on public.media_assets(account_id, group_id, kind, version)
where group_id is not null and deleted_at is null and kind in ('marker', 'video');
