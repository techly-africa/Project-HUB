-- Auth-based RLS — run after 001_initial_schema.sql
-- Only @rukisha.co.rw email addresses can read or write

-- Drop open policies from migration 001
drop policy if exists "public read plans"  on plans;
drop policy if exists "public read phases" on phases;
drop policy if exists "public read tasks"  on tasks;
drop policy if exists "public update tasks" on tasks;

-- Re-create with domain check
create policy "rukisha read plans"
  on plans for select
  using (auth.email() like '%@rukisha.co.rw');

create policy "rukisha read phases"
  on phases for select
  using (auth.email() like '%@rukisha.co.rw');

create policy "rukisha read tasks"
  on tasks for select
  using (auth.email() like '%@rukisha.co.rw');

create policy "rukisha update tasks"
  on tasks for update
  using  (auth.email() like '%@rukisha.co.rw')
  with check (auth.email() like '%@rukisha.co.rw');

-- Also allow Supabase service role full access for seeding
-- (the service role bypasses RLS, so no explicit policy needed)
