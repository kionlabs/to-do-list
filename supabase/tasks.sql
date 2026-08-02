create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'Not Started'
    check (status in ('Not Started', 'In Progress', 'Completed')),
  priority text not null default 'Moderate'
    check (priority in ('Low', 'Moderate', 'High', 'Vital')),
  category text default 'Personal',
  due_date date,
  image_url text,
  is_vital boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_created_at_idx
on public.tasks (user_id, created_at desc);

alter table public.tasks enable row level security;

drop policy if exists "Users can read own tasks" on public.tasks;
create policy "Users can read own tasks"
on public.tasks
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks"
on public.tasks
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks"
on public.tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can delete own tasks"
on public.tasks
for delete
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();
