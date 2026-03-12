-- Add description column if it doesn't exist
alter table tasks add column if not exists description text;

-- Add INSERT policies for plans, phases, and tasks
-- This ensures authenticated users with @rukisha.co.rw emails can create new records

create policy "rukisha insert plans"
  on plans for insert
  with check (auth.email() like '%@rukisha.co.rw');

create policy "rukisha insert phases"
  on phases for insert
  with check (auth.email() like '%@rukisha.co.rw');

create policy "rukisha insert tasks"
  on tasks for insert
  with check (auth.email() like '%@rukisha.co.rw');

-- Also add a policy for task_comments if missing
create policy "rukisha insert comments"
  on task_comments for insert
  with check (auth.email() like '%@rukisha.co.rw');

create policy "rukisha read comments"
  on task_comments for select
  using (auth.email() like '%@rukisha.co.rw');
