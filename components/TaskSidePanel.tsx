"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Task, TaskComment, Profile, TaskStatus as TStatus } from "@/lib/types";
import { getTaskComments, addTaskComment, getProfiles, assignTask, setTaskDeadline, updateTaskDates, updateTaskStatus } from "@/lib/queries";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
}

const STATUS_OPTIONS: { value: TStatus; label: string; color: string }[] = [
    { value: "not_started", label: "Not Started", color: "bg-slate-400" },
    { value: "in_progress", label: "In Progress", color: "bg-brand-blue" },
    { value: "completed", label: "Completed", color: "bg-emerald-500" },
    { value: "blocked", label: "Blocked", color: "bg-brand-pink" },
    { value: "critical", label: "Critical", color: "bg-red-500" },
    { value: "not_applicable", label: "N/A", color: "bg-slate-200" },
];

export default function TaskSidePanel({ task, isOpen, onClose }: Props) {
    const [mounted, setMounted] = useState(false);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        if (isOpen && task) {
            loadDetails();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen, task]);

    async function loadDetails() {
        if (!task) return;
        setIsLoading(true);
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
            setIsLoading(false);
        }
    }

    async function handleAddComment(e: React.FormEvent) {
        e.preventDefault();
        if (!task || !newComment) return;
        setIsSubmitting(true);
        try {
            await addTaskComment(task.id, newComment);
            setNewComment("");
            const updated = await getTaskComments(task.id);
            setComments(updated);
            toast.success("Comment added");
        } catch (err) {
            toast.error("Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleStatusChange(status: TStatus) {
        if (!task) return;
        try {
            await updateTaskStatus(task.id, status);
            toast.success(`Status updated to ${status.replace('_', ' ')}`);
            router.refresh();
            // Update local task state if needed, but router.refresh usually works
        } catch (err) {
            toast.error("Failed to update status");
        }
    }

    if (!mounted || !task) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[100] flex justify-end ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Task Details – {task.wbs}</span>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{task.name}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 transition-colors shadow-sm bg-slate-50 border border-slate-100"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Current Status</label>
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(e.target.value as TStatus)}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Assigned To</label>
                            <select
                                value={task.assigned_to || "none"}
                                onChange={async (e) => {
                                    const val = e.target.value;
                                    await assignTask(task.id, val === "none" ? null : val);
                                    toast.success("Assignee updated");
                                    router.refresh();
                                }}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-teal transition-all"
                            >
                                <option value="none">Unassigned</option>
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Timeline Update */}
                    <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline Update</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Start Date</label>
                                <input
                                    type="date"
                                    value={task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : ""}
                                    onChange={async (e) => {
                                        await updateTaskDates(task.id, e.target.value || null, task.end_date);
                                        toast.success("Timeline updated");
                                        router.refresh();
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-teal"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">End Date</label>
                                <input
                                    type="date"
                                    value={task.end_date ? new Date(task.end_date).toISOString().split('T')[0] : ""}
                                    onChange={async (e) => {
                                        await updateTaskDates(task.id, task.start_date, e.target.value || null);
                                        // Also update deadline as they are synced in queries.ts
                                        toast.success("Timeline updated");
                                        router.refresh();
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-teal"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</h3>
                            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                                <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">{task.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Comments Discussion */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discussion</h3>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="h-20 flex items-center justify-center">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter animate-pulse">Loading comments...</span>
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map(c => (
                                    <div key={c.id} className="flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-[10px] font-black text-slate-900">{c.user?.email.split('@')[0]}</span>
                                            <span className="text-[8px] font-bold text-slate-300">{format(new Date(c.created_at), "MMM d, HH:mm")}</span>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-w-[90%]">
                                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{c.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-slate-50/50 rounded-3xl py-12 border border-slate-50 border-dashed flex flex-col items-center justify-center">
                                    <span className="text-2xl mb-2">💬</span>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No comments yet</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="relative pt-4 mt-4 border-t border-slate-50">
                            <textarea
                                required
                                placeholder="Share an update or question..."
                                className="w-full bg-white border border-slate-200 rounded-[28px] px-6 py-4 pr-16 text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-blue outline-none transition-all resize-none h-20 shadow-sm"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                            />
                            <button
                                disabled={isSubmitting || !newComment}
                                className="absolute right-3 bottom-8 bg-brand-blue text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-20 transition-all shadow-lg shadow-brand-blue/20"
                            >
                                Post
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
