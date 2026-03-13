-- Migration 011: Add projects table and link plans to projects
-- Supports multiple projects, each with flexible custom plans.

-- ─── Projects table ───────────────────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

-- ─── Extend plans ─────────────────────────────────────────────────────────────
alter table plans add column if not exists project_id uuid references projects(id) on delete cascade;
alter table plans add column if not exists color text not null default 'bg-brand-blue';

-- ─── Seed default project for existing data ──────────────────────────────────
insert into projects (id, name, description) values
  ('00000000-0000-0000-0000-000000000001',
   'Rukisha Merchant Lending',
   'MTN Rwanda × I&M Bank Rwanda × Panamax · Target: Mid-May 2026')
on conflict (id) do nothing;

-- ─── Link existing plans to default project ──────────────────────────────────
update plans set
  project_id = '00000000-0000-0000-0000-000000000001',
  color = case type
    when 'product-tech' then 'bg-brand-blue'
    when 'legal'        then 'bg-amber-500'
    else                     'bg-brand-pink'
  end
where project_id is null;

-- ─── Enforce project_id non-null going forward ───────────────────────────────
alter table plans alter column project_id set not null;

-- ─── RLS for projects ─────────────────────────────────────────────────────────
alter table projects enable row level security;

create policy "rukisha_members_all" on projects
  using  (auth.jwt() ->> 'email' like '%@rukisha.co.rw')
  with check (auth.jwt() ->> 'email' like '%@rukisha.co.rw');
