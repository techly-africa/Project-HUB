"use client";

import { useState } from "react";
import Link from "next/link";
import type { Plan, Project, ProjectStats, Task } from "@/lib/types";
import { EditProjectModal } from "./EditProjectModal";

interface PlanSummary { plan: Plan; stats: ProjectStats }

const STATUS_COLORS = [
  { key: "completed",   label: "Completed",   color: "bg-emerald-500" },
  { key: "critical",    label: "Critical",    color: "bg-red-500"     },
  { key: "in_progress", label: "In Progress", color: "bg-blue-500"    },
  { key: "blocked",     label: "Blocked",     color: "bg-brand-pink"  },
  { key: "not_started", label: "Not Started", color: "bg-slate-300"   },
];

function PlanCard({ data, href }: { data: PlanSummary; href: string }) {
  const { plan, stats } = data;
  const active = stats.total - stats.not_applicable;
  const pct    = active ? Math.round((stats.completed / active) * 100) : 0;
  const barColor = plan.color ?? "bg-brand-blue";

  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-brand-teal/20 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-slate-900 font-extrabold text-lg leading-tight group-hover:text-brand-teal transition-colors flex-1 mr-2">
            {plan.name}
          </h3>
          <span className="text-slate-200 group-hover:text-brand-teal text-xl transition-colors flex-shrink-0">→</span>
        </div>

        <div className="h-2.5 rounded-full bg-slate-50 overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${pct}%` }} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-slate-800">{pct}%</span>
          <span className="text-xs text-slate-400">{stats.completed}/{active} tasks complete</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_COLORS.map(({ key, label, color }) => {
            const count = stats[key as keyof ProjectStats] as number;
            if (!count) return null;
            return (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-slate-600">{count} {label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard({
  project,
  plans,
}: {
  project: Project;
  plans: PlanSummary[];
}) {
  const [editOpen, setEditOpen] = useState(false);

  const allTasks: Task[] = plans.flatMap(p => p.plan.phases.flatMap(ph => ph.tasks));

  // Aggregate stats
  const totalTasks    = plans.reduce((a, p) => a + p.stats.total, 0);
  const totalDone     = plans.reduce((a, p) => a + p.stats.completed, 0);
  const totalBlocked  = plans.reduce((a, p) => a + p.stats.blocked, 0);
  const totalCritical = plans.reduce((a, p) => a + p.stats.critical, 0);
  const totalNA       = plans.reduce((a, p) => a + p.stats.not_applicable, 0);
  const totalActive   = plans.reduce((a, p) => a + p.stats.in_progress, 0);
  const overallPct    = (totalTasks - totalNA) > 0 ? Math.round((totalDone / (totalTasks - totalNA)) * 100) : 0;

  // Timeline (optional — only shown if project has dates)
  const now = new Date();
  const startDate  = project.start_date  ? new Date(project.start_date)  : null;
  const targetDate = project.target_date ? new Date(project.target_date) : null;

  const hasTimeline = !!(startDate && targetDate);
  const totalDays     = hasTimeline ? Math.round((targetDate!.getTime() - startDate!.getTime()) / 86_400_000) : 0;
  const dayElapsed    = hasTimeline ? Math.max(0, Math.floor((now.getTime() - startDate!.getTime()) / 86_400_000)) : 0;
  const daysLeft      = hasTimeline ? Math.max(0, Math.ceil((targetDate!.getTime() - now.getTime()) / 86_400_000)) : 0;
  const timelinePct   = hasTimeline ? Math.min(100, Math.round((dayElapsed / totalDays) * 100)) : 0;
  const kickoffCountdown = hasTimeline && startDate! > now
    ? Math.ceil((startDate!.getTime() - now.getTime()) / 86_400_000)
    : 0;
  const started = hasTimeline && startDate! <= now;

  const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  // Critical/blocked/upcoming
  const criticalTasks = allTasks
    .filter(t => t.status === "critical")
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 5);

  const blockedTasks = allTasks
    .filter(t => t.status === "blocked" || (t.blocked_by && t.blocked_by.length > 0))
    .slice(0, 3);

  const soon = new Date(now.getTime() + 14 * 86_400_000);
  const upcomingDeadlines = allTasks
    .filter(t => t.deadline && !["completed", "not_applicable"].includes(t.status))
    .filter(t => new Date(t.deadline!).getTime() <= soon.getTime())
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 4);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {editOpen && <EditProjectModal project={project} onClose={() => setEditOpen(false)} />}

      {/* ── Header ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Project</p>
              <button
                onClick={() => setEditOpen(true)}
                className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-brand-teal transition-colors border border-slate-100 hover:border-brand-teal/30 rounded-lg px-2 py-0.5"
              >
                Edit
              </button>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{project.name}</h1>
            {project.description && (
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-xl">{project.description}</p>
            )}
            {hasTimeline && (
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                {fmtDate(startDate!)} → {fmtDate(targetDate!)}
              </p>
            )}
          </div>

          {/* Countdown widget — only if dates are set */}
          {hasTimeline && (
            <div className="shrink-0 bg-brand-navy rounded-2xl px-6 py-4 text-center min-w-[120px]">
              {kickoffCountdown > 0 ? (
                <>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Kickoff in</p>
                  <p className="text-3xl font-black text-white mt-0.5">{kickoffCountdown}</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">days</p>
                </>
              ) : (
                <>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Target in</p>
                  <p className={`text-3xl font-black mt-0.5 ${daysLeft <= 7 ? "text-red-400" : daysLeft <= 14 ? "text-amber-400" : "text-brand-teal"}`}>
                    {daysLeft}
                  </p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">days</p>
                </>
              )}
              <p className="text-[8px] text-white/20 mt-1.5">{fmtDate(targetDate!)}</p>
            </div>
          )}
        </div>

        {/* Timeline bar */}
        {hasTimeline && started && (
          <div className="mt-5">
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              <span>{fmtDate(startDate!)}</span>
              <span>Day {dayElapsed} of {totalDays}</span>
              <span>{fmtDate(targetDate!)}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-teal transition-all duration-1000"
                style={{ width: `${timelinePct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overall Progress", value: `${overallPct}%`, sub: `${totalDone} of ${totalTasks - totalNA} tasks done` },
          { label: "In Progress",      value: totalActive,      sub: `${totalCritical} critical` },
          { label: "Blocked",          value: totalBlocked,     sub: totalBlocked > 0 ? "need unblocking" : "all clear", red: totalBlocked > 0 },
          { label: "Workstreams",      value: plans.length,     sub: `${plans.reduce((a, p) => a + p.plan.phases.length, 0)} milestones` },
        ].map(({ label, value, sub, red }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{label}</p>
            <p className={`text-2xl font-black mt-1 ${red ? "text-red-600" : "text-slate-800"}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Plan cards ── */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm">No workstreams yet. Create a plan from the sidebar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map(p => (
            <PlanCard key={p.plan.id} data={p} href={`/plan/${p.plan.id}`} />
          ))}
        </div>
      )}

      {/* ── Bottom row ── */}
      {allTasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Critical Path</h2>
            {criticalTasks.length === 0 ? (
              <p className="text-xs text-slate-300 italic">No critical tasks.</p>
            ) : (
              <ol className="space-y-3">
                {criticalTasks.map(t => (
                  <li key={t.id} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-snug truncate">{t.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{t.wbs}</p>
                    </div>
                    {t.deadline && (
                      <span className="text-[9px] font-bold text-red-400 shrink-0">
                        {new Date(t.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Deadlines — Next 14 Days</h2>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-300 italic">No upcoming deadlines.</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingDeadlines.map(t => (
                    <li key={t.id} className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-amber-500 shrink-0 w-14">
                        {new Date(t.deadline!).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                      <span className="text-xs text-slate-700 font-medium truncate">{t.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {blockedTasks.length > 0 && (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
                <h2 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3">Blocked — Needs Action</h2>
                <ul className="space-y-2">
                  {blockedTasks.map(t => (
                    <li key={t.id} className="flex items-start gap-2">
                      <span className="text-[10px] mt-0.5">🛑</span>
                      <span className="text-xs text-red-800 font-medium leading-snug">{t.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
