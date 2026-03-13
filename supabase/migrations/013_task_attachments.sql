-- Migration 013: Task attachments
create table if not exists task_attachments (
  id           uuid primary key default gen_random_uuid(),
  task_id      text references tasks(id) on delete cascade not null,
  name         text not null,          -- original filename
  storage_path text not null,          -- path inside the 'task-attachments' bucket
  size         bigint,                 -- bytes
  mime_type    text,
  uploaded_by  uuid references auth.users(id),
  created_at   timestamptz default now()
);

alter table task_attachments enable row level security;

create policy "authenticated_users_all" on task_attachments
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Storage bucket ──────────────────────────────────────────────────────────
-- Run this separately in the Supabase dashboard > Storage, or via the API:
--
-- insert into storage.buckets (id, name, public)
-- values ('task-attachments', 'task-attachments', false)
-- on conflict (id) do nothing;
--
-- create policy "authenticated upload" on storage.objects
--   for insert to authenticated
--   with check (bucket_id = 'task-attachments');
--
-- create policy "authenticated read" on storage.objects
--   for select to authenticated
--   using (bucket_id = 'task-attachments');
--
-- create policy "authenticated delete" on storage.objects
--   for delete to authenticated
--   using (bucket_id = 'task-attachments');
