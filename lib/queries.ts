"use server";

import { createSupabaseServerClient } from "./supabase-server";
import type { Phase, Plan, PlanType, Profile, Project, ProjectStats, Task, TaskComment, TaskStatus } from "./types";

function handleSupabaseError(error: any) {
  if (error) {
    console.error("Supabase Error Full Diagnostic:", error instanceof Error ? { ...error, message: error.message, stack: error.stack } : JSON.stringify(error, null, 2));
    const message = error.message || "An unexpected database error occurred.";
    const err = new Error(message);
    (err as any).details = error.details;
    (err as any).hint = error.hint;
    (err as any).code = error.code;
    throw err;
  }
}

// ─── Shared helper to hydrate phases + tasks for a plan row ──────────────────
async function hydratePlan(sb: any, plan: any): Promise<Plan> {
  const { data: phases, error: pe } = await sb.from("phases").select("*").eq("plan_id", plan.id).order("display_order");
  handleSupabaseError(pe);

  const { data: profiles } = await sb.from("profiles").select("*");
  const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]));

  const phasesWithTasks: Phase[] = await Promise.all(
    (phases ?? []).map(async (ph: any) => {
      const { data: tasks, error: te } = await sb.from("tasks").select("*").eq("phase_id", ph.id).order("wbs");
      handleSupabaseError(te);

      const taskIds = (tasks ?? []).map((t: any) => t.id);
      const { data: counts } = await sb.from("task_comments").select("task_id").in("task_id", taskIds);
      const countMap = (counts ?? []).reduce((acc: any, curr: any) => {
        acc[curr.task_id] = (acc[curr.task_id] || 0) + 1;
        return acc;
      }, {});

      const hydratedTasks = (tasks ?? []).map((t: any) => ({
        ...t,
        assignee: t.assigned_to ? profileMap[t.assigned_to] : null,
        comment_count: countMap[t.id] || 0
      }));

      return { ...ph, tasks: hydratedTasks as Task[] };
    })
  );

  return {
    ...plan,
    color: plan.color ?? "bg-brand-blue",
    project_id: plan.project_id ?? "",
    phases: phasesWithTasks
  } as Plan;
}

function calcStats(plan: Plan): ProjectStats {
  const allTasks = plan.phases.flatMap(p => p.tasks);
  return {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === "completed").length,
    in_progress: allTasks.filter(t => t.status === "in_progress").length,
    blocked: allTasks.filter(t => t.status === "blocked").length,
    critical: allTasks.filter(t => t.status === "critical").length,
    not_started: allTasks.filter(t => t.status === "not_started").length,
    not_applicable: allTasks.filter(t => t.status === "not_applicable").length,
  };
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("projects").select("*").order("created_at");
  handleSupabaseError(error);
  return (data ?? []) as Project[];
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("projects").insert({ name, description: description ?? null }).select().single();
  handleSupabaseError(error);
  return data as Project;
}

export async function updateProject(
  id: string,
  fields: { name?: string; description?: string | null; start_date?: string | null; target_date?: string | null }
): Promise<Project> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("projects").update(fields).eq("id", id).select().single();
  handleSupabaseError(error);
  return data as Project;
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export async function getPlansByProject(projectId: string): Promise<Plan[]> {
  const sb = createSupabaseServerClient();
  const { data: planRows, error } = await sb.from("plans").select("*").eq("project_id", projectId).order("name");
  handleSupabaseError(error);
  return Promise.all((planRows ?? []).map((p: any) => hydratePlan(sb, p)));
}

export async function getPlanById(id: string): Promise<Plan> {
  const sb = createSupabaseServerClient();
  const { data: plan, error } = await sb.from("plans").select("*").eq("id", id).maybeSingle();
  handleSupabaseError(error);
  if (!plan) throw new Error(`No plan found with id '${id}'.`);
  return hydratePlan(sb, plan);
}

export async function getPlanWithStatsByProject(projectId: string): Promise<{ plan: Plan; stats: ProjectStats }[]> {
  const plans = await getPlansByProject(projectId);
  return plans.map(plan => ({ plan, stats: calcStats(plan) }));
}

export async function createPlan(projectId: string, name: string, color: string): Promise<void> {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("plans").insert({
    id: `plan-${Date.now()}`,
    project_id: projectId,
    name,
    type: "custom",
    color,
  });
  handleSupabaseError(error);
}

// ─── Legacy (kept for backward compat) ───────────────────────────────────────

export async function getPlanByType(type: PlanType): Promise<Plan> {
  const sb = createSupabaseServerClient();
  const { data: plan, error } = await sb.from("plans").select("*").eq("type", type).maybeSingle();
  handleSupabaseError(error);
  if (!plan) throw new Error(`No plan found for type '${type}'. Please run the seed script.`);
  return hydratePlan(sb, plan);
}

export async function getPlanWithStats(type: PlanType) {
  const plan = await getPlanByType(type);
  return { plan, stats: calcStats(plan) };
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function getProfiles(): Promise<Profile[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("profiles").select("*").order("email");
  handleSupabaseError(error);
  return (data ?? []) as Profile[];
}

// ─── Phases ───────────────────────────────────────────────────────────────────

export async function createPhase(planId: string, name: string, wbs: string) {
  const sb = createSupabaseServerClient();
  const { count } = await sb.from("phases").select("*", { count: "exact", head: true }).eq("plan_id", planId);
  const { error } = await sb.from("phases").insert({
    id: `ph-${Date.now()}`,
    plan_id: planId,
    name,
    wbs,
    display_order: ((count ?? 0) + 1) * 10
  });
  handleSupabaseError(error);
}

export async function deletePhase(id: string) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("phases").delete().eq("id", id);
  handleSupabaseError(error);
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function createTask(
  phaseId: string,
  name: string,
  wbs: string,
  owner?: string,
  description?: string,
  start_date?: string,
  end_date?: string
) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks").insert({
    id: `tk-${Date.now()}`,
    phase_id: phaseId,
    name,
    wbs,
    owner: owner ?? "Unassigned",
    description: description ?? null,
    start_date: start_date ?? null,
    end_date: end_date ?? null,
    deadline: end_date ?? null,
    status: "not_started",
    blocked_by: []
  });
  handleSupabaseError(error);
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks")
    .update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  handleSupabaseError(error);
}

export async function updateTaskDates(id: string, start_date: string | null, end_date: string | null) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks")
    .update({ start_date, end_date, updated_at: new Date().toISOString() }).eq("id", id);
  handleSupabaseError(error);
}

export async function updateTaskDetails(
  id: string,
  name: string,
  owner: string,
  description: string | null,
  remarks: string | null
) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks")
    .update({ name, owner, description, remarks, updated_at: new Date().toISOString() })
    .eq("id", id);
  handleSupabaseError(error);
}

export async function updateTaskBlockedBy(taskId: string, blockedBy: string[]) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks")
    .update({
      blocked_by: blockedBy,
      status: blockedBy.length > 0 ? "blocked" : "not_started",
      updated_at: new Date().toISOString()
    })
    .eq("id", taskId);
  handleSupabaseError(error);
}

export async function deleteTask(id: string) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks").delete().eq("id", id);
  handleSupabaseError(error);
}

export async function assignTask(taskId: string, profileId: string | null) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks").update({ assigned_to: profileId }).eq("id", taskId);
  handleSupabaseError(error);
}

export async function setTaskDeadline(taskId: string, deadline: string | null) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks").update({ deadline, end_date: deadline }).eq("id", taskId);
  handleSupabaseError(error);
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function addTaskComment(taskId: string, content: string) {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Auth required");
  const { error } = await sb.from("task_comments").insert({ task_id: taskId, user_id: user.id, content });
  handleSupabaseError(error);
}

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("task_comments")
    .select(`*, user:profiles(*)`)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  handleSupabaseError(error);
  return (data ?? []) as any[];
}
