"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import type { PlanSummary } from "../buildSlides";
import { P, MOTION } from "../tokens";
import { SlideShell, Bar, KpiCard, ArcProgress, fmtDate } from "../primitives";
import { WorkstreamChart } from "../charts";

export function SlideOverview({ project, plans }: { project: Project; plans: PlanSummary[] }) {
  const totalDone     = plans.reduce((a, p) => a + p.stats.completed, 0);
  const totalNA       = plans.reduce((a, p) => a + p.stats.not_applicable, 0);
  const totalTasks    = plans.reduce((a, p) => a + p.stats.total, 0);
  const totalActive   = plans.reduce((a, p) => a + p.stats.in_progress, 0);
  const totalBlocked  = plans.reduce((a, p) => a + p.stats.blocked, 0);
  const totalCritical = plans.reduce((a, p) => a + p.stats.critical, 0);
  const active        = totalTasks - totalNA;
  const pct           = active > 0 ? Math.round((totalDone / active) * 100) : 0;
  const now           = new Date();
  const startDate     = project.start_date  ? new Date(project.start_date)  : null;
  const targetDate    = project.target_date ? new Date(project.target_date) : null;
  const totalDays     = startDate && targetDate ? Math.round((targetDate.getTime() - startDate.getTime()) / 86_400_000) : 0;
  const dayElapsed    = startDate && targetDate ? Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / 86_400_000)) : 0;
  const timePct       = totalDays > 0 ? Math.min(100, Math.round((dayElapsed / totalDays) * 100)) : 0;
  const daysLeft      = targetDate ? Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / 86_400_000)) : null;

  const chartData = plans.map(({ plan, stats }) => {
    const a = stats.total - stats.not_applicable;
    return { name: plan.name, pct: a > 0 ? Math.round((stats.completed / a) * 100) : 0 };
  });

  return (
    <SlideShell>
      {/* Hero row */}
      <motion.div {...MOTION.fadeUp()} style={{ display: "flex", alignItems: "flex-start", gap: "1.75rem" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 9, color: P.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 8 }}>
            Executive Status Update
          </p>
          <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.4rem)", fontWeight: 900, color: P.ivory, lineHeight: 1.08, margin: 0 }}>
            {project.name}
          </h1>
          {project.description && (
            <p style={{ fontSize: 13, color: P.stone, marginTop: 8, lineHeight: 1.65, maxWidth: 460 }}>
              {project.description}
            </p>
          )}
          {startDate && targetDate && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <span style={{ fontSize: 11, color: P.stone }}>{fmtDate(startDate)}</span>
              <span style={{ color: P.gold, fontSize: 10, opacity: 0.7 }}>→</span>
              <span style={{ fontSize: 11, color: P.ivory, fontWeight: 600 }}>{fmtDate(targetDate)}</span>
              {daysLeft !== null && (
                <span style={{ fontSize: 10, fontWeight: 700, marginLeft: 6, color: daysLeft <= 14 ? P.coral : P.muted }}>
                  {daysLeft}d remaining
                </span>
              )}
            </div>
          )}
        </div>
        <ArcProgress pct={pct} sz={118} />
      </motion.div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.65rem" }}>
        <KpiCard label="Tasks Complete"  value={totalDone}     sub={`of ${active} active`}            accent={P.sage}  delay={0.05} />
        <KpiCard label="In Progress"     value={totalActive}   sub="active now"                       accent={P.teal}  delay={0.1}  />
        <KpiCard label="Blocked"         value={totalBlocked}  sub="need resolution"                  accent={totalBlocked  > 0 ? P.coral   : P.muted} delay={0.15} />
        <KpiCard label="Critical"        value={totalCritical} sub="require escalation"               accent={totalCritical > 0 ? "#E07B39" : P.muted} delay={0.2}  />
      </div>

      {/* Timeline */}
      {startDate && targetDate && (
        <motion.div {...MOTION.fadeUp(0.15)} style={{ background: P.slate, border: `1px solid ${P.border}`, borderRadius: 12, padding: "0.75rem 1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 9, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Timeline</span>
            <span style={{ fontSize: 10, color: P.muted }}>Day {dayElapsed} of {totalDays}</span>
          </div>
          <Bar pct={timePct} color={P.teal} h={5} delay={0.3} />
        </motion.div>
      )}

      {/* Workstream chart */}
      <motion.div {...MOTION.fadeUp(0.2)} style={{ flex: 1, background: P.slate, border: `1px solid ${P.border}`, borderRadius: 14, padding: "0.9rem 1rem", overflow: "hidden" }}>
        <p style={{ fontSize: 9, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 10 }}>
          Workstream Completion
        </p>
        {chartData.length > 0 ? (
          <WorkstreamChart data={chartData} />
        ) : (
          <p style={{ fontSize: 12, color: P.muted, fontStyle: "italic" }}>No workstreams defined yet.</p>
        )}
      </motion.div>
    </SlideShell>
  );
}
