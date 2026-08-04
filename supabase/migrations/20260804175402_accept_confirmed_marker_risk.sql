-- Persist the user's explicit weak-marker acceptance before the asynchronous
-- server analysis completes. Compilation still waits for a successful analysis,
-- but it no longer asks for the same confirmation twice.
create or replace function public.override_marker_quality(
  p_target_account_id uuid,
  p_item_id uuid,
  p_reason text
)
returns public.ar_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_item public.ar_items;
begin
  if not (select private.can_write_account(p_target_account_id)) then
    raise exception 'Account write access required' using errcode = '42501';
  end if;
  if char_length(trim(coalesce(p_reason, ''))) not between 10 and 500 then
    raise exception 'Override reason must contain 10 to 500 characters' using errcode = '22023';
  end if;

  select i.* into target_item
  from public.ar_items i
  where i.id = p_item_id
    and i.account_id = p_target_account_id
    and i.deleted_at is null
  for update;
  if not found then
    raise exception 'AR item not found' using errcode = '23503';
  end if;
  if target_item.marker_quality_score is not null
    and target_item.marker_quality_score >= 60
  then
    raise exception 'Marker quality override is not required' using errcode = '55000';
  end if;

  update public.ar_items
  set marker_quality_overridden_at = statement_timestamp(),
      marker_quality_overridden_by = (select auth.uid()),
      marker_quality_override_reason = trim(p_reason),
      status = 'processing',
      tracking_status = case
        when marker_quality_score is null then tracking_status
        else 'analyzing'::public.tracking_status
      end
  where id = target_item.id
  returning * into target_item;

  return target_item;
end;
$$;

revoke all on function public.override_marker_quality(uuid, uuid, text)
from public, anon, authenticated;
grant execute on function public.override_marker_quality(uuid, uuid, text) to authenticated;
