create or replace function public.claim_owner_admin() returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if lower(coalesce(auth.jwt()->>'email','')) = 'mdmoinuddinahmed07@gmail.com' then
    insert into public.user_roles(user_id, role) values (auth.uid(),'admin') on conflict do nothing;
  end if;
  return public.has_role(auth.uid(),'admin');
end $$;
revoke execute on function public.claim_owner_admin() from anon, public;
grant execute on function public.claim_owner_admin() to authenticated;