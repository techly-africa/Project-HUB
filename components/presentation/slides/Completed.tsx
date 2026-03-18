"use client";

import { motion } from "framer-motion";
import type { PlanSummary } from "../buildSlides";
import { P, MOTION } from "../tokens";
import { SlideShell, SlideHeader, TaskRow } from "../primitives";
import { useCountUp } from "../hooks";

export function SlideCompleted({ plans }: { plans: PlanSummary[] }) {
  const byPlan = plans.map(({ plan }) => ({
    plan,
    tasks: plan.phases.flatMap(ph => ph.tasks.filter(t => t.status === "completed")),
  })).filter(g => g.tasks.length > 0);

  const total = byPlan.reduce((a, g) => a + g.tasks.length, 0);
  const n     = useCountUp(total);

  return (
    <SlideShell>
      <SlideHeader
        eyebrow="Completed Work"
        title={<><span style={{ color: P.sage }}>{n}</span> tasks delivered</>}
      />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(275px,1fr))", gap: "0.65rem", overflow: "auto" }}>
        {byPlan.map(({ plan, tasks }, pi) => (
          <motion.div
            key={plan.id}
            {...MOTION.scale(pi * 0.06)}
            style={{ background: P.slate, border: `1px solid ${P.border}`, borderRadius: 14, padding: "0.85rem 0.95rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: P.sage, flexShrink: 0 }} />
              <p style={{ fontSize: 10, fontWeight: 700, color: P.sage, textTransform: "uppercase", letterSpacing: "0.15em", flex: 1 }}>{plan.name}</p>
              <span style={{ fontSize: 11, fontWeight: 700, color: P.muted }}>{tasks.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {tasks.slice(0, 7).map((t, i) => <TaskRow key={t.id} task={t} idx={i} />)}
              {tasks.length > 7 && (
                <p style={{ fontSize: 10, color: P.muted, paddingLeft: 14, fontStyle: "italic" }}>
                  +{tasks.length - 7} more completed
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </SlideShell>
  );
}
