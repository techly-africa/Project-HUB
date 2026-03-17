"use client";

import type { Plan, ProjectStats, Project } from "@/lib/types";
import { today } from "./primitives";
import { SlideOverview }    from "./slides/Overview";
import { SlideCompleted }   from "./slides/Completed";
import { SlideInProgress }  from "./slides/InProgress";
import { SlideUpcoming }    from "./slides/Upcoming";
import { SlideBlockers }    from "./slides/Blockers";
import { SlideRoadmap }     from "./slides/Roadmap";
import { SlideWorkstream }  from "./slides/Workstream";
import { SlideTeam }        from "./slides/Team";

export interface PlanSummary { plan: Plan; stats: ProjectStats }
export interface SlideConfig { title: string; notes: string; content: React.ReactNode }

const MAX_SLIDES = 8;

export function buildSlides(project: Project, plans: PlanSummary[]): SlideConfig[] {
  const now  = new Date();
  const soon = new Date(now.getTime() + 14 * 86_400_000);
  const all  = plans.flatMap(p => p.plan.phases.flatMap(ph => ph.tasks));

  const completedCount  = all.filter(t => t.status === "completed").length;
  const inProgressCount = all.filter(t => t.status === "in_progress").length;
  const totalNA         = all.filter(t => t.status === "not_applicable").length;
  const active          = all.length - totalNA;
  const overallPct      = active > 0 ? Math.round((completedCount / active) * 100) : 0;
  const upcomingCount   = all.filter(t => t.deadline && !["completed","not_applicable"].includes(t.status) && new Date(t.deadline) <= soon).length;
  const overdueCount    = all.filter(t => t.deadline && !["completed","not_applicable"].includes(t.status) && new Date(t.deadline) < now).length;
  const blockerCount    = all.filter(t => t.status === "blocked" || t.status === "critical" || t.blocked_by?.length || (t.deadline && !["completed","not_applicable"].includes(t.status) && new Date(t.deadline) < now)).length;
  const hasPhases       = plans.some(p => p.plan.phases.length > 0);
  const hasAssigned     = all.some(t => t.assignee || (t.owner && t.owner !== "Unassigned"));
  const daysLeft        = project.target_date ? Math.max(0, Math.ceil((new Date(project.target_date).getTime() - now.getTime()) / 86_400_000)) : null;

  const out: SlideConfig[] = [];

  // 1. Always: overview
  out.push({
    title: "Project Overview",
    notes: `Open with the headline: overall completion is ${overallPct}%.${daysLeft !== null ? ` We have ${daysLeft} days remaining to the target date.` : ""} Walk the audience through each KPI card before going to the workstream breakdown.`,
    content: <SlideOverview project={project} plans={plans} />,
  });

  // 2. Completed work — only if tasks are done
  if (completedCount > 0) out.push({
    title: "Completed Work",
    notes: `Celebrate progress: ${completedCount} tasks have been delivered. Group by workstream and highlight any major milestones completed this period.`,
    content: <SlideCompleted plans={plans} />,
  });

  // 3. In progress
  if (inProgressCount > 0) out.push({
    title: "In Progress",
    notes: `${inProgressCount} tasks are actively being worked on. Invite questions about resource allocation or blockers before advancing.`,
    content: <SlideInProgress plans={plans} />,
  });

  // 4. Upcoming deadlines
  if (upcomingCount > 0) out.push({
    title: "Upcoming Deadlines",
    notes: `${overdueCount > 0 ? `Flag ${overdueCount} overdue items first — these need immediate resolution. ` : ""}${upcomingCount} tasks are due in the next 14 days. This is a critical section for stakeholder attention.`,
    content: <SlideUpcoming plans={plans} />,
  });

  // 5. Blockers & risks
  if (blockerCount > 0) out.push({
    title: "Blockers & Risks",
    notes: `${blockerCount} items require attention. Present the risk chart, then walk through each category: Blocked → Critical → Overdue. For each item, have a proposed resolution ready.`,
    content: <SlideBlockers plans={plans} />,
  });

  // 6. Roadmap
  if (hasPhases) out.push({
    title: "Roadmap",
    notes: `Use this slide to orient the audience on where we are in the overall plan. Reference the timeline bar — ${daysLeft !== null ? `${daysLeft} days remain` : "timeline not yet set"}. Walk through key phases and their completion status.`,
    content: <SlideRoadmap project={project} plans={plans} />,
  });

  // 7+. Per-workstream (fill remaining slots)
  const slots = MAX_SLIDES - out.length;
  if (plans.length > 1 && slots > 0) {
    plans.slice(0, slots).forEach(({ plan, stats }) => {
      const a = stats.total - stats.not_applicable;
      const p = a > 0 ? Math.round((stats.completed / a) * 100) : 0;
      out.push({
        title: plan.name,
        notes: `Dive into ${plan.name}: ${p}% complete. Cover phase-by-phase progress and surface any issues. Reference WBS codes when discussing specific tasks.`,
        content: <SlideWorkstream plan={plan} stats={stats} />,
      });
    });
  }

  // 8. Team & assignments (if space + data)
  if (out.length < MAX_SLIDES && hasAssigned) out.push({
    title: "Team & Assignments",
    notes: `Show the team's workload distribution. Highlight anyone at risk of being overloaded or who has critical tasks. Use this slide to acknowledge top performers if appropriate.`,
    content: <SlideTeam plans={plans} />,
  });

  return out.slice(0, MAX_SLIDES);
}
