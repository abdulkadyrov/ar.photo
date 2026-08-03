-- Supabase may provision this SECURITY DEFINER helper on hosted projects.
-- It is not part of the AR Photo API and must never be callable through PostgREST.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
