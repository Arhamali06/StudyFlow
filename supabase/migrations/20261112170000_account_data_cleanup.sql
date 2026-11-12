create or replace function public.clear_my_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'Authentication is required';
  end if;

  delete from public.tasks
  where tasks.user_id = current_user_id;

  delete from public.subjects
  where subjects.user_id = current_user_id;
end;
$$;

revoke all on function public.clear_my_data() from public, anon;
grant execute on function public.clear_my_data() to authenticated;
