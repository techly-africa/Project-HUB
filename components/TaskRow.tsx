"use client";

import { useState, useEffect } from "react";
import type { Task, TaskComment, Profile } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { getTaskComments, addTaskComment, getProfiles, assignTask, setTaskDeadline, updateTaskDates, deleteTask, updateTaskDetails } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import ConfirmModal from "./ConfirmModal";

interface Props {
  task: Task;
  planType: string;
  allTasks: Task[];
}

export default function TaskRow({ task, planType, allTasks }: Props) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editOwner, setEditOwner] = useState(task.owner);
  const [editDescription, setEditDescription] = useState(task.description ?? "");
  const [editRemarks, setEditRemarks] = useState(task.remarks ?? "");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const router = useRouter();

  async function handleSaveEdit() {
    setIsSavingEdit(true);
    try {
      await updateTaskDetails(task.id, editName, editOwner, editDescription || null, editRemarks || null);
      toast.success("Task updated");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete task.");
    }
  }

  useEffect(() => {
    if (open) {
      loadDetails();
    }
  }, [open]);

  async function loadDetails() {
    setIsLoadingComments(true);
    try {
      const [cms, prs] = await Promise.all([
        getTaskComments(task.id),
        getProfiles()
      ]);
      setComments(cms);
      setProfiles(prs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingComments(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment) return;
    setIsSubmitting(true);
    try {
      await addTaskComment(task.id, newComment);
      setNewComment("");
      const updated = await getTaskComments(task.id);
      setComments(updated);
      toast.success("Comment added");
    } catch (err) {
      console.error(err);
      toast.error("Only authenticated users can comment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAssign(profileId: string) {
    try {
      await assignTask(task.id, profileId === "none" ? null : profileId);
      toast.success("Assignee updated");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update assignee");
    }
  }

  async function handleDeadlineChange(date: string) {
    try {
      await setTaskDeadline(task.id, date || null);
      toast.success("Deadline updated");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update deadline");
    }
  }

  const isBlocked = task.status === 'blocked' || (task.blocked_by && task.blocked_by.length > 0);

  return (
    <div className={`border-b border-slate-50 last:border-0 transition-colors ${open ? "bg-slate-50/30" : ""} ${isBlocked ? "bg-red-50/20" : ""}`}>
      {/* Confirm deletion */}
      <ConfirmModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${task.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      <div
        className={`flex items-start gap-3 px-5 py-4 transition-colors cursor-pointer ${isBlocked ? "hover:bg-red-50/40" : "hover:bg-slate-50/50"}`}
        onClick={() => setOpen((o) => !o)}
      >
        {/* WBS */}
        <span className={`text-[10px] font-bold font-mono pt-1 w-8 shrink-0 ${isBlocked ? "text-red-300" : "text-slate-300"}`}>{task.wbs}</span>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold leading-snug tracking-tight 
            ${task.status === "not_applicable" ? "line-through text-slate-300" : ""}
            ${isBlocked ? "text-red-900" : "text-slate-800"}
          `}>
            {task.name}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            {isBlocked && (
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 bg-red-100/50 px-2 py-0.5 rounded-lg">
                <span className="text-[10px]">🛑</span> Blocked
              </p>
            )}
            {task.assignee ? (
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? "bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]" : "bg-brand-teal shadow-[0_0_8px_rgba(45,212,191,0.3)]"}`} />
                {task.assignee.email.split('@')[0]}
              </p>
            ) : (
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Unassigned</p>
            )}

            {task.deadline && (
              <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${isBlocked ? "text-red-400" : "text-brand-pink"}`}>
                <span className="text-[10px]">📅</span> {format(new Date(task.deadline), "MMM d, yyyy")}
              </p>
            )}

            {task.comment_count! > 0 && (
              <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${isBlocked ? "text-red-400" : "text-brand-blue"}`}>
                <span className="text-[10px]">💬</span> {task.comment_count}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <StatusBadge taskId={task.id} status={task.status} planType={planType} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setOpen(true);
            }}
            className="p-1.5 hover:bg-slate-100 text-slate-300 hover:text-slate-600 rounded-lg transition-colors"
            title="Edit Task"
          >
            <span className="text-[14px]">✏️</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleting(true);
            }}
            className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors group"
            title="Delete Task"
          >
            <span className="text-[14px]">🗑️</span>
          </button>
        </div>

        {/* Expand chevron */}
        <span className={`text-slate-300 text-[10px] pt-1.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}>
          ▶
        </span>
      </div>

      {/* Expanded: details & comments */}
      {open && (
        <div className="px-5 pb-8 pt-2 ml-11 space-y-6">
          {/* Assignment & Deadline controls */}
          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Assigned To</label>
              <select
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleAssign(e.target.value)}
                value={task.assigned_to || "none"}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-brand-teal min-w-[140px]"
              >
                <option value="none">Choose Owner...</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.email}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Start Date</label>
              <input
                type="date"
                onClick={(e) => e.stopPropagation()}
                onChange={async (e) => {
                  try {
                    await updateTaskDates(task.id, e.target.value || null, task.end_date);
                    toast.success("Start date updated");
                    router.refresh();
                  } catch (err) {
                    toast.error("Failed to update start date");
                  }
                }}
                value={task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : ""}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Deadline</label>
              <input
                type="date"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleDeadlineChange(e.target.value)}
                value={task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ""}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-700 outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
          </div>

          {/* Edit form */}
          {isEditing ? (
            <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-5 space-y-4" onClick={e => e.stopPropagation()}>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Edit Task</h4>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Owner</label>
                <input
                  type="text"
                  value={editOwner}
                  onChange={e => setEditOwner(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-teal resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Remarks</label>
                <textarea
                  value={editRemarks}
                  onChange={e => setEditRemarks(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-teal resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || !editName.trim()}
                  className="bg-brand-teal text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(task.name);
                    setEditOwner(task.owner);
                    setEditDescription(task.description ?? "");
                    setEditRemarks(task.remarks ?? "");
                  }}
                  className="bg-white border border-slate-200 text-slate-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : task.description ? (
            <div className="bg-white border border-slate-100 rounded-[24px] p-5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">{task.description}</p>
            </div>
          ) : null}

          {/* Dependencies / Blocking */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Task Dependencies</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500">Is this task blocked?</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isBlocked ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {isBlocked ? 'Yes (Blocked)' : 'No (Clear)'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Add Blocker</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-900 focus:ring-1 focus:ring-brand-teal outline-none"
                    onChange={async (e) => {
                      const val = e.target.value;
                      if (!val || val === "none") return;
                      if (task.blocked_by?.includes(val)) return;

                      const newBlockedBy = [...(task.blocked_by || []), val];
                      const { updateTaskBlockedBy } = await import("@/lib/queries");
                      try {
                        await updateTaskBlockedBy(task.id, newBlockedBy);
                        toast.success("Blocker added");
                        router.refresh();
                      } catch (err) {
                        toast.error("Failed to add blocker");
                      }
                    }}
                    value="none"
                  >
                    <option value="none">Select a task to block this one...</option>
                    {allTasks
                      .filter(t => t.id !== task.id)
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          [{t.wbs}] {t.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {task.blocked_by && task.blocked_by.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                  {task.blocked_by.map((id, i) => {
                    const blockingTask = allTasks.find(t => t.id === id);
                    return (
                      <div key={i} className="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-2">
                        <span>{blockingTask ? `[${blockingTask.wbs}] ${blockingTask.name}` : id}</span>
                        <button
                          onClick={async () => {
                            const newBlockedBy = task.blocked_by.filter((_, idx) => idx !== i);
                            const { updateTaskBlockedBy } = await import("@/lib/queries");
                            try {
                              await updateTaskBlockedBy(task.id, newBlockedBy);
                              toast.success("Blocker removed");
                              router.refresh();
                            } catch (err) {
                              toast.error("Failed to remove blocker");
                            }
                          }}
                          className="hover:text-red-700 font-black"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Remarks Section (Original logic, repurposed) */}
          <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Task Discussion</h4>

            <div className="space-y-4 mb-6">
              {isLoadingComments ? (
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-4">Loading discussion...</p>
              ) : comments.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-slate-900">{c.user?.email.split('@')[0]}</span>
                      <span className="text-[8px] font-bold text-slate-300">{format(new Date(c.created_at), "MMM d, yyyy HH:mm")}</span>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm inline-block max-w-[90%]">
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest text-center py-4 italic">No comments yet.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} onClick={e => e.stopPropagation()} className="relative">
              <textarea
                required
                placeholder="Write a comment..."
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 pr-16 text-xs font-bold text-slate-900 placeholder:text-slate-200 focus:ring-2 focus:ring-brand-pink outline-none transition-all resize-none h-14"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button
                disabled={isSubmitting || !newComment}
                className="absolute right-2 top-2 bottom-2 bg-brand-pink text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-20 transition-all shadow-lg shadow-brand-pink/10"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
