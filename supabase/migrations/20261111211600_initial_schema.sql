-- StudyFlow initial user data schema.
-- This migration intentionally excludes sample-data columns and functionality.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'Student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_check
    check (
      full_name = btrim(full_name)
      and char_length(full_name) between 1 and 40
    )
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjects_id_user_id_key unique (id, user_id),
  constraint subjects_name_check
    check (
      name = btrim(name)
      and char_length(name) between 1 and 40
    ),
  constraint subjects_color_check
    check (color ~ '^#[0-9A-Fa-f]{6}$')
);

create unique index subjects_user_name_unique
  on public.subjects (user_id, lower(name));

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid not null,
  title text not null,
  description text not null default '',
  type text not null,
  due_date date not null,
  priority text not null,
  status text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint tasks_subject_owner_fkey
    foreign key (subject_id, user_id)
    references public.subjects (id, user_id)
    on delete no action,
  constraint tasks_title_check
    check (
      title = btrim(title)
      and char_length(title) between 1 and 100
    ),
  constraint tasks_description_check
    check (
      description = btrim(description)
      and char_length(description) <= 500
    ),
  constraint tasks_type_check
    check (type in ('assignment', 'quiz', 'exam', 'revision', 'other')),
  constraint tasks_priority_check
    check (priority in ('low', 'medium', 'high')),
  constraint tasks_status_check
    check (status in ('pending', 'completed')),
  constraint tasks_completion_consistency_check
    check ((status = 'completed') = (completed_at is not null))
);

create index subjects_user_id_idx on public.subjects (user_id);
create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_subject_id_idx on public.tasks (subject_id);
create index tasks_user_due_date_idx on public.tasks (user_id, due_date);
create index tasks_user_status_idx on public.tasks (user_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger subjects_set_updated_at
before update on public.subjects
for each row
execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
begin
  requested_name := nullif(
    btrim(new.raw_user_meta_data ->> 'full_name'),
    ''
  );

  insert into public.profiles (id, full_name)
  values (new.id, btrim(left(coalesce(requested_name, 'Student'), 40)))
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into public.profiles (id, full_name)
select
  users.id,
  btrim(left(
    coalesce(
      nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
      'Student'
    ),
    40
  ))
from auth.users as users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.tasks enable row level security;

revoke all on table public.profiles, public.subjects, public.tasks from public, anon;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;
grant select, insert, update, delete on table public.subjects, public.tasks to authenticated;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy subjects_select_own
on public.subjects
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy subjects_insert_own
on public.subjects
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy subjects_update_own
on public.subjects
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy subjects_delete_own
on public.subjects
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy tasks_select_own
on public.tasks
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy tasks_insert_own
on public.tasks
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy tasks_update_own
on public.tasks
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy tasks_delete_own
on public.tasks
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.delete_subject(
  p_subject_id uuid,
  p_move_to uuid default null
)
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

  if p_subject_id is null then
    raise exception using
      errcode = '22004',
      message = 'Subject id is required';
  end if;

  perform 1
  from public.subjects as source_subject
  where source_subject.id = p_subject_id
    and source_subject.user_id = current_user_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Subject not found';
  end if;

  if p_move_to is not null then
    if p_move_to = p_subject_id then
      raise exception using
        errcode = '22023',
        message = 'A subject cannot be moved to itself';
    end if;

    perform 1
    from public.subjects as target_subject
    where target_subject.id = p_move_to
      and target_subject.user_id = current_user_id
    for update;

    if not found then
      raise exception using
        errcode = 'P0002',
        message = 'Target subject not found';
    end if;

    update public.tasks
    set subject_id = p_move_to
    where tasks.subject_id = p_subject_id
      and tasks.user_id = current_user_id;
  else
    delete from public.tasks
    where tasks.subject_id = p_subject_id
      and tasks.user_id = current_user_id;
  end if;

  delete from public.subjects
  where subjects.id = p_subject_id
    and subjects.user_id = current_user_id;
end;
$$;

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

  update public.profiles
  set full_name = 'Student'
  where profiles.id = current_user_id;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.delete_subject(uuid, uuid) from public, anon;
revoke all on function public.clear_all_data() from public, anon;
grant execute on function public.delete_subject(uuid, uuid) to authenticated;
grant execute on function public.clear_all_data() to authenticated;
