-- Next Play Games assessment schema — run in Supabase SQL Editor
-- Enable Anonymous sign-in: Authentication → Providers → Anonymous → ON

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null check (status in ('todo', 'in_progress', 'in_review', 'done')),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  description text,
  priority text default 'normal' check (priority in ('low', 'normal', 'high')),
  due_date date,
  assignee_id uuid
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_status_idx on public.tasks (user_id, status);

alter table public.tasks enable row level security;

-- Owner is always the signed-in user (including anonymous)
create or replace function public.set_task_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_tasks_set_owner on public.tasks;
create trigger trg_tasks_set_owner
  before insert on public.tasks
  for each row
  execute function public.set_task_owner();

create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Optional realtime: Dashboard → Database → Publications → supabase_realtime → enable `tasks`
