-- Migration 007: Update Workstream Types and Fix Constraints
-- This migration updates the 'plans' table and relaxes type constraints.

-- 1. Drop the old check constraint on plans.type
-- Note: PostgreSQL auto-generates names like 'plans_type_check'
alter table plans drop constraint if exists plans_type_check;

-- 2. Add the new expanded check constraint or just keep it open for future expansion
-- To balance safety and flexibility, we'll allow the 3 new types.
alter table plans add constraint plans_type_check 
  check (type in ('product-tech', 'legal', 'biz-dev', 'tech', 'operational'));

-- 3. Update tasks status constraint to include 'critical'
alter table tasks drop constraint if exists tasks_status_check;
alter table tasks add constraint tasks_status_check 
  check (status in ('not_started','in_progress','completed','blocked','not_applicable','critical'));

-- 4. Create/Update the 3 new plans
insert into plans (id, name, type) values
  ('plan-product-tech', 'Product & Technology', 'product-tech'),
  ('plan-legal', 'Legal', 'legal'),
  ('plan-biz-dev', 'Business Development', 'biz-dev')
on conflict (id) do update set name = excluded.name, type = excluded.type;

-- 5. Migrate any existing phases/tasks
update phases set plan_id = 'plan-product-tech' where plan_id = 'plan-tech';
update phases set plan_id = 'plan-biz-dev' where plan_id = 'plan-ops';

-- 6. Clean up old plans
delete from plans where id in ('plan-tech', 'plan-ops');

-- 7. Ensure default phases exist
insert into phases (id, plan_id, wbs, name, display_order) values
  ('ph-t0','plan-product-tech','0','Initiation & Governance',0),
  ('ph-l0','plan-legal','L0','Legal Readiness',0),
  ('ph-b0','plan-biz-dev','B0','Operational Readiness',0)
on conflict (id) do nothing;
