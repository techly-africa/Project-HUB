-- Rukisha Project Tracker — Seed Data (aligned with March 2026 status)
-- Run AFTER migrations

-- Plans
insert into plans (id, name, type) values
  ('plan-product-tech', 'Product & Technology', 'product-tech'),
  ('plan-legal', 'Legal', 'legal'),
  ('plan-biz-dev', 'Business Development', 'biz-dev')
on conflict (id) do update set name = excluded.name, type = excluded.type;

-- ── Product & Tech Phases ───────────────────────────────────────────────────────────
insert into phases (id, plan_id, wbs, name, display_order) values
  ('ph-t0','plan-product-tech','0','Initiation, Governance & Procurement',0),
  ('ph-t1','plan-product-tech','1','Infrastructure Setup',1),
  ('ph-t2','plan-product-tech','2','Kick-off & Governance',2),
  ('ph-t3','plan-product-tech','3','Requirements & Planning',3),
  ('ph-t4','plan-product-tech','4','Development & Configuration',4),
  ('ph-t5','plan-product-tech','5','Training & UAT',5),
  ('ph-t6','plan-product-tech','6','Go Live & Post-Launch',6),
  ('ph-t7','plan-product-tech','7','Marketing & GTM',7)
on conflict (id) do update set plan_id = excluded.plan_id;

-- ── Legal Phases ──────────────────────────────────────────────────────────────────
insert into phases (id, plan_id, wbs, name, display_order) values
  ('ph-l0','plan-legal','L0','Legal & Contractual Readiness',0),
  ('ph-l1','plan-legal','L1','Regulatory & Governance',1),
  ('ph-l2','plan-legal','L2','Risk & Compliance',2)
on conflict (id) do update set plan_id = excluded.plan_id;

-- ── Business Dev Phases ───────────────────────────────────────────────────────────
insert into phases (id, plan_id, wbs, name, display_order) values
  ('ph-b0','plan-biz-dev','B0','People & Operational Readiness',0),
  ('ph-b1','plan-biz-dev','B1','Reconciliation & Finance',1),
  ('ph-b2','plan-biz-dev','B2','Marketing & Go-to-Market',2)
on conflict (id) do update set plan_id = excluded.plan_id;

-- ── Product & Tech Tasks ───────────────────────────────────────────────────────────────
insert into tasks (id,phase_id,wbs,name,owner,start_date,end_date,deadline,status,description) values
('t-0-1','ph-t0','0.1','Preliminary Alignment & Partner Introductions','All Partners','2026-03-02','2026-03-04','2026-03-04','completed','Initial alignment underway across MTN, I&M Bank and Rukisha'),
('t-0-2','ph-t0','0.2','Stakeholder Business Requirements Gathering','I&M Bank + Rukisha','2026-03-02','2026-03-06','2026-03-06','in_progress','Requirements gathering in progress; FSD/LLD review ongoing'),
('t-0-3','ph-t0','0.3','Master Services Agreement Draft & Review','I&M Bank + Rukisha + Panamax','2026-03-02','2026-03-12','2026-03-12','not_started','MTN contract pending; I&M Bank scope contract pending'),
('t-4-1','ph-t4','4.1','Core LOS & LMS Development','Panamax','2026-03-19','2026-06-12','2026-06-12','blocked','BLOCKED: Panamax contract must be signed before development can commence — critical path item'),
('t-4-2','ph-t4','4.2','Scorecard & Workflow Configuration','Panamax + Rukisha','2026-03-20','2026-04-10','2026-04-10','in_progress',null);

-- ── Legal Tasks ──────────────────────────────────────────────────────────────────
insert into tasks (id,phase_id,wbs,name,owner,start_date,end_date,deadline,status,description) values
('l-0-1','ph-l0','0.1','Finalize NDAs (Tripartite & Bilateral)','All Partners','2026-03-02','2026-03-05','2026-03-05','completed',null),
('l-0-2','ph-l0','0.2','Master Services Agreement Sign-off','Rukisha + Panamax','2026-03-02','2026-03-11','2026-03-11','in_progress',null),
('l-1-1','ph-l1','1.1','BNR Digital Lending Compliance Review','Rukisha + I&M Bank','2026-03-02','2026-03-16','2026-03-16','in_progress','Product operates under I&M Bank''s lending licence');

-- ── Business Dev Tasks ───────────────────────────────────────────────────────────
insert into tasks (id,phase_id,wbs,name,owner,start_date,end_date,deadline,status,description) values
('b-0-1','ph-b0','B0.1','Office Space Setup','Rukisha','2026-03-02','2026-03-21','2026-03-21','not_started',null),
('b-2-1','ph-b2','B2.1','Hire Marketing Agency','Rukisha','2026-03-11','2026-03-21','2026-03-21','not_started',null);
