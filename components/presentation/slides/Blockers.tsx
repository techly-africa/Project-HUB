"use client";

import { motion } from "framer-motion";
import type { PlanSummary } from "../buildSlides";
import { P, MOTION } from "../tokens";
import { SlideShell, SlideHeader, TaskRow } from "../primitives";
import { RiskChart } from "../charts";

export function SlideBlockers({ plans }: { plans: PlanSummary[] }) {
  const now = new Date();

  const blocked  = plans.flatMap(({ plan }) => plan.phases.flatMap(ph => ph.tasks.filter(t => t.status === "blocked" || t.blocked_by?.length).map(t => ({ ...t, planName: plan.name }))));
  const critical = plans.flatMap(({ plan }) => plan.phases.flatMap(ph => ph.tasks.filter(t => t.status === "critical").map(t => ({ ...t, planName: plan.name })))).sort((a, b) => (!a.deadline ? 1 : !b.deadline ? -1 : new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
  const overdue  = plans.flatMap(({ plan }) => plan.phases.flatMap(ph => ph.tasks.filter(t => t.deadline && !["completed","not_applicable"].includes(t.status) && new Date(t.deadline) < now).map(t => ({ ...t, planName: plan.name })))).slice(0, 6);
  const allClear = !blocked.length && !critical.length && !overdue.length;

  if (allClear) return (
    <SlideShell>
      <SlideHeader eyebrow="Blockers & Risks" title="No Blockers Identified" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <motion.div
          {...MOTION.scale(0.1)}
          style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(125,155,118,0.1)", border: `2px solid rgba(125,155,118,0.3)`, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="28" height="28" viewBox="0 0 20 20" fill={P.sage}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
        </motion.div>
        <p style={{ fontSize: 18, fontWeight: 700, color: P.sage }}>Project is on track</p>
        <p style={{ fontSize: 13, color: P.muted }}>No items require escalation at this time.</p>
      </div>
    </SlideShell>
  );

  const cols = [
    { label: "Blocked",  items: blocked,  accent: P.coral,    bg: "rgba(224,122,95,0.07)",  bdr: "rgba(224,122,95,0.2)"  },
    { label: "Critical", items: critical, accent: "#E07B39",  bg: "rgba(224,123,57,0.07)",  bdr: "rgba(224,123,57,0.2)"  },
    { label: "Overdue",  items: overdue,  accent: P.gold,     bg: "rgba(201,169,98,0.06)",  bdr: "rgba(201,169,98,0.15)" },
  ];

  return (
    <SlideShell>
      <SlideHeader
        eyebrow="Blockers & Risks"
        title={<><span style={{ color: P.coral }}>{blocked.length + critical.length}</span> items need immediate attention</>}
      />

      {/* Recharts risk summary */}
      <motion.div {...MOTION.fadeUp(0.1)} style={{ background: P.slate, border: `1px solid ${P.border}`, borderRadius: 14, padding: "0.75rem 1rem" }}>
        <p style={{ fontSize: 9, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 8 }}>Risk Overview</p>
        <RiskChart blocked={blocked.length} critical={critical.length} overdue={overdue.length} />
      </motion.div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.65rem", overflow: "auto" }}>
        {cols.map((col, ci) => (
          <motion.div key={col.label} {...MOTION.scale(ci * 0.07)} style={{ background: col.bg, border: `1px solid ${col.bdr}`, borderRadius: 14, padding: "0.85rem 0.95rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: col.accent, textTransform: "uppercase", letterSpacing: "0.2em" }}>{col.label}</p>
              <span style={{ fontSize: 26, fontWeight: 900, color: col.accent, lineHeight: 1 }}>{col.items.length}</span>
            </div>
            {col.items.length === 0
              ? <p style={{ fontSize: 11, color: P.muted, fontStyle: "italic" }}>None.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {col.items.slice(0, 5).map((t, i) => <TaskRow key={t.id} task={t} idx={i} />)}
                  {col.items.length > 5 && <p style={{ fontSize: 10, color: P.muted }}>+{col.items.length - 5} more</p>}
                </div>
            }
          </motion.div>
        ))}
      </div>
    </SlideShell>
  );
}
