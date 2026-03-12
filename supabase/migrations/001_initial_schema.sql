-- Rukisha Project Tracker — Initial Schema
-- Run this in your Supabase SQL editor

create extension if not exists "pgcrypto";

-- ── Plans ────────────────────────────────────────────────────────────────────
create table if not exists plans (
  id text primary key,
  name text not null,
  type text not null check (type in ('tech', 'operational')),
  created_at timestamptz default now()
);

-- ── Phases ───────────────────────────────────────────────────────────────────
create table if not exists phases (
  id text primary key,
  plan_id text not null references plans(id) on delete cascade,
  wbs text not null,
  name text not null,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- ── Tasks ────────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id text primary key,
  phase_id text not null references phases(id) on delete cascade,
  wbs text not null,
  name text not null,
  owner text,
  start_day int,
  end_day int,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','completed','blocked','not_applicable')),
  remarks text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Updated-at trigger ───────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();

-- ── Row-level security (allow all for anon — tighten for production) ─────────
alter table plans  enable row level security;
alter table phases enable row level security;
alter table tasks  enable row level security;

create policy "public read plans"  on plans  for select using (true);
create policy "public read phases" on phases for select using (true);
create policy "public read tasks"  on tasks  for select using (true);
create policy "public update tasks" on tasks for update using (true);

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists idx_phases_plan_id on phases(plan_id);
create index if not exists idx_tasks_phase_id on tasks(phase_id);
create index if not exists idx_tasks_status    on tasks(status);
