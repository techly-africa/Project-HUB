// Seed data aligned with current project status — March 2026
// Source: Rukisha project Implementation.xlsx + March 2026 status updates

export const SEED_DATA = {
  plans: [
    { id: "plan-product-tech", name: "Product & Technology", type: "product-tech" },
    { id: "plan-legal", name: "Legal", type: "legal" },
    { id: "plan-biz-dev", name: "Business Development", type: "biz-dev" },
  ],

  phases: [
    // ── TECH PLAN ───────────────────────────────────────────────────────────
    { id: "ph-t0", plan_id: "plan-tech", wbs: "0", name: "Initiation, Governance & Procurement", display_order: 0 },
    { id: "ph-t1", plan_id: "plan-tech", wbs: "1", name: "Infrastructure Setup", display_order: 1 },
    { id: "ph-t2", plan_id: "plan-tech", wbs: "2", name: "Kick-off & Governance", display_order: 2 },
    { id: "ph-t3", plan_id: "plan-tech", wbs: "3", name: "Requirements & Planning", display_order: 3 },
    { id: "ph-t4", plan_id: "plan-tech", wbs: "4", name: "Development & Configuration", display_order: 4 },
    { id: "ph-t5", plan_id: "plan-tech", wbs: "5", name: "Training & UAT", display_order: 5 },
    { id: "ph-t6", plan_id: "plan-tech", wbs: "6", name: "Go Live & Post-Launch", display_order: 6 },
    { id: "ph-t7", plan_id: "plan-tech", wbs: "7", name: "Marketing & GTM", display_order: 7 },

    // ── OPERATIONAL PLAN ────────────────────────────────────────────────────
    { id: "ph-o0", plan_id: "plan-ops", wbs: "0", name: "Legal & Contractual Readiness", display_order: 0 },
    { id: "ph-o1", plan_id: "plan-ops", wbs: "1", name: "Regulatory & Governance", display_order: 1 },
    { id: "ph-o2", plan_id: "plan-ops", wbs: "2", name: "People & Operational Readiness", display_order: 2 },
    { id: "ph-o3", plan_id: "plan-ops", wbs: "3", name: "Risk & Compliance", display_order: 3 },
    { id: "ph-o4", plan_id: "plan-ops", wbs: "4", name: "Reconciliation & Finance", display_order: 4 },
    { id: "ph-o5", plan_id: "plan-ops", wbs: "5", name: "Marketing & Go-to-Market", display_order: 5 },
  ],

  tasks: [
    // ── PHASE 0: Initiation ──────────────────────────────────────────────────
    {
      id: "t-0-1", phase_id: "ph-t0", wbs: "0.1",
      name: "Preliminary Alignment & Partner Introductions",
      owner: "All Partners", start_date: "2026-03-02", end_date: "2026-03-04", status: "in_progress",
      remarks: "Initial alignment underway across MTN, I&M Bank and Rukisha",
    },
    {
      id: "t-0-2", phase_id: "ph-t0", wbs: "0.2",
      name: "Stakeholder Business Requirements Gathering",
      owner: "I&M Bank + Rukisha", start_date: "2026-03-02", end_date: "2026-03-06", status: "in_progress",
      remarks: "Requirements gathering in progress; FSD/LLD review ongoing",
    },
    {
      id: "t-0-3", phase_id: "ph-t0", wbs: "0.3",
      name: "Master Services Agreement Draft & Review",
      owner: "I&M Bank + Rukisha + Panamax", start_date: "2026-03-02", end_date: "2026-03-06", status: "not_started",
      remarks: "MTN contract pending; I&M Bank scope contract pending",
    },
    {
      id: "t-0-4", phase_id: "ph-t0", wbs: "0.4",
      name: "Tripartite NDA Signed (MTN / Rukisha / I&M)",
      owner: "All Partners", start_date: "2026-03-02", end_date: "2026-03-08", status: "not_started",
      remarks: null,
    },
    {
      id: "t-0-5", phase_id: "ph-t0", wbs: "0.5",
      name: "Purchase Orders Issued",
      owner: "Rukisha", start_date: "2026-03-09", end_date: "2026-03-09", status: "not_started",
      remarks: "Pending infrastructure decision (buy/lease/host/cloud comparative report to follow)",
    },
    {
      id: "t-0-6", phase_id: "ph-t0", wbs: "0.6",
      name: "Proforma Invoices Issued and Approved",
      owner: "Panamax + Rukisha", start_date: "2026-03-10", end_date: "2026-03-11", status: "not_started",
      remarks: null,
    },

    // ── PHASE 1: Infrastructure ──────────────────────────────────────────────
    {
      id: "t-1-1", phase_id: "ph-t1", wbs: "1.1",
      name: "Infrastructure Procurement & Hardware Delivery",
      owner: "TBD — pending vendor selection", start_date: "2026-03-11", end_date: "2026-04-12", status: "in_progress",
      remarks: "BOM reviewed; awaiting hosting proposals from MTN & AOS. Comparative report (buy/lease/hosted/cloud) to follow",
    },
    {
      id: "t-1-2", phase_id: "ph-t1", wbs: "1.2",
      name: "Co-location Development Environment Setup",
      owner: "Hosting Vendor (TBD)", start_date: "2026-03-11", end_date: "2026-03-18", status: "not_started",
      remarks: "Blocked pending MTN & AOS hosting proposals",
    },
    {
      id: "t-1-3", phase_id: "ph-t1", wbs: "1.3",
      name: "Development Environment Validation",
      owner: "Panamax", start_date: "2026-03-18", end_date: "2026-03-19", status: "not_started",
      remarks: null,
    },

    // ── PHASE 2: Kick-off ────────────────────────────────────────────────────
    {
      id: "t-2-1", phase_id: "ph-t2", wbs: "2.1",
      name: "Project Kick-off Workshop",
      owner: "All Partners", start_date: "2026-03-12", end_date: "2026-03-18", status: "not_started",
      remarks: "Pending contract execution",
    },
    {
      id: "t-2-2", phase_id: "ph-t2", wbs: "2.2",
      name: "PMO & Steering Committee Structure",
      owner: "Rukisha", start_date: "2026-03-19", end_date: "2026-03-19", status: "not_started",
      remarks: null,
    },
    {
      id: "t-2-3", phase_id: "ph-t2", wbs: "2.3",
      name: "Tripartite Commercial Discussion (MTN / Rukisha / I&M)",
      owner: "All Partners", start_date: "2026-03-19", end_date: "2026-03-22", status: "not_started",
      remarks: "Revenue share, governance and SLA terms to be formally agreed",
    },

    // ── PHASE 3: Requirements ────────────────────────────────────────────────
    {
      id: "t-3-1", phase_id: "ph-t3", wbs: "3.1",
      name: "FSD / LLD Technical Review",
      owner: "Technical Team", start_date: "2026-03-19", end_date: "2026-03-22", status: "in_progress",
      remarks: "Full review of Functional Specification Document and Low-Level Design in progress",
    },
    {
      id: "t-3-2", phase_id: "ph-t3", wbs: "3.2",
      name: "I&M Bank Direct Integration Architecture",
      owner: "Technical Team + I&M", start_date: "2026-03-22", end_date: "2026-03-26", status: "not_started",
      remarks: "Technical meeting with I&M Bank on direct API integration is pending",
    },
    {
      id: "t-3-3", phase_id: "ph-t3", wbs: "3.3",
      name: "FSD Sign-off",
      owner: "Rukisha", start_date: "2026-03-23", end_date: "2026-03-23", status: "not_started",
      remarks: "Required before Panamax can commence development",
    },

    // ── PHASE 4: Development ─────────────────────────────────────────────────
    {
      id: "t-4-1", phase_id: "ph-t4", wbs: "4.1",
      name: "Core LOS & LMS Development",
      owner: "Panamax", start_date: "2026-03-23", end_date: "2026-05-17", status: "blocked",
      remarks: "BLOCKED: Panamax contract must be signed before development can commence — critical path item",
    },
    {
      id: "t-4-2", phase_id: "ph-t4", wbs: "4.2",
      name: "Scorecard & Workflow Configuration",
      owner: "Panamax + Rukisha", start_date: "2026-03-24", end_date: "2026-03-31", status: "in_progress",
      remarks: "Scoring & NPL management meeting scheduled for Monday — credit band definitions and NPL policy to be agreed",
    },
    {
      id: "t-4-3", phase_id: "ph-t4", wbs: "4.3",
      name: "TransUnion Bureau Integration",
      owner: "Rukisha + Panamax", start_date: "2026-03-26", end_date: "2026-04-05", status: "not_started",
      remarks: "TransUnion submitted a proposal; Rukisha yet to respond — decision required",
    },
    {
      id: "t-4-4", phase_id: "ph-t4", wbs: "4.4",
      name: "Production Environment Installation & Configuration",
      owner: "Hosting Vendor (TBD)", start_date: "2026-04-13", end_date: "2026-04-20", status: "not_started",
      remarks: null,
    },
    {
      id: "t-4-5", phase_id: "ph-t4", wbs: "4.5",
      name: "System Integration, QA & Deployment",
      owner: "Panamax + Rukisha + I&M + MTN", start_date: "2026-04-20", end_date: "2026-05-05", status: "not_started",
      remarks: null,
    },

    // ── PHASE 5: Training & UAT ──────────────────────────────────────────────
    {
      id: "t-5-1", phase_id: "ph-t5", wbs: "5.1",
      name: "Training & Knowledge Transfer",
      owner: "Panamax + Rukisha", start_date: "2026-05-18", end_date: "2026-05-20", status: "not_started",
      remarks: null,
    },
    {
      id: "t-5-2", phase_id: "ph-t5", wbs: "5.2",
      name: "User Acceptance Testing (UAT)",
      owner: "Rukisha + I&M + Panamax", start_date: "2026-05-20", end_date: "2026-05-25", status: "not_started",
      remarks: null,
    },
    {
      id: "t-5-3", phase_id: "ph-t5", wbs: "5.3",
      name: "Stakeholder UAT Review & Sign-off",
      owner: "Rukisha", start_date: "2026-05-26", end_date: "2026-05-26", status: "not_started",
      remarks: null,
    },
    {
      id: "t-5-4", phase_id: "ph-t5", wbs: "5.4",
      name: "Production Deployment & Migration",
      owner: "Panamax", start_date: "2026-05-27", end_date: "2026-05-28", status: "not_started",
      remarks: null,
    },

    // ── PHASE 6: Go Live ─────────────────────────────────────────────────────
    {
      id: "t-6-1", phase_id: "ph-t6", wbs: "6.1",
      name: "Go Live",
      owner: "Panamax + Rukisha", start_date: "2026-05-29", end_date: "2026-05-30", status: "not_started",
      remarks: null,
    },
    {
      id: "t-6-2", phase_id: "ph-t6", wbs: "6.2",
      name: "Hypercare & Early Merchant Support",
      owner: "Panamax + Rukisha", start_date: "2026-05-30", end_date: "2026-06-24", status: "not_started",
      remarks: null,
    },

    // ── PHASE 7: Marketing ───────────────────────────────────────────────────
    {
      id: "t-7-1", phase_id: "ph-t7", wbs: "7.1",
      name: "Product Name Definition",
      owner: "Product + Marketing", start_date: "2026-03-02", end_date: "2026-03-11", status: "not_started",
      remarks: "TBD — must be defined before any marketing or merchant-facing materials can be produced",
    },
    {
      id: "t-7-2", phase_id: "ph-t7", wbs: "7.2",
      name: "Marketing Strategy Definition",
      owner: "Rukisha + MTN", start_date: "2026-04-20", end_date: "2026-04-27", status: "not_started",
      remarks: "Dependent on product name being confirmed",
    },
    {
      id: "t-7-3", phase_id: "ph-t7", wbs: "7.3",
      name: "Launch Collateral Preparation",
      owner: "Rukisha", start_date: "2026-04-28", end_date: "2026-05-05", status: "not_started",
      remarks: null,
    },
    {
      id: "t-7-4", phase_id: "ph-t7", wbs: "7.4",
      name: "Pre-Go Live Merchant Campaigns",
      owner: "Rukisha", start_date: "2026-05-05", end_date: "2026-05-15", status: "not_started",
      remarks: null,
    },
    {
      id: "t-7-5", phase_id: "ph-t7", wbs: "7.5",
      name: "Official Product Launch",
      owner: "Rukisha + MTN", start_date: "2026-05-29", end_date: "2026-06-04", status: "not_started",
      remarks: null,
    },

    // ── OPS PHASE 0: Legal & Contractual ────────────────────────────────────
    {
      id: "o-0-1", phase_id: "ph-o0", wbs: "0.1",
      name: "Finalize NDAs (Tripartite & Bilateral)",
      owner: "All Partners", start_date: "2026-03-02", end_date: "2026-03-04", status: "not_started",
      remarks: null,
    },
    {
      id: "o-0-2", phase_id: "ph-o0", wbs: "0.2",
      name: "Master Services Agreement Sign-off",
      owner: "Rukisha + Panamax", start_date: "2026-03-02", end_date: "2026-03-06", status: "not_started",
      remarks: null,
    },
    {
      id: "o-0-3", phase_id: "ph-o0", wbs: "0.3",
      name: "SLAs and Compliance Clauses Defined",
      owner: "Rukisha + Partners", start_date: "2026-03-02", end_date: "2026-03-06", status: "in_progress",
      remarks: "MTN Rwanda SLA received (98% uptime, 4hr weekday response). I&M Bank SLA pending",
    },
    {
      id: "o-0-4", phase_id: "ph-o0", wbs: "0.4",
      name: "Commercial Agreement with I&M Bank Rwanda",
      owner: "Rukisha + I&M", start_date: "2026-03-06", end_date: "2026-03-11", status: "not_started",
      remarks: "Scope contract with I&M Bank Rwanda pending finalisation",
    },
    {
      id: "o-0-5", phase_id: "ph-o0", wbs: "0.5",
      name: "Contract & NDA with TransUnion",
      owner: "Rukisha", start_date: "2026-03-02", end_date: "2026-03-11", status: "not_started",
      remarks: "TransUnion submitted bureau data proposal; Rukisha has not yet responded",
    },
    {
      id: "o-0-6", phase_id: "ph-o0", wbs: "0.6",
      name: "Tripartite Commercial Discussion (MTN / Rukisha / I&M)",
      owner: "All Partners", start_date: "2026-03-06", end_date: "2026-03-16", status: "not_started",
      remarks: "Revenue share, governance and operational SLAs yet to be formally agreed",
    },
    {
      id: "o-0-7", phase_id: "ph-o0", wbs: "0.7",
      name: "Sign Panamax Development Contract",
      owner: "Rukisha + Panamax", start_date: "2026-03-02", end_date: "2026-03-08", status: "not_started",
      remarks: "CRITICAL PATH — development cannot start until this is executed",
    },

    // ── OPS PHASE 1: Regulatory ──────────────────────────────────────────────
    {
      id: "o-1-1", phase_id: "ph-o1", wbs: "1.1",
      name: "BNR Digital Lending Compliance Review",
      owner: "Rukisha + I&M Bank", start_date: "2026-03-02", end_date: "2026-03-16", status: "in_progress",
      remarks: "Product operates under I&M Bank's lending licence — no separate Rukisha licence required",
    },
    {
      id: "o-1-2", phase_id: "ph-o1", wbs: "1.2",
      name: "NCSA Cybersecurity Application",
      owner: "Rukisha", start_date: "2026-03-02", end_date: "2026-03-16", status: "not_started",
      remarks: null,
    },
    {
      id: "o-1-3", phase_id: "ph-o1", wbs: "1.3",
      name: "RDB Integration — Business Registry Meeting",
      owner: "Technical + Legal", start_date: "2026-03-06", end_date: "2026-03-21", status: "not_started",
      remarks: "Meeting with RDB required to explore API access to business registry for KYB/loan origination verification",
    },
    {
      id: "o-1-4", phase_id: "ph-o1", wbs: "1.4",
      name: "RRA Tax Compliance Meeting",
      owner: "Legal + Finance", start_date: "2026-03-06", end_date: "2026-03-21", status: "not_started",
      remarks: "Meeting with Rwanda Revenue Authority pending — clarify product tax obligations and explore RRA data as scoring signal",
    },
    {
      id: "o-1-5", phase_id: "ph-o1", wbs: "1.5",
      name: "Operational Steering Committee Established",
      owner: "Rukisha + I&M", start_date: "2026-03-16", end_date: "2026-03-16", status: "not_started",
      remarks: null,
    },
    {
      id: "o-1-6", phase_id: "ph-o1", wbs: "1.6",
      name: "Product Name Definition",
      owner: "Product + Marketing", start_date: "2026-03-02", end_date: "2026-03-11", status: "not_started",
      remarks: "TBD — blocks all marketing, branding and merchant-facing material development",
    },

    // ── OPS PHASE 2: People ──────────────────────────────────────────────────
    {
      id: "o-2-1", phase_id: "ph-o2", wbs: "2.1",
      name: "Office Space Setup",
      owner: "Rukisha", start_date: "2026-03-02", end_date: "2026-03-21", status: "not_started",
      remarks: null,
    },
    {
      id: "o-2-2", phase_id: "ph-o2", wbs: "2.2",
      name: "Key Staff Recruitment",
      owner: "Rukisha", start_date: "2026-03-06", end_date: "2026-03-31", status: "not_started",
      remarks: null,
    },
    {
      id: "o-2-3", phase_id: "ph-o2", wbs: "2.3",
      name: "Internal SOPs Defined",
      owner: "Rukisha + Panamax", start_date: "2026-03-23", end_date: "2026-03-31", status: "not_started",
      remarks: null,
    },
    {
      id: "o-2-4", phase_id: "ph-o2", wbs: "2.4",
      name: "Operations Team Training",
      owner: "Panamax + Rukisha", start_date: "2026-05-18", end_date: "2026-05-20", status: "not_started",
      remarks: null,
    },

    // ── OPS PHASE 3: Risk & Compliance ───────────────────────────────────────
    {
      id: "o-3-1", phase_id: "ph-o3", wbs: "3.1",
      name: "Define Risk Policies, Credit Limits & NPL Framework",
      owner: "All Partners", start_date: "2026-03-21", end_date: "2026-04-05", status: "in_progress",
      remarks: "Scoring & NPL management meeting scheduled for Monday — credit band definitions, risk appetite and provisioning policy to be agreed",
    },
    {
      id: "o-3-2", phase_id: "ph-o3", wbs: "3.2",
      name: "Draft & Approve Loan T&Cs + Privacy Policy",
      owner: "Rukisha + I&M + Panamax", start_date: "2026-04-06", end_date: "2026-04-16", status: "not_started",
      remarks: null,
    },
    {
      id: "o-3-3", phase_id: "ph-o3", wbs: "3.3",
      name: "Prepare Regulatory Reporting Formats",
      owner: "Rukisha", start_date: "2026-04-17", end_date: "2026-04-25", status: "not_started",
      remarks: null,
    },

    // ── OPS PHASE 4: Reconciliation ──────────────────────────────────────────
    {
      id: "o-4-1", phase_id: "ph-o4", wbs: "4.1",
      name: "Setup Reconciliation Workflows",
      owner: "Panamax + Rukisha", start_date: "2026-04-26", end_date: "2026-05-02", status: "not_started",
      remarks: null,
    },
    {
      id: "o-4-2", phase_id: "ph-o4", wbs: "4.2",
      name: "Settlement Ledger Design",
      owner: "Panamax + Rukisha", start_date: "2026-05-03", end_date: "2026-05-10", status: "not_started",
      remarks: null,
    },

    // ── OPS PHASE 5: Marketing ───────────────────────────────────────────────
    {
      id: "o-5-1", phase_id: "ph-o5", wbs: "5.1",
      name: "Hire Marketing Agency",
      owner: "Rukisha", start_date: "2026-03-11", end_date: "2026-03-21", status: "not_started",
      remarks: null,
    },
    {
      id: "o-5-2", phase_id: "ph-o5", wbs: "5.2",
      name: "Set Marketing OKRs and KPIs",
      owner: "Marketing Agency", start_date: "2026-03-22", end_date: "2026-03-31", status: "not_started",
      remarks: null,
    },
    {
      id: "o-5-3", phase_id: "ph-o5", wbs: "5.3",
      name: "Define Go-to-Market Strategy",
      owner: "Marketing Agency", start_date: "2026-04-01", end_date: "2026-04-10", status: "not_started",
      remarks: null,
    },
    {
      id: "o-5-4", phase_id: "ph-o5", wbs: "5.4",
      name: "Produce All Marketing Assets",
      owner: "Marketing Agency", start_date: "2026-05-05", end_date: "2026-05-15", status: "not_started",
      remarks: null,
    },
    {
      id: "o-5-5", phase_id: "ph-o5", wbs: "5.5",
      name: "Media Plan Execution",
      owner: "Marketing Agency", start_date: "2026-03-31", end_date: "2026-05-15", status: "not_started",
      remarks: null,
    },
    {
      id: "o-5-6", phase_id: "ph-o5", wbs: "5.6",
      name: "Setup Customer Support Channels",
      owner: "Marketing Agency", start_date: "2026-04-15", end_date: "2026-05-05", status: "not_started",
      remarks: null,
    },
  ],
};
