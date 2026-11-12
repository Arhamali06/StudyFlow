create or replace function public.clear_all_data()
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
