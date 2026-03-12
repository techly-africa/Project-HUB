-- Migration 009: Fix Deletion and Dependency Cleanup
-- 1. Add DELETE policies for all main tables
create policy "rukisha delete plans" on plans for delete using (auth.email() like '%@rukisha.co.rw');
create policy "rukisha delete phases" on phases for delete using (auth.email() like '%@rukisha.co.rw');
create policy "rukisha delete tasks" on tasks for delete using (auth.email() like '%@rukisha.co.rw');
create policy "rukisha delete comments" on task_comments for delete using (auth.email() like '%@rukisha.co.rw');

-- 2. Create function to cleanup dependencies
create or replace function cleanup_task_dependencies()
returns trigger as $$
begin
  -- Remove the deleted task ID from any blocked_by arrays that contain it
  update tasks
  set 
    blocked_by = blocked_by - OLD.id,
    -- If the task was blocked only by this one, we might want to update status
    -- but setting status is tricky without checking current length.
    -- We can do a second pass or check length in the update.
    updated_at = now()
  where blocked_by ? OLD.id;
  
  -- Secondary pass to fix status for tasks that are no longer blocked
  update tasks
  set status = 'not_started'
  where status = 'blocked' 
    and (blocked_by = '[]'::jsonb or blocked_by is null);

  return OLD;
end;
$$ language plpgsql;

-- 3. Create the trigger
drop trigger if exists trigger_cleanup_task_dependencies on tasks;
create trigger trigger_cleanup_task_dependencies
  after delete on tasks
  for each row
  execute function cleanup_task_dependencies();
