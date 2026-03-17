"use client";

import { motion } from "framer-motion";
import type { PlanSummary } from "../buildSlides";
import { P, MOTION } from "../tokens";
import { SlideShell, SlideHeader, Bar, TaskRow } from "../primitives";
import { useCountUp } from "../hooks";

export function SlideInProgress({ plans }: { plans: PlanSummary[] }) {
  const byPlan = plans.map(({ plan }) => ({
    plan,
    tasks: plan.phases.flatMap(ph => ph.tasks.filter(t => t.status === "in_progress")),
  })).filter(g => g.tasks.length > 0);

  const total = byPlan.reduce((a, g) => a + g.tasks.length, 0);
  const n     = useCountUp(total);

  return (
    <SlideShell>
      <SlideHeader
        eyebrow="In Progress"
        title={<><span style={{ color: P.teal }}>{n}</span> tasks currently active</>}
      />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(275px,1fr))", gap: "0.65rem", overflow: "auto" }}>
        {byPlan.map(({ plan, tasks }, pi) => {
          const totalPhTasks = plan.phases.flatMap(ph => ph.tasks).length;
          const donePct      = totalPhTasks > 0 ? Math.round((plan.phases.flatMap(ph => ph.tasks).filter(t => t.status === "completed").length / totalPhTasks) * 100) : 0;

          return (
            <motion.div
              key={plan.id}
              {...MOTION.scale(pi * 0.06)}
              style={{ background: P.slate, border: `1px solid ${P.border}`, borderRadius: 14, padding: "0.85rem 0.95rem", display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: P.teal, flexShrink: 0 }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: P.teal, textTransform: "uppercase", letterSpacing: "0.15em", flex: 1 }}>{plan.name}</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: P.muted }}>{tasks.length} active</span>
              </div>
              <Bar pct={donePct} color={P.teal} h={3} delay={pi * 0.07} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {tasks.slice(0, 6).map((t, i) => <TaskRow key={t.id} task={t} idx={i} />)}
                {tasks.length > 6 && (
                  <p style={{ fontSize: 10, color: P.muted, paddingLeft: 14, fontStyle: "italic" }}>
                    +{tasks.length - 6} more active
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </SlideShell>
  );
}
