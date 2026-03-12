import type { TaskStatus } from "./types";

export interface RoadmapTask {
  wbs: string;
  name: string;
  owner: string;
  description: string;
  start_date: string;
  end_date: string;
  status: TaskStatus;
}

export interface RoadmapPhase {
  name: string;
  tasks: RoadmapTask[];
}

export const TOTAL_DAYS = 75;
export const GO_LIVE_DAY = 60;

export const TECH_PHASES: RoadmapPhase[] = [
  {
    name: "PHASE 0: INITIATION, GOVERNANCE & PROCUREMENT",
    tasks: [
      { wbs: "0.1", name: "Kick-off meeting & project charter sign-off", owner: "PM / All Leads", description: "Align all workstream leads on scope, objectives, timeline, and decision-making authority. Produce a signed project charter.", start_date: "2026-03-02", end_date: "2026-03-04", status: "completed" },
      { wbs: "0.2", name: "Governance framework & RACI matrix", owner: "PM", description: "Define roles across Tech, Ops, Finance, Legal, and Marketing. Establish escalation paths, meeting cadence, and approval thresholds.", start_date: "2026-03-02", end_date: "2026-03-05", status: "completed" },
      { wbs: "0.3", name: "Panamax contract negotiation & execution", owner: "CEO / Legal", description: "Critical path item. Finalise commercial terms (rev-share, SLA, data ownership), legal review, and execute the partnership agreement. Unblocks development in Phase 3.", start_date: "2026-03-02", end_date: "2026-03-11", status: "in_progress" },
      { wbs: "0.4", name: "Vendor evaluation (Sumsub, Mambu, etc.)", owner: "Tech Lead", description: "Scorecard evaluation of KYB/KYC (Sumsub), core banking (Mambu/Panamax), and payment rails vendors on cost, integration complexity, and regulatory fit.", start_date: "2026-03-04", end_date: "2026-03-09", status: "completed" },
      { wbs: "0.5", name: "Vendor contracts & SLAs signed", owner: "CEO / Legal", description: "Execute agreements with shortlisted vendors. Negotiate uptime SLAs (≥99.5%), support response times, and data processing addenda.", start_date: "2026-03-09", end_date: "2026-03-15", status: "in_progress" },
    ],
  },
  {
    name: "PHASE 1: INFRASTRUCTURE SETUP",
    tasks: [
      { wbs: "1.1", name: "Cloud environment provisioning (AWS/GCP)", owner: "Tech Lead", description: "Provision VPC, IAM roles, compute (ECS/GKE), managed database, object storage, and CDN. Apply tagging strategy for cost attribution.", start_date: "2026-03-11", end_date: "2026-03-17", status: "in_progress" },
      { wbs: "1.2", name: "CI/CD pipeline setup", owner: "DevOps", description: "Configure GitHub Actions / GitLab CI with automated build, test, SAST scan, and deploy stages for dev and staging environments.", start_date: "2026-03-13", end_date: "2026-03-19", status: "not_started" },
      { wbs: "1.3", name: "Dev / staging / prod environments", owner: "DevOps", description: "Stand up three isolated environments with environment-specific config, secrets, and network isolation. Enable blue/green deploy capability for prod.", start_date: "2026-03-15", end_date: "2026-03-21", status: "not_started" },
      { wbs: "1.4", name: "Security & secrets management baseline", owner: "Tech Lead", description: "Integrate AWS Secrets Manager / HashiCorp Vault. Enforce no plaintext secrets in code. Configure WAF, DDoS protection, and VPN for admin access.", start_date: "2026-03-17", end_date: "2026-03-23", status: "not_started" },
      { wbs: "1.5", name: "Panamax sandbox integration & test", owner: "Backend Dev", description: "Critical path. Verify connectivity to Panamax sandbox API — authentication, loan origination endpoint, and webhook callbacks. Any delays here cascade to Phase 3.", start_date: "2026-03-15", end_date: "2026-03-23", status: "critical" },
    ],
  },
  {
    name: "PHASE 2: REQUIREMENTS & PLANNING",
    tasks: [
      { wbs: "2.1", name: "Detailed BRD sign-off (lending product)", owner: "PM / Product", description: "Document business rules for loan eligibility, credit limits (RWF 50k–500k), tenure (30/60 days), interest rate, fees, and disbursement flow. Sign-off from CEO required.", start_date: "2026-03-06", end_date: "2026-03-13", status: "in_progress" },
      { wbs: "2.2", name: "UI/UX wireframes & prototypes", owner: "Designer", description: "Design merchant-facing onboarding, loan application, repayment, and dashboard screens. Validate with 3 pilot merchant interviews before dev handoff.", start_date: "2026-03-09", end_date: "2026-03-19", status: "in_progress" },
      { wbs: "2.3", name: "Technical architecture document", owner: "Tech Lead", description: "Define system components, API boundaries, data flow, external integrations (Panamax, Sumsub, SMS gateway), and DR architecture. Review with full team.", start_date: "2026-03-11", end_date: "2026-03-17", status: "not_started" },
      { wbs: "2.4", name: "Data model & API contract", owner: "Backend Dev", description: "Define database schema (merchant, loan, repayment, audit tables) and OpenAPI spec for all internal and external endpoints. Frontend and backend agree before sprint start.", start_date: "2026-03-13", end_date: "2026-03-19", status: "not_started" },
      { wbs: "2.5", name: "Sprint planning & backlog grooming", owner: "PM", description: "Break BRD into user stories, estimate complexity, assign to 2-week sprints, and confirm priorities with Tech Lead. Target 4 dev sprints before UAT.", start_date: "2026-03-15", end_date: "2026-03-19", status: "not_started" },
    ],
  },
  {
    name: "PHASE 3: DEVELOPMENT & CONFIGURATION",
    tasks: [
      { wbs: "3.1", name: "Merchant onboarding & KYB (Sumsub)", owner: "Backend Dev", description: "Build merchant registration flow integrating Sumsub for identity verification (KYC) and business verification (KYB). Include document upload, liveness check, and decisioning webhook.", start_date: "2026-03-19", end_date: "2026-04-02", status: "not_started" },
      { wbs: "3.2", name: "Loan origination engine (Panamax)", owner: "Backend Dev", description: "Critical path. Build the end-to-end loan origination flow via Panamax API: application submission, credit decision callback, disbursement instruction, and status tracking.", start_date: "2026-03-21", end_date: "2026-04-08", status: "critical" },
      { wbs: "3.3", name: "Credit scoring & decisioning model", owner: "Data / Backend", description: "Implement rule-based credit scoring using MoMo transaction history, business age, and repayment track record. Define approval/decline/manual review thresholds.", start_date: "2026-03-23", end_date: "2026-04-06", status: "not_started" },
      { wbs: "3.4", name: "Repayment & collections module", owner: "Backend Dev", description: "Build automated repayment deduction via MoMo, overdue detection, grace period logic, and collections escalation triggers. Include reconciliation hooks.", start_date: "2026-03-29", end_date: "2026-04-12", status: "not_started" },
      { wbs: "3.5", name: "Merchant dashboard (frontend)", owner: "Frontend Dev", description: "Build merchant-facing web app: loan history, application status, repayment schedule, account statements, and notification preferences. Must be mobile-responsive.", start_date: "2026-03-25", end_date: "2026-04-14", status: "not_started" },
      { wbs: "3.6", name: "Admin portal & ops dashboard", owner: "Frontend Dev", description: "Internal portal for credit analysts: loan review queue, merchant profile, override/approve/decline actions, portfolio health metrics, and collections case management.", start_date: "2026-03-31", end_date: "2026-04-16", status: "not_started" },
      { wbs: "3.7", name: "Notifications (SMS/email/push)", owner: "Backend Dev", description: "Integrate SMS gateway (Africa's Talking or MTN API) for loan approval, disbursement confirmation, repayment reminders (D-3, D-0), and overdue alerts.", start_date: "2026-04-04", end_date: "2026-04-14", status: "not_started" },
      { wbs: "3.8", name: "Audit logs & data encryption", owner: "Tech Lead", description: "Implement immutable audit trail for all loan lifecycle events. Encrypt PII at rest (AES-256) and in transit (TLS 1.3). Prepare for regulatory audit readiness.", start_date: "2026-04-06", end_date: "2026-04-16", status: "not_started" },
    ],
  },
  {
    name: "PHASE 4: INTEGRATION & TESTING",
    tasks: [
      { wbs: "4.1", name: "Unit & integration tests", owner: "QA / Dev", description: "Achieve ≥80% unit test coverage on core modules (credit engine, loan origination, repayment). Run integration tests against Panamax and Sumsub sandboxes.", start_date: "2026-04-10", end_date: "2026-04-20", status: "not_started" },
      { wbs: "4.2", name: "Panamax end-to-end integration test", owner: "Tech Lead", description: "Critical path. Full loan lifecycle test in Panamax staging: application → approval → disbursement → repayment → closure. Validate all edge cases and error states.", start_date: "2026-04-12", end_date: "2026-04-22", status: "critical" },
      { wbs: "4.3", name: "Penetration testing & security audit", owner: "External / Tech", description: "Engage external security firm for OWASP Top 10 assessment, API penetration test, and data protection review. Remediate all critical/high findings before go-live.", start_date: "2026-04-16", end_date: "2026-04-24", status: "not_started" },
      { wbs: "4.4", name: "Performance & load testing", owner: "QA / DevOps", description: "Simulate 500 concurrent loan applications. Validate system handles peak load with p95 response <2s. Identify and resolve bottlenecks in DB queries and API calls.", start_date: "2026-04-18", end_date: "2026-04-24", status: "not_started" },
      { wbs: "4.5", name: "Bug fixes & regression testing", owner: "QA / Dev", description: "Triage and fix all P1/P2 defects from test cycles. Run full regression suite. Obtain QA sign-off before UAT handoff.", start_date: "2026-04-20", end_date: "2026-04-26", status: "not_started" },
    ],
  },
  {
    name: "PHASE 5: TRAINING & UAT",
    tasks: [
      { wbs: "5.1", name: "Internal staff training (ops, credit, support)", owner: "Ops Lead / PM", description: "Train credit analysts on loan review workflow, collections team on overdue escalation, and customer support on common issues. Produce training materials and FAQs.", start_date: "2026-04-20", end_date: "2026-04-27", status: "not_started" },
      { wbs: "5.2", name: "UAT with pilot merchants (3–5 merchants)", owner: "PM / Ops", description: "Onboard 3–5 pre-selected pilot merchants in staging environment. Walk through full loan application, approval, and disbursement journey. Collect structured feedback.", start_date: "2026-04-22", end_date: "2026-04-28", status: "not_started" },
      { wbs: "5.3", name: "UAT sign-off & readiness checklist", owner: "PM / CEO", description: "Review UAT feedback, confirm all go-live criteria are met (zero P1 bugs, security audit cleared, regulatory approval received, ops team trained). CEO sign-off required.", start_date: "2026-04-26", end_date: "2026-04-29", status: "not_started" },
    ],
  },
  {
    name: "PHASE 6: GO LIVE & POST-LAUNCH",
    tasks: [
      { wbs: "6.1", name: "Production deployment & smoke tests", owner: "DevOps / Tech", description: "Deploy to production using blue/green strategy. Run smoke test suite covering critical journeys. Confirm monitoring, alerting, and on-call rotation are active.", start_date: "2026-04-29", end_date: "2026-04-30", status: "not_started" },
      { wbs: "6.2", name: "Go Live — first loan disbursement", owner: "All", description: "Disburse first loan to a pilot merchant. All workstreams on standby. CEO, Tech Lead, and Ops Lead present. Document any issues in the war-room log.", start_date: "2026-04-30", end_date: "2026-04-30", status: "not_started" },
      { wbs: "6.3", name: "Hypercare & war-room support (2 weeks)", owner: "Tech + Ops", description: "Two-week intensified support period with daily standups, 30-min P1 SLA, and war-room channel. Monitor loan volumes, repayment rates, error rates, and system health.", start_date: "2026-04-30", end_date: "2026-05-14", status: "not_started" },
      { wbs: "6.4", name: "Post-launch retrospective", owner: "PM", description: "Structured retrospective covering: what went well, what didn't, lessons learned, and backlog of improvements for V1.1. Share outcomes with all stakeholders.", start_date: "2026-05-12", end_date: "2026-05-15", status: "not_started" },
    ],
  },
];

export const OPS_PHASES: RoadmapPhase[] = [
  {
    name: "PHASE 0: LEGAL & CONTRACTUAL READINESS",
    tasks: [
      { wbs: "L0.1", name: "Panamax partnership agreement signed", owner: "CEO / Legal", description: "Execute Panamax commercial agreement covering revenue share, API access rights, data ownership, liability caps, and termination clauses. Required before any development begins.", start_date: "2026-03-02", end_date: "2026-03-11", status: "in_progress" },
      { wbs: "L0.2", name: "Lending T&Cs and customer agreements drafted", owner: "Legal", description: "Draft merchant-facing loan terms including interest rate disclosure, fees, late payment penalties, and data consent provisions. Must comply with Rwanda's consumer credit regulations.", start_date: "2026-03-06", end_date: "2026-03-17", status: "not_started" },
      { wbs: "L0.3", name: "Data protection & privacy policy (GDPR/local)", owner: "Legal / Compliance", description: "Prepare privacy policy and data processing agreements aligned with Rwanda's Data Protection Law and any applicable GDPR obligations for international partners.", start_date: "2026-03-09", end_date: "2026-03-19", status: "not_started" },
      { wbs: "L0.4", name: "Vendor SLAs reviewed and executed", owner: "Legal / PM", description: "Review and execute SLAs with all third-party vendors (Sumsub, SMS provider, cloud). Ensure uptime commitments, data localisation requirements, and audit rights are captured.", start_date: "2026-03-11", end_date: "2026-03-21", status: "not_started" },
    ],
  },
  {
    name: "PHASE 1: REGULATORY & GOVERNANCE",
    tasks: [
      { wbs: "R1.1", name: "Regulatory filing (lending licence or exemption)", owner: "CEO / Legal", description: "Critical path (30-day task). File for BNR credit institution licence or confirm Panamax's existing licence covers the product. Any delay here could push go-live. Engage regulatory counsel.", start_date: "2026-03-02", end_date: "2026-03-31", status: "critical" },
      { wbs: "R1.2", name: "AML/KYC policy sign-off", owner: "Compliance", description: "Document AML programme: customer due diligence levels, PEP/sanctions screening, transaction monitoring thresholds, and SAR filing procedures. Obtain board approval.", start_date: "2026-03-09", end_date: "2026-03-21", status: "not_started" },
      { wbs: "R1.3", name: "Credit policy document approved", owner: "Credit Lead", description: "Define lending policy: eligible merchant criteria, minimum MoMo history required, credit limit formula, single borrower limits, sector restrictions, and annual review process.", start_date: "2026-03-11", end_date: "2026-03-23", status: "not_started" },
      { wbs: "R1.4", name: "Board / investor approval for product launch", owner: "CEO", description: "Present business case, risk assessment, and financial projections to board/investors. Obtain formal approval to proceed with commercial launch.", start_date: "2026-03-15", end_date: "2026-03-25", status: "not_started" },
    ],
  },
  {
    name: "PHASE 2: PEOPLE & OPERATIONAL READINESS",
    tasks: [
      { wbs: "P2.1", name: "Hire / assign Credit Analyst", owner: "CEO / HR", description: "Recruit or internally assign a Credit Analyst to own loan assessment, manual review queue, and policy exception decisions. Must be in place before UAT (wk 7).", start_date: "2026-03-06", end_date: "2026-03-19", status: "in_progress" },
      { wbs: "P2.2", name: "Hire / assign Collections Officer", owner: "CEO / HR", description: "Appoint a Collections Officer responsible for overdue accounts, repayment plan negotiations, and escalation to legal if required. Define KPIs (collection rate, days past due).", start_date: "2026-03-09", end_date: "2026-03-23", status: "not_started" },
      { wbs: "P2.3", name: "Customer support playbook & escalation matrix", owner: "Ops Lead", description: "Write tiered support playbook covering Tier 1 (FAQ/chatbot), Tier 2 (agent), and Tier 3 (tech/credit) for common issues: failed disbursement, repayment disputes, KYB rejection.", start_date: "2026-03-21", end_date: "2026-04-02", status: "not_started" },
      { wbs: "P2.4", name: "Ops runbook: loan processing SOP", owner: "Ops Lead", description: "Document step-by-step SOPs for daily loan processing, manual credit review, disbursement confirmation, end-of-day reconciliation, and incident response.", start_date: "2026-03-23", end_date: "2026-04-04", status: "not_started" },
      { wbs: "P2.5", name: "Staff training (credit, collections, support)", owner: "Ops Lead / PM", description: "Deliver training sessions covering the admin portal, credit policy, collections workflow, and customer support playbook. Run simulated loan cases before go-live.", start_date: "2026-04-16", end_date: "2026-04-26", status: "not_started" },
    ],
  },
  {
    name: "PHASE 3: RISK & COMPLIANCE",
    tasks: [
      { wbs: "RC3.1", name: "Risk appetite statement finalised", owner: "CEO / Risk", description: "Board-approved risk appetite covering: maximum NPL ratio (e.g., <5%), concentration limits by sector, single borrower cap, and liquidity risk tolerance.", start_date: "2026-03-11", end_date: "2026-03-21", status: "not_started" },
      { wbs: "RC3.2", name: "Fraud detection rules configured", owner: "Risk / Tech", description: "Configure rules in the admin portal: velocity checks (>3 apps in 7 days), device fingerprinting, geolocation anomalies, and known fraud merchant list. Test with synthetic cases.", start_date: "2026-03-29", end_date: "2026-04-10", status: "not_started" },
      { wbs: "RC3.3", name: "Collections policy & escalation workflow", owner: "Collections / Legal", description: "Define collection stages: soft reminder (D+1), hard reminder (D+7), restructuring offer (D+15), formal demand (D+30), and legal escalation (D+60). Align with BNR guidelines.", start_date: "2026-03-25", end_date: "2026-04-06", status: "not_started" },
      { wbs: "RC3.4", name: "Business continuity & DR plan", owner: "Tech Lead / Ops", description: "Document RTO (4h) and RPO (1h) targets. Define failover procedures, data backup schedule, and communication plan for system outages during peak disbursement periods.", start_date: "2026-04-10", end_date: "2026-04-22", status: "not_started" },
    ],
  },
  {
    name: "PHASE 4: RECONCILIATION & FINANCE",
    tasks: [
      { wbs: "F4.1", name: "Chart of accounts & loan accounting setup", owner: "Finance / Tech", description: "Configure accounting entries for loan origination, interest accrual, fee recognition, repayment allocation (principal vs interest), provisioning, and write-offs.", start_date: "2026-03-19", end_date: "2026-03-31", status: "not_started" },
      { wbs: "F4.2", name: "Disbursement & repayment reconciliation SOP", owner: "Finance / Ops", description: "Define daily reconciliation process between the Rukisha ledger, Panamax records, and MoMo settlement reports. Specify T+1 break resolution workflow.", start_date: "2026-03-27", end_date: "2026-04-08", status: "not_started" },
      { wbs: "F4.3", name: "Reporting dashboard — daily P&L / portfolio", owner: "Finance / Tech", description: "Build finance reporting module: disbursements today, collections today, outstanding portfolio, interest income accrued, NPL ratio, and 30/60/90-day aging buckets.", start_date: "2026-04-04", end_date: "2026-04-18", status: "not_started" },
      { wbs: "F4.4", name: "Finance sign-off on go-live checklist", owner: "Finance Lead", description: "Confirm accounting setup is complete, opening capital allocation is in place, reconciliation SOP has been tested, and finance team can process day-one transactions.", start_date: "2026-04-24", end_date: "2026-04-29", status: "not_started" },
    ],
  },
  {
    name: "PHASE 5: MARKETING & GO-TO-MARKET",
    tasks: [
      { wbs: "M5.1", name: "Product name & brand identity finalised", owner: "CEO / Marketing", description: "Blocked — pending CEO decision. Define product name, tagline, logo lockup, and brand colour palette. Required before any merchant-facing materials, app store listings, or press releases.", start_date: "2026-03-02", end_date: "2026-03-15", status: "blocked" },
      { wbs: "M5.2", name: "Go-to-market strategy & merchant segments", owner: "Marketing / CEO", description: "Define ICP (ideal customer profile), primary segments (e.g., urban retail, mobile food vendors), channel strategy (direct sales vs MoMo agent network), and launch market.", start_date: "2026-03-13", end_date: "2026-03-25", status: "not_started" },
      { wbs: "M5.3", name: "Merchant acquisition pipeline (20 merchants)", owner: "Sales / Marketing", description: "Build and qualify a pipeline of 20 merchants for wave-one launch. Prioritise existing MoMo business customers with 6+ months of transaction history.", start_date: "2026-03-21", end_date: "2026-04-20", status: "not_started" },
      { wbs: "M5.4", name: "Launch comms: email, social, PR", owner: "Marketing", description: "Produce go-live communication assets: merchant announcement email, LinkedIn/X posts, press release for local media, and in-app onboarding guide.", start_date: "2026-04-18", end_date: "2026-04-28", status: "not_started" },
      { wbs: "M5.5", name: "Pilot merchant onboarding (3–5 merchants)", owner: "Sales / Ops", description: "Personally onboard the first 3–5 merchants in production, guiding them through KYB, first loan application, and disbursement. Capture NPS and product feedback.", start_date: "2026-04-20", end_date: "2026-04-28", status: "not_started" },
    ],
  },
];
