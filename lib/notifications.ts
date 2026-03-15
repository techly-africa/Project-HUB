"use server";

import { createSupabaseServerClient } from "./supabase-server";
import { createSupabaseAdminClient } from "./supabase-admin";
import { sendEmail, taskAssignedEmail, taskCommentEmail, taskStatusEmail } from "./email";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  task_id: string | null;
  read: boolean;
  created_at: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rukisha.co.rw";

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<Notification[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return (data ?? []) as Notification[];
}

export async function getUnreadCount(): Promise<number> {
  const sb = createSupabaseServerClient();
  const { count } = await sb.from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);
  return count ?? 0;
}

export async function markAllReadAction() {
  const sb = createSupabaseServerClient();
  await sb.from("notifications").update({ read: true }).eq("read", false);
}

export async function markNotificationReadAction(id: string) {
  const sb = createSupabaseServerClient();
  await sb.from("notifications").update({ read: true }).eq("id", id);
}

// ─── Internal helpers (called by event triggers) ──────────────────────────────

// Creates an in-app notification. Uses the admin client so it can insert
// for any user_id (bypasses RLS "own_notifications" policy).
async function createNotification(opts: {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  task_id?: string;
}) {
  const admin = createSupabaseAdminClient();
  await admin.from("notifications").insert({
    user_id: opts.user_id,
    type: opts.type,
    title: opts.title,
    body: opts.body ?? null,
    task_id: opts.task_id ?? null,
  });
}

// ─── Event: task assigned ─────────────────────────────────────────────────────

export async function notifyTaskAssigned(opts: {
  taskId: string;
  taskName: string;
  assigneeId: string;
  assigneeEmail: string;
  assigneeName: string;
  assignedByName: string;
  projectName: string;
}) {
  await createNotification({
    user_id: opts.assigneeId,
    type: "task_assigned",
    title: "You were assigned a task",
    body: `${opts.assignedByName} assigned you "${opts.taskName}"`,
    task_id: opts.taskId,
  });

  await sendEmail({
    to: opts.assigneeEmail,
    subject: `You've been assigned: ${opts.taskName}`,
    html: taskAssignedEmail({
      recipientName: opts.assigneeName || opts.assigneeEmail,
      taskName: opts.taskName,
      projectName: opts.projectName,
      assignedByName: opts.assignedByName,
      appUrl: APP_URL,
    }),
  });
}

// ─── Event: task comment ──────────────────────────────────────────────────────

export async function notifyTaskComment(opts: {
  taskId: string;
  taskName: string;
  assigneeId: string | null;
  assigneeEmail: string | null;
  assigneeName: string | null;
  commenterName: string;
  commentBody: string;
}) {
  if (!opts.assigneeId || !opts.assigneeEmail) return;

  await createNotification({
    user_id: opts.assigneeId,
    type: "task_comment",
    title: `New comment on "${opts.taskName}"`,
    body: `${opts.commenterName}: ${opts.commentBody.slice(0, 120)}`,
    task_id: opts.taskId,
  });

  await sendEmail({
    to: opts.assigneeEmail,
    subject: `New comment on: ${opts.taskName}`,
    html: taskCommentEmail({
      recipientName: opts.assigneeName || opts.assigneeEmail,
      commenterName: opts.commenterName,
      taskName: opts.taskName,
      comment: opts.commentBody,
      appUrl: APP_URL,
    }),
  });
}

// ─── Event: task status changed ───────────────────────────────────────────────

export async function notifyTaskStatusChanged(opts: {
  taskId: string;
  taskName: string;
  assigneeId: string | null;
  assigneeEmail: string | null;
  assigneeName: string | null;
  newStatus: string;
  updatedByName: string;
  updatedById: string;
}) {
  if (!opts.assigneeId || !opts.assigneeEmail) return;
  // Don't notify if the assignee updated their own task
  if (opts.assigneeId === opts.updatedById) return;

  await createNotification({
    user_id: opts.assigneeId,
    type: "task_status",
    title: `Task status changed to ${opts.newStatus.replace("_", " ")}`,
    body: `"${opts.taskName}" updated by ${opts.updatedByName}`,
    task_id: opts.taskId,
  });

  await sendEmail({
    to: opts.assigneeEmail,
    subject: `Task updated: ${opts.taskName}`,
    html: taskStatusEmail({
      recipientName: opts.assigneeName || opts.assigneeEmail,
      taskName: opts.taskName,
      newStatus: opts.newStatus,
      updatedByName: opts.updatedByName,
      appUrl: APP_URL,
    }),
  });
}
