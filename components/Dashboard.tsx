"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Plan, Project, ProjectStats, Task } from "@/lib/types";
import { ProjectHealthScore, AIInsightPanel } from "./IntelligenceLayer";
import { EditProjectModal } from "./EditProjectModal";
import StatusUpdateModal from "./StatusUpdateModal";
import { MetricTile } from "./primitives/MetricTile";
import { StatusBadge } from "./primitives/StatusBadge";
import { ProgressBar } from "./primitives/ProgressBar";
import { TimelineItem } from "./primitives/TimelineItem";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

interface PlanSummary { plan: Plan; stats: ProjectStats }

const STATUS_COLORS = [
  { key: "completed",   color: "#22c55e" },
  { key: "critical",    color: "#db2777" },
  { key: "in_progress", color: "#14b8a6" },
  { key: "blocked",     color: "#f59e0b" },
  { key: "not_started", color: "#475569" },
];

function WorkstreamCard({ data, href }: { data: PlanSummary; href: string }) {
  const { plan, stats } = data;
  const active = stats.total - stats.not_applicable;
  const pct    = active ? Math.round((stats.completed / active) * 100) : 0;
  const accent = !plan.color.includes("bg-") ? plan.color : "#14b8a6";

  const barVariant: "primary" | "success" | "warning" | "danger" =
    pct >= 75 ? "success" :
    stats.critical > 0 ? "danger" :
    stats.blocked > 0 ? "warning" :
    "primary";

  return (
    <motion.div variants={item}>
      <Link href={href} className="group block h-full">
        <div className="h-full bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:border-border-medium hover:shadow-premium hover:-translate-y-0.5">
          {/* Name row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
              <span className="text-sm font-semibold text-secondary group-hover:text-contrast transition-colors truncate">
                {plan.name}
              </span>
            </div>
            <span className="shrink-0 text-border-medium group-hover:text-accent-primary transition-colors duration-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[32px] font-bold tracking-tighter text-contrast tabular-nums leading-none">
                {pct}<span className="text-base text-muted font-normal ml-0.5">%</span>
              </span>
              <span className="text-[11px] font-medium text-muted tabular-nums">
                {stats.completed}/{active}
              </span>
            </div>
            <ProgressBar pct={pct} variant={barVariant} size="sm" shimmer={false} />
          </div>

          {/* Status dots */}
          <div className="flex items-center gap-1.5">
            {STATUS_COLORS.map(({ key, color }) => {
              const count = stats[key as keyof ProjectStats] as number;
              if (!count) return null;
              return (
                <div
                  key={key}
                  className="w-3 h-3 rounded-full border-[1.5px] border-slate-950/70"
                  style={{ backgroundColor: color }}
                  title={`${count} ${key}`}
                />
              );
            })}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Dashboard({
  project,
  plans,
}: {
  project: Project;
  plans: PlanSummary[];
}) {
  const [editOpen, setEditOpen]   = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const allTasks: Task[] = plans.flatMap(p => p.plan.phases.flatMap(ph => ph.tasks));

  const totalTasks    = plans.reduce((a, p) => a + p.stats.total, 0);
  const totalDone     = plans.reduce((a, p) => a + p.stats.completed, 0);
  const totalBlocked  = plans.reduce((a, p) => a + p.stats.blocked, 0);
  const totalCritical = plans.reduce((a, p) => a + p.stats.critical, 0);
  const totalNA       = plans.reduce((a, p) => a + p.stats.not_applicable, 0);
  const totalActive   = plans.reduce((a, p) => a + p.stats.in_progress, 0);
  const overallPct    = (totalTasks - totalNA) > 0 ? Math.round((totalDone / (totalTasks - totalNA)) * 100) : 0;

  const now        = new Date();
  const startDate  = project.start_date  ? new Date(project.start_date)  : null;
  const targetDate = project.target_date ? new Date(project.target_date) : null;
  const hasTimeline = !!(startDate && targetDate);
  const daysLeft    = hasTimeline ? Math.max(0, Math.ceil((targetDate!.getTime() - now.getTime()) / 86_400_000)) : 0;
  const totalDays   = hasTimeline ? Math.round((targetDate!.getTime() - startDate!.getTime()) / 86_400_000) : 0;
  const dayElapsed  = hasTimeline ? Math.max(0, Math.floor((now.getTime() - startDate!.getTime()) / 86_400_000)) : 0;
  const timelinePct = hasTimeline ? Math.min(100, Math.round((dayElapsed / totalDays) * 100)) : 0;

  const fmtShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const criticalTasks = allTasks
    .filter(t => t.status === "critical")
    .sort((a, b) => (a.deadline && b.deadline) ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime() : 0)
    .slice(0, 5);

  const blockedTasks      = allTasks.filter(t => t.status === "blocked").slice(0, 3);
  const upcomingDeadlines = allTasks
    .filter(t => t.deadline && !["completed", "not_applicable"].includes(t.status))
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 4);

  const isHealthy = totalBlocked === 0 && totalCritical === 0;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="px-8 pt-8 pb-24 max-w-[1440px] mx-auto space-y-4"
    >
      {editOpen && <EditProjectModal project={project} onClose={() => setEditOpen(false)} />}
      <AnimatePresence>
        {statusOpen && <StatusUpdateModal project={project} plans={plans} onClose={() => setStatusOpen(false)} />}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <motion.div variants={item}>
        <div className="relative bg-surface border border-border-subtle rounded-2xl overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-accent-primary/[0.06] blur-[100px] rounded-full pointer-events-none" />
          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-accent-primary/35 to-transparent" />

          <div className="relative p-8 lg:p-10">
            {/* Row 1: status + actions */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${isHealthy ? "text-accent-success" : "text-accent-warning"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? "bg-accent-success animate-pulse" : "bg-accent-warning animate-pulse"}`} />
                  {isHealthy ? "On Track" : "Needs Attention"}
                </span>
                <span className="h-3 w-px bg-border-subtle" />
                <StatusBadge label="Executive Dashboard" variant="primary" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditOpen(true)}
                  className="h-8 px-4 text-[11px] font-semibold text-muted hover:text-contrast bg-surface hover:bg-surface-elevated border border-border-subtle hover:border-border-medium rounded-lg transition-all duration-150"
                >
                  Edit
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStatusOpen(true)}
                  className="h-8 px-5 text-[11px] font-semibold text-white bg-accent-primary hover:brightness-110 rounded-lg transition-all shadow-md shadow-accent-primary/20"
                >
                  Update Status
                </motion.button>
              </div>
            </div>

            {/* Row 2: project name */}
            <h1 className="text-4xl lg:text-[48px] font-bold tracking-tight text-contrast leading-none mb-3 max-w-3xl">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-secondary max-w-xl leading-relaxed mb-8">{project.description}</p>
            )}
            {!project.description && <div className="mb-8" />}

            {/* Row 3: timeline bar */}
            {hasTimeline ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-secondary">{fmtShort(startDate!)}</span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span>
                      <span className="font-bold text-contrast tabular-nums">{timelinePct}%</span>
                      <span className="text-secondary ml-1">elapsed</span>
                    </span>
                    <span className="h-3 w-px bg-border-subtle" />
                    <span>
                      <span className="font-bold text-contrast tabular-nums">{daysLeft}</span>
                      <span className="text-secondary ml-1">days remaining</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-secondary">{fmtShort(targetDate!)}</span>
                </div>
                <div className="relative h-1.5 bg-border-subtle rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${timelinePct}%` }}
                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-y-0 left-0 bg-accent-primary rounded-full"
                  />
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-muted">Timeline not configured — edit the project to set start and target dates.</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── KPIs ── */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Overall Progress"
          value={`${overallPct}%`}
          sub={`${totalDone} of ${totalTasks - totalNA} milestones`}
          trend="↑ +2.4%"
          priority
        />
        <MetricTile
          label="Active Tasks"
          value={totalActive}
          sub={`${totalCritical} critical nodes`}
          trend="↑ Stable"
        />
        <MetricTile
          label="Blocked"
          value={totalBlocked}
          sub={totalBlocked > 0 ? "Needs immediate action" : "No friction detected"}
          trend={totalBlocked > 0 ? "↓ At Risk" : "↑ Clean"}
        />
        <MetricTile
          label="Workstreams"
          value={plans.length}
          sub={`${allTasks.length} tasks total`}
        />
      </motion.div>

      {/* ── INTELLIGENCE ── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <ProjectHealthScore plans={plans} />
        </div>
        <div className="lg:col-span-8">
          <AIInsightPanel plans={plans} />
        </div>
      </motion.div>

      {/* ── WORKSTREAMS ── */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-contrast tracking-tight">Workstreams</h2>
            <p className="text-[11px] text-muted mt-0.5">Functional breakdown of the project roadmap</p>
          </div>
          <Link
            href="/roadmap"
            className="group flex items-center gap-1 text-[11px] font-bold text-accent-primary hover:text-contrast transition-colors"
          >
            View Roadmap
            <svg className="group-hover:translate-x-0.5 transition-transform" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="bg-surface border border-dashed border-border-subtle rounded-2xl p-16 text-center">
            <p className="text-sm text-muted">No workstreams defined yet.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {plans.map((p) => (
              <WorkstreamCard key={p.plan.id} data={p} href={`/plan/${p.plan.id}`} />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* ── CRITICAL PATH + AGENDA ── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Critical Path */}
        <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-7 py-5 border-b border-border-subtle">
            <div>
              <h2 className="text-sm font-bold text-contrast">Critical Path</h2>
              <p className="text-xs text-muted mt-0.5">Highest-priority dependencies</p>
            </div>
            <StatusBadge label="Exec Attention" variant="danger" />
          </div>

          <div className="p-7">
            {criticalTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 border border-dashed border-border-subtle rounded-xl">
                <div className="w-9 h-9 rounded-full bg-accent-success/10 border border-accent-success/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent-success"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <p className="text-sm text-muted">No critical items. Trajectory is nominal.</p>
              </div>
            ) : (
              <div className="relative pl-9 space-y-9 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-accent-secondary/50 before:via-accent-secondary/10 before:to-transparent">
                {criticalTasks.map(t => (
                  <TimelineItem
                    key={t.id}
                    title={t.name}
                    subtitle={t.wbs}
                    owner={t.owner}
                    date={t.deadline ? new Date(t.deadline) : undefined}
                    status="danger"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming Deadlines */}
          <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border-subtle">
              <h2 className="text-sm font-bold text-contrast">Upcoming Deadlines</h2>
            </div>
            <div className="p-6">
              {upcomingDeadlines.length === 0 ? (
                <div className="py-6 text-center rounded-xl bg-surface-elevated">
                  <p className="text-xs text-muted">No upcoming deadlines.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingDeadlines.map(t => (
                    <motion.div key={t.id} whileHover={{ x: 2 }} className="flex gap-3.5 group cursor-default">
                      <div className="shrink-0 flex flex-col items-center justify-center w-11 h-11 bg-surface-elevated border border-border-subtle rounded-xl group-hover:bg-accent-primary/[0.07] group-hover:border-accent-primary/[0.12] transition-all duration-200">
                        <span className="text-[9px] font-medium text-muted uppercase leading-none">
                          {new Date(t.deadline!).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-sm font-bold text-contrast leading-tight">
                          {new Date(t.deadline!).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-[13px] font-semibold text-secondary group-hover:text-contrast transition-colors truncate">{t.name}</p>
                        <p className="text-[10px] text-muted mt-0.5">Upcoming</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Blockers */}
          {blockedTasks.length > 0 && (
            <div className="bg-accent-secondary/[0.03] border border-accent-secondary/[0.15] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-6 py-5 border-b border-accent-secondary/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse" />
                <h2 className="text-sm font-bold text-accent-secondary">Blocked</h2>
                <span className="ml-auto text-xs text-accent-secondary/50">{blockedTasks.length} stalled</span>
              </div>
              <div className="p-6">
                <ul className="space-y-3.5">
                  {blockedTasks.map(t => (
                    <motion.li key={t.id} whileHover={{ x: 2 }} className="flex items-start gap-3 group cursor-default">
                      <div className="mt-0.5 shrink-0 text-accent-secondary/40 group-hover:text-accent-secondary/70 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-accent-secondary/70 group-hover:text-accent-secondary transition-colors truncate">{t.name}</p>
                        <p className="text-[10px] text-muted mt-0.5">{t.wbs} · {t.owner}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
