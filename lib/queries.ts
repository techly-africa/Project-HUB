"use server";

import { createSupabaseServerClient } from "./supabase-server";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Document, DocumentFolder, Organization, Phase, Plan, PlanType, Profile, Project, ProjectStats, Task, TaskAttachmentWithContext, TaskComment, TaskStatus, TaskStatusConfig } from "./types";
import { notifyTaskAssigned, notifyTaskComment, notifyTaskMention, notifyTaskStatusChanged } from "./notifications";

function handleSupabaseError(error: PostgrestError | Error | null) {
  if (error) {
    console.error("Supabase Error Full Diagnostic:", error instanceof Error ? { ...error, message: error.message, stack: error.stack } : JSON.stringify(error, null, 2));
    const message = error.message || "An unexpected database error occurred.";
    const err = new Error(message) as Error & { details?: string; hint?: string; code?: string };
    if (error && 'details' in error) err.details = error.details as string;
    if (error && 'hint' in error) err.hint = error.hint as string;
    if (error && 'code' in error) err.code = error.code as string;
    throw err;
  }
}

// ─── Shared helper to hydrate phases + tasks for a plan row ──────────────────
// profileMap is pre-fetched by callers to avoid one extra query per plan call.
async function hydratePlan(sb: SupabaseClient, plan: { id: string; color?: string; project_id?: string }, profileMap: Record<string, Profile>): Promise<Plan> {
  const { data: phases, error: pe } = await sb.from("phases").select("*").eq("plan_id", plan.id).order("display_order");
  handleSupabaseError(pe);

  if (!phases?.length) {
    return { ...plan, color: plan.color ?? "bg-brand-blue", project_id: plan.project_id ?? "", phases: [] } as unknown as Plan;
  }

  const phaseIds = phases.map((ph: Phase) => ph.id);

  // Batch: single query for all tasks across all phases (replaces N per-phase queries)
  const { data: allTasks, error: te } = await sb.from("tasks").select("*").in("phase_id", phaseIds).order("wbs");
  handleSupabaseError(te);

  const taskIds = (allTasks ?? []).map((t: Task) => t.id);

  // Batch: single query for all comment counts across all tasks
  const { data: counts } = taskIds.length > 0
    ? await sb.from("task_comments").select("task_id").in("task_id", taskIds)
    : { data: [] };

  const countMap = (counts ?? []).reduce((acc: Record<string, number>, curr: { task_id: string }) => {
    acc[curr.task_id] = (acc[curr.task_id] || 0) + 1;
    return acc;
  }, {});

  // Group hydrated tasks by phase
  const tasksByPhase = (allTasks ?? []).reduce((acc: Record<string, Task[]>, t: Task) => {
    if (!acc[t.phase_id]) acc[t.phase_id] = [];
    acc[t.phase_id].push({
      ...t,
      assignee: t.assigned_to ? profileMap[t.assigned_to] : undefined,
      comment_count: countMap[t.id] || 0,
    });
    return acc;
  }, {});

  const phasesWithTasks: Phase[] = phases.map((ph: Phase) => ({
    ...ph,
    tasks: (tasksByPhase[ph.id] ?? []) as Task[],
  }));

  return {
    ...plan,
    color: plan.color ?? "bg-brand-blue",
    project_id: plan.project_id ?? "",
    phases: phasesWithTasks,
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

export async function getOrganization(): Promise<Organization | null> {
  const sb = createSupabaseServerClient();
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    // Resolve the caller's org_id first — never rely on RLS returning exactly
    // one row, which would silently break in a true multi-org world.
    const { data: profile } = await sb
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();
    if (!profile?.organization_id) return null;
    const { data, error } = await sb
      .from("organizations")
      .select("*")
      .eq("id", profile.organization_id)
      .maybeSingle();
    if (error) return null; // table may not exist yet before migration 014 is applied
    return (data ?? null) as Organization | null;
  } catch {
    return null;
  }
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Auth required");

  const { data: profile } = await sb.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile?.organization_id) throw new Error("User has no organization assigned");

  const { data, error } = await sb.from("projects").insert({
    name,
    description: description ?? null,
    organization_id: profile.organization_id,
  }).select().single();
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
  const [{ data: planRows, error }, { data: profiles }] = await Promise.all([
    sb.from("plans").select("*").eq("project_id", projectId).order("name"),
    sb.from("profiles").select("*"),
  ]);
  handleSupabaseError(error);
  const profileMap = Object.fromEntries((profiles ?? []).map((p: Profile) => [p.id, p]));
  return Promise.all((planRows ?? []).map((p: Plan) => hydratePlan(sb, p, profileMap)));
}

export async function getPlanById(id: string): Promise<Plan> {
  const sb = createSupabaseServerClient();
  const [{ data: plan, error }, { data: profiles }] = await Promise.all([
    sb.from("plans").select("*").eq("id", id).maybeSingle(),
    sb.from("profiles").select("*"),
  ]);
  handleSupabaseError(error);
  if (!plan) throw new Error(`No plan found with id '${id}'.`);
  const profileMap = Object.fromEntries((profiles ?? []).map((p: Profile) => [p.id, p]));
  return hydratePlan(sb, plan, profileMap);
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
  const [{ data: plan, error }, { data: profiles }] = await Promise.all([
    sb.from("plans").select("*").eq("type", type).maybeSingle(),
    sb.from("profiles").select("*"),
  ]);
  handleSupabaseError(error);
  if (!plan) throw new Error(`No plan found for type '${type}'. Please run the seed script.`);
  const profileMap = Object.fromEntries((profiles ?? []).map((p: Profile) => [p.id, p]));
  return hydratePlan(sb, plan, profileMap);
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

export async function getProfile(): Promise<Profile | null> {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) return null;
  return data as Profile | null;
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

export async function getMyTasks(): Promise<Task[]> {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb
    .from("tasks")
    .select(`
      *,
      phase:phases (
        id,
        name,
        plan:plans (
          id,
          name,
          color
        )
      )
    `)
    .eq("assigned_to", user.id)
    .order("deadline", { ascending: true });

  handleSupabaseError(error);
  return (data ?? []) as Task[];
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

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks")
    .update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  handleSupabaseError(error);

  // Fire notification best-effort (non-blocking)
  void (async () => {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const [{ data: task }, { data: updater }] = await Promise.all([
        sb.from("tasks").select("name, assigned_to, phase_id").eq("id", id).single(),
        sb.from("profiles").select("full_name, email").eq("id", user.id).single(),
      ]);
      if (!task?.assigned_to) return;
      const { data: assignee } = await sb.from("profiles").select("id, email, full_name").eq("id", task.assigned_to).single();
      if (!assignee) return;
      await notifyTaskStatusChanged({
        taskId: id,
        taskName: task.name,
        assigneeId: assignee.id,
        assigneeEmail: assignee.email,
        assigneeName: assignee.full_name,
        newStatus: status,
        updatedByName: updater?.full_name || updater?.email || "Someone",
        updatedById: user.id,
      });
    } catch {}
  })();
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

  if (!profileId) return;
  void (async () => {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const [{ data: task }, { data: assignee }, { data: assigner }] = await Promise.all([
        sb.from("tasks").select("name, phase_id").eq("id", taskId).single(),
        sb.from("profiles").select("id, email, full_name").eq("id", profileId).single(),
        sb.from("profiles").select("full_name, email").eq("id", user.id).single(),
      ]);
      if (!task || !assignee) return;
      const { data: phase } = await sb.from("phases").select("plan_id").eq("id", task.phase_id).single();
      const { data: plan } = await sb.from("plans").select("project_id").eq("id", phase?.plan_id).single();
      const { data: project } = await sb.from("projects").select("name").eq("id", plan?.project_id).single();
      await notifyTaskAssigned({
        taskId,
        taskName: task.name,
        assigneeId: assignee.id,
        assigneeEmail: assignee.email,
        assigneeName: assignee.full_name ?? assignee.email,
        assignedByName: assigner?.full_name || assigner?.email || "Someone",
        projectName: project?.name ?? "a project",
      });
    } catch {}
  })();
}

export async function setTaskDeadline(taskId: string, deadline: string | null) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("tasks").update({ deadline, end_date: deadline }).eq("id", taskId);
  handleSupabaseError(error);
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function addTaskComment(taskId: string, content: string, mentionedIds: string[] = []) {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Auth required");
  const { error } = await sb.from("task_comments").insert({ task_id: taskId, user_id: user.id, content });
  handleSupabaseError(error);

  void (async () => {
    try {
      const [{ data: task }, { data: commenter }] = await Promise.all([
        sb.from("tasks").select("name, assigned_to").eq("id", taskId).single(),
        sb.from("profiles").select("full_name, email").eq("id", user.id).single(),
      ]);
      if (!task) return;
      const commenterName = commenter?.full_name || commenter?.email || "Someone";

      // Notify assignee (existing behaviour) — skip if commenter is the assignee
      if (task.assigned_to && task.assigned_to !== user.id) {
        const { data: assignee } = await sb.from("profiles").select("id, email, full_name").eq("id", task.assigned_to).single();
        if (assignee) {
          await notifyTaskComment({
            taskId,
            taskName: task.name,
            assigneeId: assignee.id,
            assigneeEmail: assignee.email,
            assigneeName: assignee.full_name,
            commenterName,
            commentBody: content,
          });
        }
      }

      // Notify each mentioned user — skip the commenter and anyone already notified as assignee
      const alreadyNotified = new Set([user.id, task.assigned_to].filter(Boolean) as string[]);
      const uniqueMentions = mentionedIds.filter(id => !alreadyNotified.has(id));
      if (uniqueMentions.length > 0) {
        const { data: mentionedProfiles } = await sb.from("profiles").select("id, email, full_name").in("id", uniqueMentions);
        for (const profile of (mentionedProfiles ?? [])) {
          await notifyTaskMention({
            taskId,
            taskName: task.name,
            mentionedId: profile.id,
            mentionedEmail: profile.email,
            mentionedName: profile.full_name,
            mentionerName: commenterName,
            commentBody: content,
          });
        }
      }
    } catch {}
  })();
}

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("task_comments")
    .select(`*, user:profiles(*)`)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  handleSupabaseError(error);
  return (data ?? []) as TaskComment[];
}

// ─── Task Statuses ────────────────────────────────────────────────────────────

export async function getTaskStatuses(): Promise<TaskStatusConfig[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("task_statuses")
    .select("*")
    .order("display_order", { ascending: true });
  handleSupabaseError(error);
  return (data ?? []) as TaskStatusConfig[];
}

export async function createTaskStatus(payload: { value: string; label: string; color: string; display_order: number }) {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Auth required");
  const { data: profile } = await sb.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile?.organization_id) throw new Error("No organization found");
  const { error } = await sb.from("task_statuses").insert({ ...payload, organization_id: profile.organization_id });
  handleSupabaseError(error);
}

export async function updateTaskStatusConfig(id: string, payload: Partial<Pick<TaskStatusConfig, "label" | "color" | "display_order">>) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("task_statuses").update(payload).eq("id", id);
  handleSupabaseError(error);
}

export async function deleteTaskStatus(id: string) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("task_statuses").delete().eq("id", id);
  handleSupabaseError(error);
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function getDocuments(): Promise<Document[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
  handleSupabaseError(error);
  return (data ?? []) as Document[];
}

export async function getFolders(): Promise<DocumentFolder[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("document_folders")
    .select("*")
    .order("name");
  handleSupabaseError(error);
  return (data ?? []) as DocumentFolder[];
}

export async function createFolder(payload: {
  name: string;
  parent_id: string | null;
}): Promise<DocumentFolder> {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Auth required");
  const { data: profile } = await sb.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile?.organization_id) throw new Error("No organization found");
  const { data, error } = await sb
    .from("document_folders")
    .insert({ ...payload, organization_id: profile.organization_id, created_by: user.id })
    .select()
    .single();
  handleSupabaseError(error);
  return data as DocumentFolder;
}

export async function deleteFolder(id: string) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("document_folders").delete().eq("id", id);
  handleSupabaseError(error);
}

export async function moveDocument(id: string, folder_id: string | null) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("documents").update({ folder_id }).eq("id", id);
  handleSupabaseError(error);
}

export async function addDocument(payload: {
  name: string;
  storage_path: string;
  size: number | null;
  mime_type: string | null;
  source: "direct" | "task";
  task_attachment_id?: string | null;
  folder_id?: string | null;
}): Promise<Document> {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Auth required");
  const { data: profile } = await sb.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile?.organization_id) throw new Error("No organization found");
  const { data, error } = await sb
    .from("documents")
    .insert({ ...payload, organization_id: profile.organization_id, uploaded_by: user.id })
    .select()
    .single();
  handleSupabaseError(error);
  return data as Document;
}

export async function deleteDocument(id: string) {
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("documents").delete().eq("id", id);
  handleSupabaseError(error);
}

// Fetches all task attachments across the org with task + plan context for the picker
export async function getTaskAttachmentsWithContext(): Promise<TaskAttachmentWithContext[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("task_attachments")
    .select(`
      *,
      task:tasks!inner(id, name, phase:phases!inner(plan:plans!inner(name)))
    `)
    .order("created_at", { ascending: false });
  handleSupabaseError(error);

  return (data ?? []).map((row: {
    id: string;
    name: string;
    storage_path: string;
    size: number | null;
    mime_type: string | null;
    uploaded_by: string | null;
    created_at: string;
    task: {
      id: string;
      name: string;
      phase: {
        plan: {
          name: string;
        }
      }
    } | null;
  }) => ({
    id: row.id,
    task_id: row.task?.id ?? "",
    task_name: row.task?.name ?? "Unknown task",
    plan_name: row.task?.phase?.plan?.name ?? "Unknown workstream",
    name: row.name,
    storage_path: row.storage_path,
    size: row.size,
    mime_type: row.mime_type,
    uploaded_by: row.uploaded_by,
    created_at: row.created_at,
  }));
}
