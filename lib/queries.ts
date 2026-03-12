"use server";

import { createSupabaseServerClient } from "./supabase-server";
import type { Phase, Plan, PlanType, Profile, ProjectStats, Task, TaskComment, TaskStatus } from "./types";

/**
 * Standardizes Supabase errors into proper JavaScript Errors.
 * This prevents Next.js from choking on non-Error objects.
 */
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

export async function getPlanByType(type: PlanType): Promise<Plan> {
  const sb = createSupabaseServerClient();
  const { data: plan, error } = await sb.from("plans").select("*").eq("type", type).maybeSingle();
  handleSupabaseError(error);

  if (!plan) {
    throw new Error(`Data Setup Required: No plan found for type '${type}'. Please run the seed script to populate your database.`);
  }

  // Fetch all phases
  const { data: phases, error: pe } = await sb.from("phases").select("*").eq("plan_id", plan.id).order("display_order");
  handleSupabaseError(pe);

  // Fetch all profiles for lookups
  const { data: profiles } = await sb.from("profiles").select("*");
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]));

  const phasesWithTasks: Phase[] = await Promise.all(
    (phases ?? []).map(async (ph) => {
      // Fetch tasks for this phase
      const { data: tasks, error: te } = await sb.from("tasks")
        .select("*")
        .eq("phase_id", ph.id)
        .order("wbs");
      handleSupabaseError(te);

      // Fetch all comment counts for these tasks in one go
      const taskIds = (tasks ?? []).map(t => t.id);
      const { data: counts } = await sb.from("task_comments")
        .select("task_id")
        .in("task_id", taskIds);

      const countMap = (counts ?? []).reduce((acc: any, curr: any) => {
        acc[curr.task_id] = (acc[curr.task_id] || 0) + 1;
        return acc;
      }, {});

      const hydratedTasks = (tasks ?? []).map(t => ({
        ...t,
        assignee: t.assigned_to ? profileMap[t.assigned_to] : null,
        comment_count: countMap[t.id] || 0
      }));

      return { ...ph, tasks: hydratedTasks as Task[] };
    })
  );
  return { ...plan, phases: phasesWithTasks };
}

export async function getProfiles(): Promise<Profile[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("profiles").select("*").order("email");
  handleSupabaseError(error);
  return (data ?? []) as Profile[];
}

export async function createPhase(planId: string, name: string, wbs: string) {
  const sb = createSupabaseServerClient();
  // Simple order calculation: count + 1 * 10
  const { count } = await sb.from("phases").select("*", { count: 'exact', head: true }).eq("plan_id", planId);
  const { error } = await sb.from("phases").insert({
    id: `ph-${Date.now()}`,
    plan_id: planId,
    name,
    wbs,
    display_order: ((count ?? 0) + 1) * 10
  });
  handleSupabaseError(error);
}

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

export async function updateTaskBlockedBy(taskId: string, blockedBy: string[]) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks")
    .update({
      blocked_by: blockedBy,
      status: blockedBy.length > 0 ? 'blocked' : 'not_started',
      updated_at: new Date().toISOString()
    })
    .eq("id", taskId);
  handleSupabaseError(error);
}

export async function addTaskComment(taskId: string, content: string) {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Auth required");

  const { error } = await sb.from("task_comments").insert({
    task_id: taskId,
    user_id: user.id,
    content
  });
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

export async function assignTask(taskId: string, profileId: string | null) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks").update({ assigned_to: profileId }).eq("id", taskId);
  handleSupabaseError(error);
}

export async function setTaskDeadline(taskId: string, deadline: string | null) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks").update({
    deadline,
    end_date: deadline
  }).eq("id", taskId);
  handleSupabaseError(error);
}

export async function getPlanWithStats(type: PlanType) {
  const plan = await getPlanByType(type);
  const allTasks = plan.phases.flatMap((p) => p.tasks);
  const stats: ProjectStats = {
    total: allTasks.length,
    completed: allTasks.filter((t) => t.status === "completed").length,
    in_progress: allTasks.filter((t) => t.status === "in_progress").length,
    blocked: allTasks.filter((t) => t.status === "blocked").length,
    critical: allTasks.filter((t) => t.status === "critical").length,
    not_started: allTasks.filter((t) => t.status === "not_started").length,
    not_applicable: allTasks.filter((t) => t.status === "not_applicable").length,
  };
  return { plan, stats };
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

export async function deleteTask(id: string) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks").delete().eq("id", id);
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

export async function deletePhase(id: string) {
  const sb = createSupabaseServerClient();
  // Tasks will be deleted via CASCADE in DB if configured, but let's be explicit if needed.
  // Actually, our schema 001_initial_schema.sql has ON DELETE CASCADE for tasks.phase_id.
  const { error } = await sb.from("phases").delete().eq("id", id);
  handleSupabaseError(error);
}
