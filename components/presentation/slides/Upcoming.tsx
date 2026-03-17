"use client";

import { motion } from "framer-motion";
import type { PlanSummary } from "../buildSlides";
import { P, MOTION } from "../tokens";
import { SlideShell, SlideHeader, TaskRow, fmtDate } from "../primitives";

export function SlideUpcoming({ plans }: { plans: PlanSummary[] }) {
  const now  = new Date();
  const soon = new Date(now.getTime() + 14 * 86_400_000);

  const items = plans.flatMap(({ plan }) =>
    plan.phases.flatMap(ph =>
      ph.tasks
        .filter(t => t.deadline && !["completed","not_applicable"].includes(t.status) && new Date(t.deadline) <= soon)
        .map(t => ({ ...t, planName: plan.name }))
    )
  ).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const overdue  = items.filter(t => new Date(t.deadline!) < now);
  const upcoming = items.filter(t => new Date(t.deadline!) >= now);
  const hasBoth  = overdue.length > 0 && upcoming.length > 0;

  return (
    <SlideShell>
      <SlideHeader
        eyebrow="Upcoming Deadlines"
        title={
          overdue.length > 0
            ? <><span style={{ color: P.coral }}>{overdue.length} overdue</span>{upcoming.length > 0 ? <span style={{ color: P.stone, fontWeight: 400 }}> · {upcoming.length} due in 14 days</span> : ""}</>
            : <><span style={{ color: P.gold }}>{upcoming.length}</span> deadlines in the next 14 days</>
        }
      />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: hasBoth ? "1fr 1fr" : "1fr", gap: "0.65rem", overflow: "auto" }}>
        {overdue.length > 0 && (
          <motion.div
            {...MOTION.scale(0)}
            style={{ background: "rgba(224,122,95,0.07)", border: "1px solid rgba(224,122,95,0.2)", borderRadius: 14, padding: "0.85rem 0.95rem" }}
          >
            <p style={{ fontSize: 9, fontWeight: 700, color: P.coral, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 10 }}>
              Overdue — Requires Escalation
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {overdue.map((t, i) => <TaskRow key={t.id} task={t as any} idx={i} />)}
            </div>
          </motion.div>
        )}

        {upcoming.length > 0 && (
          <motion.div
            {...MOTION.scale(0.06)}
            style={{ background: P.slate, border: `1px solid ${P.border}`, borderRadius: 14, padding: "0.85rem 0.95rem" }}
          >
            <p style={{ fontSize: 9, fontWeight: 700, color: P.gold, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 10 }}>
              Due in 14 Days
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {upcoming.slice(0, 9).map((t, i) => <TaskRow key={t.id} task={t as any} idx={i} />)}
            </div>
          </motion.div>
        )}
      </div>
    </SlideShell>
  );
}
