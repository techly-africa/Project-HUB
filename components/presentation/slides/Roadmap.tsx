"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import type { PlanSummary } from "../buildSlides";
import { P, MOTION } from "../tokens";
import { SlideShell, SlideHeader, Bar, fmtDate } from "../primitives";

export function SlideRoadmap({ project, plans }: { project: Project; plans: PlanSummary[] }) {
  const now        = new Date();
  const startDate  = project.start_date  ? new Date(project.start_date)  : null;
  const targetDate = project.target_date ? new Date(project.target_date) : null;
  const totalDays  = startDate && targetDate ? Math.round((targetDate.getTime() - startDate.getTime()) / 86_400_000) : 0;
  const dayElapsed = startDate && targetDate ? Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / 86_400_000)) : 0;
  const timePct    = totalDays > 0 ? Math.min(100, Math.round((dayElapsed / totalDays) * 100)) : 0;

  const phases = plans.flatMap(({ plan }) =>
    plan.phases.map(ph => ({ ...ph, planName: plan.name }))
  ).sort((a, b) => a.wbs.localeCompare(b.wbs));

  const STATUS_COLOR: Record<string, string> = {
    completed:   P.sage,
    in_progress: P.teal,
    critical:    P.coral,
    blocked:     P.coral,
    not_started: P.muted,
  };

  return (
    <SlideShell>
      <SlideHeader
        eyebrow="Project Roadmap"
        title={<>Milestones <span style={{ color: P.gold }}>Overview</span></>}
      />

      {/* Timeline bar */}
      {startDate && targetDate && (
        <motion.div {...MOTION.fadeUp(0.1)} style={{ background: P.slate, border: `1px solid ${P.border}`, borderRadius: 12, padding: "0.75rem 1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ fontSize: 11, color: P.stone }}>{fmtDate(startDate)}</span>
            <span style={{ fontSize: 9, color: P.muted, fontWeight: 700 }}>Day {dayElapsed} of {totalDays} · {timePct}% elapsed</span>
            <span style={{ fontSize: 11, color: P.ivory, fontWeight: 600 }}>{fmtDate(targetDate)}</span>
          </div>
          <Bar pct={timePct} color={P.teal} h={5} delay={0.2} />
        </motion.div>
      )}

      {/* Phase grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(235px,1fr))", gap: "0.65rem", overflow: "auto" }}>
        {phases.map((ph, idx) => {
          const total = ph.tasks.length;
          const done  = ph.tasks.filter(t => t.status === "completed").length;
          const p     = total ? Math.round((done / total) * 100) : 0;

          return (
            <motion.div
              key={ph.id}
              {...MOTION.scale(idx * 0.045)}
              style={{ background: P.slate, border: `1px solid ${P.border}`, borderRadius: 13, padding: "0.8rem 0.9rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                {/* WBS badge */}
                <span style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 900, color: P.gold, flexShrink: 0,
                }}>
                  {ph.wbs}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 8, color: P.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{ph.planName}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: P.ivory, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ph.name}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 900, color: P.gold, flexShrink: 0 }}>{p}%</span>
              </div>

              <Bar pct={p} color={P.gold} h={3} delay={idx * 0.045} />

              {/* Task chips */}
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 7 }}>
                {ph.tasks.slice(0, 7).map(t => (
                  <span key={t.id} title={t.name} style={{
                    padding: "2px 5px", borderRadius: 5, fontSize: 8, fontWeight: 700,
                    background: `${STATUS_COLOR[t.status] ?? P.muted}18`,
                    color: STATUS_COLOR[t.status] ?? P.muted,
                    border: `1px solid ${STATUS_COLOR[t.status] ?? P.muted}30`,
                  }}>
                    {t.wbs}
                  </span>
                ))}
                {ph.tasks.length > 7 && (
                  <span style={{ fontSize: 8, color: P.muted }}>+{ph.tasks.length - 7}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      {plans.length > 1 && (
        <motion.div {...MOTION.fadeUp(0.3)} style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem 1.5rem", paddingTop: 8, borderTop: `1px solid ${P.borderSub}` }}>
          {plans.map(({ plan }) => (
            <div key={plan.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: P.gold, opacity: 0.7 }} />
              <span style={{ fontSize: 9, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>{plan.name}</span>
            </div>
          ))}
        </motion.div>
      )}
    </SlideShell>
  );
}
