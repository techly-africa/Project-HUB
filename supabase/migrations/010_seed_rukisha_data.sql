-- Migration 010: Seed Rukisha Merchant Lending Project Data
-- Project  : Rukisha Merchant Lending
-- Schedule : Compressed — Target Go Live: Mid-May 2026
-- Day One  : 2026-03-17  |  Generated: 2026-03-12
-- Schema   : 008
-- NOTE: Run AFTER migrations 001–009.
-- NOTE: BD-4.4+ tasks were truncated from source — add them manually.

-- ─── Remove legacy placeholder data ──────────────────────────────────────────
delete from tasks  where phase_id in (select id from phases where plan_id in ('tech-v1','ops-v1'));
delete from phases where plan_id   in ('tech-v1','ops-v1');
delete from plans  where id        in ('tech-v1','ops-v1');

-- Remove migration-007 placeholder phases (ph-t0, ph-l0, ph-b0)
delete from tasks  where phase_id in ('ph-t0','ph-l0','ph-b0');
delete from phases where id        in ('ph-t0','ph-l0','ph-b0');

-- ─── Plans ────────────────────────────────────────────────────────────────────
insert into plans (id, name, type, created_at) values
  ('plan-product-tech', 'Product & Tech',       'product-tech', '2026-03-12 00:00:00+00'),
  ('plan-legal',        'Legal',                'legal',        '2026-03-12 00:00:00+00'),
  ('plan-biz-dev',      'Business Development', 'biz-dev',      '2026-03-12 00:00:00+00')
on conflict (id) do update set
  name = excluded.name,
  type = excluded.type;

-- ─── Phases ───────────────────────────────────────────────────────────────────
insert into phases (id, plan_id, wbs, name, display_order, created_at) values
  ('phase-pt-infra',        'plan-product-tech', 'PT-1', 'Infrastructure & Environment',     1, '2026-03-12 00:00:00+00'),
  ('phase-pt-requirements', 'plan-product-tech', 'PT-2', 'Requirements & Architecture',      2, '2026-03-12 00:00:00+00'),
  ('phase-pt-development',  'plan-product-tech', 'PT-3', 'Development & Configuration',      3, '2026-03-12 00:00:00+00'),
  ('phase-pt-integration',  'plan-product-tech', 'PT-4', 'Integration, QA & Reconciliation', 4, '2026-03-12 00:00:00+00'),
  ('phase-pt-uat-golive',   'plan-product-tech', 'PT-5', 'Training, UAT & Go Live',          5, '2026-03-12 00:00:00+00'),
  ('phase-lg-contracts',    'plan-legal',        'LG-1', 'Agreements & Contracts',           1, '2026-03-12 00:00:00+00'),
  ('phase-lg-regulatory',   'plan-legal',        'LG-2', 'Regulatory Compliance',            2, '2026-03-12 00:00:00+00'),
  ('phase-lg-risk',         'plan-legal',        'LG-3', 'Risk Policies, T&Cs & Reporting',  3, '2026-03-12 00:00:00+00'),
  ('phase-bd-governance',   'plan-biz-dev',      'BD-1', 'Governance & Commercial',          1, '2026-03-12 00:00:00+00'),
  ('phase-bd-product-brand','plan-biz-dev',      'BD-2', 'Product & Brand',                  2, '2026-03-12 00:00:00+00'),
  ('phase-bd-people-ops',   'plan-biz-dev',      'BD-3', 'People & Operational Readiness',   3, '2026-03-12 00:00:00+00'),
  ('phase-bd-marketing',    'plan-biz-dev',      'BD-4', 'Marketing & Go-to-Market',         4, '2026-03-12 00:00:00+00')
on conflict (id) do update set
  plan_id       = excluded.plan_id,
  wbs           = excluded.wbs,
  name          = excluded.name,
  display_order = excluded.display_order;

-- ─── Tasks ────────────────────────────────────────────────────────────────────
-- Columns: id, phase_id, wbs, name, owner, status, description, remarks,
--          start_date, end_date, start_day, end_day, deadline,
--          assigned_to, blocked_by, created_at, updated_at

insert into tasks (
  id, phase_id, wbs, name, owner, status, description, remarks,
  start_date, end_date, start_day, end_day, deadline,
  assigned_to, blocked_by, created_at, updated_at
) values

-- ── PT-1: Infrastructure & Environment ───────────────────────────────────────
(
  'task-pt-cloud-infra', 'phase-pt-infra', 'PT-1.1',
  'Cloud/Hosted Infrastructure Provisioning', 'Hosting Vendor', 'critical',
  'Provision cloud or hosted server environment to replace physical hardware procurement. Selection between MTN data centre, AOS, and cloud options (AWS/GCP) must be finalised immediately. Target Day 10 completion to unblock dev environment setup and stay on compressed schedule.',
  '[A1] MTN & AOS proposals still outstanding. Cloud fallback must be decided this week.',
  '2026-03-18 00:00:00+00', '2026-03-26 00:00:00+00', 2, 10,
  '2026-03-26 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-dev-env-setup', 'phase-pt-infra', 'PT-1.2',
  'Dev Environment Setup (Cloud)', 'Panamax', 'not_started',
  'Configure full development environment on provisioned cloud infrastructure. Includes database setup (PostgreSQL), application server configuration, CI/CD pipeline, version control integration, and access provisioning for all Panamax developers.',
  '',
  '2026-03-21 00:00:00+00', '2026-03-26 00:00:00+00', 5, 10,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-dev-env-validation', 'phase-pt-infra', 'PT-1.3',
  'Development Environment Validation', 'Panamax', 'not_started',
  'Validate that the development environment is fully operational. Run smoke tests, confirm all services are reachable, and sign off that the Panamax team can begin active development. Rukisha tech lead to co-sign validation.',
  '',
  '2026-03-27 00:00:00+00', '2026-03-28 00:00:00+00', 11, 12,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-prod-env', 'phase-pt-infra', 'PT-1.4',
  'Production Environment — Cloud [A4]', 'Hosting Vendor', 'critical',
  'Provision production-grade cloud environment in parallel with development — not sequentially. Must mirror dev environment specifications with production-level security, backups, and monitoring configured. Ready before system integration testing on Day 40.',
  '[A4] Parallel provisioning saves ~28 days vs. sequential hardware approach.',
  '2026-03-26 00:00:00+00', '2026-03-31 00:00:00+00', 10, 15,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── PT-2: Requirements & Architecture ────────────────────────────────────────
(
  'task-pt-biz-reqs', 'phase-pt-requirements', 'PT-2.1',
  'Stakeholder Business Requirements Gathering', 'I&M Bank + Rukisha', 'in_progress',
  'Gather and document detailed business requirements from I&M Bank and Rukisha stakeholders. Covers merchant loan origination flow, credit decisioning rules, disbursement via MTN MoMo, repayment collection, delinquency handling, reporting, and I&M Bank back-office integration needs.',
  '',
  '2026-03-17 00:00:00+00', '2026-03-19 00:00:00+00', 1, 3,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-fsd-review', 'phase-pt-requirements', 'PT-2.2',
  'FSD / LLD Technical Review', 'Technical Team', 'in_progress',
  'Review and validate the Functional Specification Document (FSD) and Low-Level Design (LLD) prepared by Panamax. Confirm alignment with Rukisha and I&M requirements, identify gaps, and agree on any changes before sign-off gates development start.',
  '',
  '2026-03-21 00:00:00+00', '2026-03-24 00:00:00+00', 5, 8,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-im-integration-arch', 'phase-pt-requirements', 'PT-2.3',
  'I&M Bank Direct Integration Architecture', 'Technical + I&M', 'not_started',
  'Define the technical architecture for direct integration between the LOS/LMS platform and I&M Bank''s core banking system. Specify API contracts, authentication model, data schemas for account creation, disbursement triggers, repayment postings, and real-time balance queries.',
  '',
  '2026-03-24 00:00:00+00', '2026-03-28 00:00:00+00', 8, 12,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-fsd-signoff', 'phase-pt-requirements', 'PT-2.4',
  'FSD Sign-off', 'Rukisha', 'not_started',
  'Formal Rukisha sign-off on the FSD confirming all functional requirements are captured, agreed, and ready for development. This is a hard gate — development cannot proceed without written sign-off from Rukisha leadership.',
  '',
  '2026-03-28 00:00:00+00', '2026-03-28 00:00:00+00', 12, 12,
  '2026-03-28 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── PT-3: Development & Configuration ────────────────────────────────────────
(
  'task-pt-core-los-lms', 'phase-pt-development', 'PT-3.1',
  'Core LOS & LMS Development [A2][A3]', 'Panamax', 'critical',
  'Full development of the Loan Origination System (LOS) and Loan Management System (LMS). Covers merchant onboarding and KYB, loan application workflow, automated credit decisioning using TransUnion bureau + internal scorecard, MTN MoMo disbursement integration, repayment collection, delinquency management, and I&M Bank core banking reconciliation. Compressed to 35 days — requires full dedicated Panamax team with no parallel engagements.',
  '[A2] BLOCKED until Panamax contract signed (target Day 3). [A3] 35-day sprint assumes full Panamax team.',
  '2026-03-26 00:00:00+00', '2026-04-30 00:00:00+00', 10, 45,
  '2026-04-30 00:00:00+00', null, '["task-lg-panamax-contract"]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-scorecard', 'phase-pt-development', 'PT-3.2',
  'Scorecard & Workflow Configuration', 'Panamax + Rukisha', 'in_progress',
  'Configure credit scoring model, loan approval workflows, and automated decisioning rules within the LMS. Based on NPL framework, credit bands, and risk appetite to be defined in parallel by the Legal/Risk workstream. Rukisha credit team to review and approve all rules.',
  '',
  '2026-03-26 00:00:00+00', '2026-04-02 00:00:00+00', 10, 17,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-transunion-integration', 'phase-pt-development', 'PT-3.3',
  'TransUnion Bureau Integration', 'Rukisha + Panamax', 'not_started',
  'Build and test integration with TransUnion Rwanda credit bureau API for real-time credit checks during loan origination. Covers API connection, request/response handling, score parsing, and bureau data storage. Cannot start until TransUnion contract is signed.',
  'Awaiting Rukisha response to TransUnion bureau proposal.',
  '2026-03-30 00:00:00+00', '2026-04-07 00:00:00+00', 14, 22,
  null, null, '["task-lg-transunion-contract"]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── PT-4: Integration, QA & Reconciliation ───────────────────────────────────
(
  'task-pt-system-integration-qa', 'phase-pt-integration', 'PT-4.1',
  'System Integration, QA & Deployment', 'Panamax + Rukisha + I&M + MTN', 'not_started',
  'End-to-end integration testing across all system components: LOS/LMS, I&M Bank core banking, MTN MoMo disbursement and collection APIs, and TransUnion bureau. Covers full happy-path and edge-case scenarios, performance testing under load, and preparation of detailed UAT test scripts for Day 50.',
  '',
  '2026-04-25 00:00:00+00', '2026-05-05 00:00:00+00', 40, 50,
  null, null, '["task-pt-core-los-lms"]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-recon-workflows', 'phase-pt-integration', 'PT-4.2',
  'Setup Reconciliation Workflows', 'Panamax + Rukisha', 'not_started',
  'Build automated daily reconciliation workflows comparing LMS loan ledger records against I&M Bank disbursement confirmations and MTN MoMo settlement reports. Include exception flagging, manual override process, and finance team dashboard.',
  '',
  '2026-04-23 00:00:00+00', '2026-04-29 00:00:00+00', 38, 44,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-settlement-ledger', 'phase-pt-integration', 'PT-4.3',
  'Settlement Ledger Design', 'Panamax + Rukisha', 'not_started',
  'Design and implement the settlement ledger structure for tracking all financial flows: principal disbursements, interest accruals, facility fee allocations, repayment postings, MTN float deductions, I&M Bank settlements, and Rukisha revenue share calculations.',
  '',
  '2026-04-29 00:00:00+00', '2026-05-05 00:00:00+00', 44, 50,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── PT-5: Training, UAT & Go Live ────────────────────────────────────────────
(
  'task-pt-training', 'phase-pt-uat-golive', 'PT-5.1',
  'Training & Knowledge Transfer', 'Panamax + Rukisha', 'not_started',
  'Formal training for Rukisha operations team and I&M Bank staff on system use, user management, daily monitoring, exception handling, and reporting. Panamax to deliver training materials and recorded walkthroughs for ongoing reference.',
  '',
  '2026-05-03 00:00:00+00', '2026-05-05 00:00:00+00', 48, 50,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-ops-training', 'phase-pt-uat-golive', 'PT-5.2',
  'Operations Team Training [A5]', 'Panamax + Rukisha', 'not_started',
  'Dedicated operational training session covering reconciliation processes, delinquency escalation procedures, customer support workflows, and daily system health checks. Runs concurrently with technical training to maximise time efficiency.',
  '',
  '2026-05-03 00:00:00+00', '2026-05-05 00:00:00+00', 48, 50,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-uat', 'phase-pt-uat-golive', 'PT-5.3',
  'User Acceptance Testing (UAT) [A5]', 'Rukisha + I&M + Panamax', 'critical',
  'Compressed 5-day UAT covering all critical user journeys: merchant onboarding, loan application, bureau check, credit decision, MTN MoMo disbursement, repayment collection, early settlement, and delinquency handling. Pre-agreed test scripts mandatory before Day 50. No discovery testing permitted.',
  '[A5] All test scripts must be prepared and agreed by all three parties before Day 50.',
  '2026-05-05 00:00:00+00', '2026-05-10 00:00:00+00', 50, 55,
  '2026-05-10 00:00:00+00', null, '["task-pt-system-integration-qa"]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-uat-signoff', 'phase-pt-uat-golive', 'PT-5.4',
  'Stakeholder UAT Review & Sign-off', 'Rukisha', 'not_started',
  'Formal sign-off from Rukisha and I&M Bank confirming UAT is complete, all critical and high-severity defects are resolved, and the system is approved for production deployment. Written sign-off required from both parties.',
  '',
  '2026-05-11 00:00:00+00', '2026-05-11 00:00:00+00', 56, 56,
  '2026-05-11 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-prod-deploy', 'phase-pt-uat-golive', 'PT-5.5',
  'Production Deployment & Migration', 'Panamax', 'not_started',
  'Migrate validated system build to production environment. Final configuration hardening, data migration (reference data, scorecard parameters), SSL certificate installation, MTN MoMo production API keys, I&M Bank production credentials, and go-live readiness checklist.',
  '',
  '2026-05-12 00:00:00+00', '2026-05-13 00:00:00+00', 57, 58,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-go-live', 'phase-pt-uat-golive', 'PT-5.6',
  'GO LIVE — Target Mid-May 2026', 'Panamax + Rukisha', 'completed',
  'Commercial launch of the Rukisha merchant lending product. First loan applications opened to merchants. MTN MoMo disbursement live. I&M Bank lending book active. Operations team on standby. Panamax hypercare begins.',
  'Target: mid-May 2026. All 6 compression assumptions [A1–A6] must hold.',
  '2026-05-14 00:00:00+00', '2026-05-15 00:00:00+00', 59, 60,
  '2026-05-15 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-pt-hypercare', 'phase-pt-uat-golive', 'PT-5.7',
  'Hypercare & Early Merchant Support', 'Panamax + Rukisha', 'not_started',
  'Intensive 15-day post-launch support with Panamax engineers on standby. Monitor system performance, resolve any production issues within SLA, support first wave of merchant borrowers through onboarding, and capture lessons learned for product iteration.',
  '',
  '2026-05-15 00:00:00+00', '2026-05-30 00:00:00+00', 60, 75,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── LG-1: Agreements & Contracts ─────────────────────────────────────────────
(
  'task-lg-panamax-contract', 'phase-lg-contracts', 'LG-1.1',
  'Sign Panamax Development Contract [A2]', 'Rukisha + Panamax', 'critical',
  'Execute development contract with Panamax covering full scope of LOS/LMS build, deliverable milestones, payment schedule (tied to milestone delivery), IP assignment to Rukisha, source code escrow, penalty clauses for delays, and dedicated team commitment. This is the single most critical action item — every day of delay directly delays Go Live.',
  'CRITICAL PATH. Must be signed by Day 3. Escalate to CEO level if needed.',
  '2026-03-17 00:00:00+00', '2026-03-19 00:00:00+00', 1, 3,
  '2026-03-19 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-lg-nda-tripartite', 'phase-lg-contracts', 'LG-1.2',
  'Tripartite NDA Signed (MTN / Rukisha / I&M)', 'All Partners', 'not_started',
  'Execute tripartite Non-Disclosure Agreement between MTN Rwanda, Rukisha, and I&M Bank Rwanda covering all product development, commercial terms, customer data, and technical architecture. Pre-condition for sharing detailed technical and commercial information between partners.',
  '',
  '2026-03-17 00:00:00+00', '2026-03-21 00:00:00+00', 1, 5,
  '2026-03-21 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-lg-ndas-bilateral', 'phase-lg-contracts', 'LG-1.3',
  'Finalize NDAs (Tripartite & Bilateral)', 'All Partners', 'not_started',
  'Execute all remaining bilateral NDAs: Rukisha–Panamax and Rukisha–TransUnion. These are pre-conditions for sharing FSD/LLD documents with Panamax and for TransUnion to share bureau data API specifications.',
  '',
  '2026-03-17 00:00:00+00', '2026-03-18 00:00:00+00', 1, 2,
  '2026-03-18 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-lg-msa-draft', 'phase-lg-contracts', 'LG-1.4',
  'Master Services Agreement Draft & Review', 'I&M + Rukisha + Panamax', 'not_started',
  'Draft Master Services Agreement between Rukisha, I&M Bank, and Panamax covering platform development responsibilities, ongoing maintenance SLAs, IP ownership, data protection obligations, revenue sharing mechanics, and exit provisions. Legal counsel from all three parties to review simultaneously.',
  '',
  '2026-03-17 00:00:00+00', '2026-03-20 00:00:00+00', 1, 4,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-lg-msa-signoff', 'phase-lg-contracts', 'LG-1.5',
  'Master Services Agreement Sign-off', 'Rukisha + Panamax', 'not_started',
  'Final review and execution of the Master Services Agreement by all parties. Required before development milestones can be formally tracked and payments triggered. Must align with Panamax development contract terms.',
  '',
  '2026-03-17 00:00:00+00', '2026-03-21 00:00:00+00', 1, 5,
  '2026-03-21 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-lg-slas', 'phase-lg-contracts', 'LG-1.6',
  'SLAs and Compliance Clauses Defined', 'Rukisha + Partners', 'in_progress',
  'Define and agree Service Level Agreements across all partner relationships: Panamax platform uptime (99.5% target), I&M Bank API response times, MTN MoMo disbursement SLA, TransUnion bureau response time, and escalation/penalty provisions for SLA breaches.',
  '',
  '2026-03-17 00:00:00+00', '2026-03-21 00:00:00+00', 1, 5,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-lg-transunion-contract', 'phase-lg-contracts', 'LG-1.7',
  'Contract & NDA with TransUnion', 'Rukisha', 'not_started',
  'Execute commercial agreement and data processing addendum with TransUnion Rwanda for credit bureau API access. Agreement must cover query pricing, volume commitments, data retention policy, GDPR-equivalent obligations, and API access credentials. Required before bureau integration development can begin on Day 14.',
  'TransUnion submitted bureau proposal. Rukisha has not yet responded — action required this week.',
  '2026-03-17 00:00:00+00', '2026-03-23 00:00:00+00', 1, 7,
  '2026-03-23 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── LG-2: Regulatory Compliance ──────────────────────────────────────────────
(
  'task-lg-bnr-compliance', 'phase-lg-regulatory', 'LG-2.1',
  'BNR Digital Lending Compliance Review', 'Rukisha + I&M Bank', 'in_progress',
  'Work with I&M Bank Rwanda''s compliance team to complete BNR digital lending compliance review. Confirm that the merchant lending product structure, interest rate methodology, fee disclosures, and reporting obligations comply with BNR guidelines. Product operates under I&M Bank''s existing lending licence — no separate BNR licence required.',
  'Operating under I&M Bank licence. No separate BNR application needed.',
  '2026-03-17 00:00:00+00', '2026-03-28 00:00:00+00', 1, 12,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-lg-ncsa', 'phase-lg-regulatory', 'LG-2.2',
  'NCSA Cybersecurity Application', 'Rukisha', 'not_started',
  'Prepare and submit cybersecurity compliance documentation to the National Cyber Security Authority (NCSA). Package to include data security architecture, encryption standards (AES-256 at rest, TLS 1.3 in transit), access control model, incident response plan, and penetration testing plan.',
  '',
  '2026-03-17 00:00:00+00', '2026-03-28 00:00:00+00', 1, 12,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-lg-rra-tax', 'phase-lg-regulatory', 'LG-2.3',
  'RRA Tax Compliance Meeting', 'Legal + Finance', 'not_started',
  'Meeting with Rwanda Revenue Authority to confirm tax treatment of the lending product: withholding tax on interest income, VAT applicability on facility fees, corporate tax obligations, and RRA reporting requirements for financial institutions. Output: written confirmation of tax positions for finance team.',
  '',
  '2026-03-19 00:00:00+00', '2026-03-26 00:00:00+00', 3, 10,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── LG-3: Risk Policies, T&Cs & Reporting ────────────────────────────────────
(
  'task-lg-risk-policies', 'phase-lg-risk', 'LG-3.1',
  'Define Risk Policies, Credit Limits & NPL Framework', 'All Partners', 'in_progress',
  'Define the full credit risk framework: loan limit bands by merchant segment (Tier 1/2/3), maximum loan tenor (60 days), maximum outstanding exposure per merchant, NPL classification thresholds (30/60/90 DPD), provisioning rates, collections escalation triggers, and write-off policy. Output feeds directly into scorecard configuration (Task PT-3.2).',
  'NPL & Scorecard meeting scheduled Monday. Credit bands and risk appetite to be agreed.',
  '2026-03-24 00:00:00+00', '2026-04-05 00:00:00+00', 8, 20,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-lg-loan-tcs', 'phase-lg-risk', 'LG-3.2',
  'Draft & Approve Loan T&Cs + Privacy Policy', 'Rukisha + I&M + Panamax', 'not_started',
  'Draft borrower-facing loan Terms & Conditions covering: loan amount, tenor, interest rate (flat vs. reducing balance), facility fee structure, early repayment terms, late payment penalties, and collection rights. Also draft privacy policy covering merchant data collection, bureau reporting, and data sharing with I&M Bank. Must comply with BNR requirements.',
  '',
  '2026-04-05 00:00:00+00', '2026-04-15 00:00:00+00', 20, 30,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-lg-reg-reporting', 'phase-lg-risk', 'LG-3.3',
  'Prepare Regulatory Reporting Formats', 'Rukisha', 'not_started',
  'Prepare regulatory reporting templates for BNR submissions: monthly loan portfolio report (disbursements, outstanding, NPL ratio), quarterly risk report, and incident reporting format. Align with I&M Bank''s existing BNR reporting structure to streamline consolidated submissions.',
  '',
  '2026-04-15 00:00:00+00', '2026-04-23 00:00:00+00', 30, 38,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── BD-1: Governance & Commercial ────────────────────────────────────────────
(
  'task-bd-prelim-alignment', 'phase-bd-governance', 'BD-1.1',
  'Preliminary Alignment & Partner Introductions', 'All Partners', 'in_progress',
  'Initial working sessions with I&M Bank, MTN Rwanda, and Panamax to confirm partnership intent, clarify each party''s role and commercial expectations, and align on the compressed timeline. Output: agreed partnership structure document and confirmed point-of-contact matrix.',
  '',
  '2026-03-17 00:00:00+00', '2026-03-18 00:00:00+00', 1, 2,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-purchase-orders', 'phase-bd-governance', 'BD-1.2',
  'Purchase Orders Issued [A2]', 'Rukisha', 'critical',
  'Issue purchase orders to cloud/hosting vendor for infrastructure provisioning and to Panamax upon contract signature. POs are required to trigger vendor mobilisation and cannot be delayed. Finance team to pre-approve PO templates this week.',
  '[A2] Must be issued Day 2 — tied to Panamax contract signing and infra vendor decision.',
  '2026-03-18 00:00:00+00', '2026-03-18 00:00:00+00', 2, 2,
  '2026-03-18 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-proforma-invoices', 'phase-bd-governance', 'BD-1.3',
  'Proforma Invoices Issued & Approved', 'Panamax + Rukisha', 'not_started',
  'Receive proforma invoices from Panamax and hosting vendor against issued POs. Rukisha finance team to review, approve, and initiate payment within 24 hours. Payment release gates vendor mobilisation.',
  '',
  '2026-03-19 00:00:00+00', '2026-03-20 00:00:00+00', 3, 4,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-kickoff', 'phase-bd-governance', 'BD-1.4',
  'Project Kick-off Workshop', 'All Partners', 'not_started',
  'Formal project kick-off with all partners: Rukisha, I&M Bank, MTN Rwanda, and Panamax. Present compressed project plan, confirm workstream ownership (Product & Tech / Legal / Bus Dev), agree weekly steering committee cadence, set escalation paths, and lock the Go Live target date. All workstream leads to attend in person or via video.',
  '',
  '2026-03-21 00:00:00+00', '2026-03-23 00:00:00+00', 5, 7,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-pmo', 'phase-bd-governance', 'BD-1.5',
  'PMO & Steering Committee Structure', 'Rukisha', 'not_started',
  'Establish the Project Management Office with a dedicated PM, weekly status report template, RAID log (Risks, Assumptions, Issues, Dependencies), and decision log. Steering Committee membership confirmed from each partner with defined voting rights and escalation authority. First SteerCo scheduled within one week of kick-off.',
  '',
  '2026-03-24 00:00:00+00', '2026-03-24 00:00:00+00', 8, 8,
  '2026-03-24 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-tripartite-commercial-tech', 'phase-bd-governance', 'BD-1.6',
  'Tripartite Commercial Discussion (MTN / Rukisha / I&M)', 'All Partners', 'not_started',
  'Structured commercial negotiation between MTN Rwanda, Rukisha, and I&M Bank covering: MTN MoMo API commercial terms (disbursement and collection fees), revenue sharing model (Rukisha / I&M split on interest and fees), float management, MTN merchant ecosystem access fees, and data sharing commercial terms.',
  '',
  '2026-03-24 00:00:00+00', '2026-03-28 00:00:00+00', 8, 12,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-im-commercial', 'phase-bd-governance', 'BD-1.7',
  'Commercial Agreement with I&M Bank Rwanda', 'Rukisha + I&M', 'not_started',
  'Negotiate and execute the commercial agreement with I&M Bank Rwanda covering: lending book ownership and balance sheet treatment, facility pricing (cost of funds to Rukisha), revenue split on interest income and facility fees, maximum lending exposure, credit loss sharing mechanism, and operational responsibilities matrix.',
  'I&M Bank scope contract not yet finalised.',
  '2026-03-19 00:00:00+00', '2026-03-23 00:00:00+00', 3, 7,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-tripartite-commercial-ops', 'phase-bd-governance', 'BD-1.8',
  'Tripartite Commercial Discussion — Ops Track', 'All Partners', 'not_started',
  'Parallel commercial discussion focusing on operational terms: settlement cycles (T+1 vs T+2), default risk allocation between I&M and Rukisha, MTN float requirements, dispute resolution process, and SLA-linked penalty structure.',
  '',
  '2026-03-19 00:00:00+00', '2026-03-24 00:00:00+00', 3, 8,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-rdb-meeting', 'phase-bd-governance', 'BD-1.9',
  'RDB Integration — Business Registry Meeting', 'Technical + Legal', 'not_started',
  'Meeting with Rwanda Development Board to explore real-time API integration with the national business registry for automated KYB (Know Your Business) during merchant onboarding. Verify RDB API availability, commercial terms, data fields returned (ownership, registration status), and compliance obligations for accessing registry data.',
  '',
  '2026-03-19 00:00:00+00', '2026-03-26 00:00:00+00', 3, 10,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-steering-committee-ops', 'phase-bd-governance', 'BD-1.10',
  'Operational Steering Committee Established', 'Rukisha + I&M', 'not_started',
  'Formally establish the Operational Steering Committee with terms of reference, meeting schedule (bi-weekly during build, weekly post-launch), defined membership from Rukisha and I&M Bank operations leads, and escalation authority for operational decisions.',
  '',
  '2026-03-24 00:00:00+00', '2026-03-24 00:00:00+00', 8, 8,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── BD-2: Product & Brand ─────────────────────────────────────────────────────
(
  'task-bd-product-name-tech', 'phase-bd-product-brand', 'BD-2.1',
  'Product Name Definition [A6]', 'Product + Marketing', 'critical',
  'Define and agree on the commercial product name for the merchant lending product. Name must be BNR-compliant, work in English and Kinyarwanda, and be ownable as a brand. This is a blocker for ALL marketing collateral, merchant-facing materials, T&Cs, app UI text, and partner co-branding discussions. Must be resolved Week 1.',
  '[A6] Blocks entire marketing workstream. Escalate to CEO for Week 1 decision.',
  '2026-03-17 00:00:00+00', '2026-03-21 00:00:00+00', 1, 5,
  '2026-03-21 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-product-name-ops', 'phase-bd-product-brand', 'BD-2.2',
  'Product Name Definition — Ops Track', 'Product + Marketing', 'critical',
  'Parallel ops track for product name decision: assess regulatory naming requirements, confirm I&M Bank co-branding position, review MTN Rwanda co-marketing naming constraints, and present shortlist for executive decision. Output feeds into all operational and legal docs.',
  '[A6] Same decision as BD-2.1 — consolidate into single Week 1 decision.',
  '2026-03-17 00:00:00+00', '2026-03-21 00:00:00+00', 1, 5,
  '2026-03-21 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── BD-3: People & Operational Readiness ─────────────────────────────────────
(
  'task-bd-office-space', 'phase-bd-people-ops', 'BD-3.1',
  'Office Space Setup', 'Rukisha', 'not_started',
  'Source, negotiate, and set up Rukisha office space for the operations team, credit analysts, and customer support staff. Must be operational before staff onboarding. Requirements: minimum 10 workstations, reliable internet (fibre), meeting room, and proximity to I&M Bank Rwanda for relationship management.',
  '',
  '2026-03-17 00:00:00+00', '2026-03-31 00:00:00+00', 1, 15,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-staff-recruitment', 'phase-bd-people-ops', 'BD-3.2',
  'Key Staff Recruitment', 'Rukisha', 'not_started',
  'Recruit core operational team: Credit Manager (oversees scorecard and approval exceptions), Operations Lead (daily system monitoring and reconciliation), Customer Support Agents x2 (merchant onboarding and loan support), and Finance Officer (reconciliation and regulatory reporting). Offer letters issued by Day 20 to allow onboarding before system training.',
  '',
  '2026-03-19 00:00:00+00', '2026-04-05 00:00:00+00', 3, 20,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-sops', 'phase-bd-people-ops', 'BD-3.3',
  'Internal SOPs Defined', 'Rukisha + Panamax', 'not_started',
  'Document Standard Operating Procedures for all operational processes: daily loan origination review, exception approvals, MTN MoMo disbursement monitoring, delinquency escalation (30/60/90 DPD workflow), daily reconciliation checklist, I&M Bank reporting, merchant complaint handling, and system incident escalation.',
  '',
  '2026-03-31 00:00:00+00', '2026-04-07 00:00:00+00', 15, 22,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),

-- ── BD-4: Marketing & Go-to-Market ───────────────────────────────────────────
(
  'task-bd-hire-agency', 'phase-bd-marketing', 'BD-4.1',
  'Hire Marketing Agency [A6]', 'Rukisha', 'critical',
  'Engage a marketing agency with demonstrated SME/FMCG experience in Rwanda and East Africa. Scope: brand development, merchant acquisition campaigns, digital and below-the-line media. Agency must be contracted and briefed by Day 8 to meet compressed marketing timeline. Issue brief immediately — do not wait for product name to shortlist agencies.',
  '[A6] Parallel track: agency selection can start before product name is finalised.',
  '2026-03-19 00:00:00+00', '2026-03-24 00:00:00+00', 3, 8,
  '2026-03-24 00:00:00+00', null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-marketing-okrs', 'phase-bd-marketing', 'BD-4.2',
  'Set Marketing OKRs and KPIs', 'Marketing Agency', 'not_started',
  'Define marketing objectives and key results for the launch period: target merchant acquisition (# of active borrowers in first 60 days post-launch), loan activation rate, cost per acquisition, brand awareness score, and Net Promoter Score baseline. OKRs to align with Rukisha commercial targets.',
  '',
  '2026-03-25 00:00:00+00', '2026-03-31 00:00:00+00', 9, 15,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
),
(
  'task-bd-gtm-strategy', 'phase-bd-marketing', 'BD-4.3',
  'Define Go-to-Market Strategy', 'Marketing Agency', 'not_started',
  'Define go-to-market strategy covering: target merchant segments (starting with MTN MoMo agents and registered merchants in Kigali), acquisition channels (MTN agent network, digital, direct), pricing communication strategy, and referral incentive programme.',
  '',
  '2026-03-25 00:00:00+00', '2026-04-05 00:00:00+00', 9, 20,
  null, null, '[]'::jsonb,
  '2026-03-12 00:00:00+00', '2026-03-12 00:00:00+00'
)

-- TODO: BD-4.4 through BD-4.x (7 tasks) are missing — source JSON was truncated.
-- Add them manually or re-paste with the remaining tasks.

on conflict (id) do update set
  phase_id    = excluded.phase_id,
  wbs         = excluded.wbs,
  name        = excluded.name,
  owner       = excluded.owner,
  status      = excluded.status,
  description = excluded.description,
  remarks     = excluded.remarks,
  start_date  = excluded.start_date,
  end_date    = excluded.end_date,
  start_day   = excluded.start_day,
  end_day     = excluded.end_day,
  deadline    = excluded.deadline,
  blocked_by  = excluded.blocked_by,
  updated_at  = excluded.updated_at;
