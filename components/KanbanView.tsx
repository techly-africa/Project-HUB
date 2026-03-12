"use client";

import { useState } from "react";
import type { Plan, Task, TaskStatus } from "@/lib/types";
import { updateTaskStatus } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import AddTaskInline from "./AddTaskInline";

export default function KanbanView({ plan }: { plan: Plan }) {
    const router = useRouter();
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [addingToPhaseId, setAddingToPhaseId] = useState<string | null>(null);
    const [addingToStatus, setAddingToStatus] = useState<TaskStatus | null>(null);

    const columns: { id: string, label: string, color: string, statuses: TaskStatus[] }[] = [
        { id: "todo", label: "To Do", color: "bg-slate-400", statuses: ["not_started"] },
        { id: "wip", label: "WIP", color: "bg-brand-blue", statuses: ["in_progress", "critical", "blocked"] },
        { id: "done", label: "Done", color: "bg-emerald-400", statuses: ["completed"] }
    ];

    const allTasks = plan.phases.flatMap(ph => ph.tasks.map(t => ({ ...t, phaseName: ph.name })));

    async function handleDrop(e: React.DragEvent, targetStatus: string) {
        e.preventDefault();
        if (!draggingId) return;

        // Map column ID to a primary status if needed, or just pick the first status of the column
        const statusMap: Record<string, TaskStatus> = {
            todo: "not_started",
            wip: "in_progress",
            done: "completed"
        };

        try {
            const nextStatus = statusMap[targetStatus];
            await updateTaskStatus(draggingId, nextStatus);
            toast.success(`Task moved to ${columns.find(c => c.id === targetStatus)?.label}`);
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Failed to move task");
        } finally {
            setDraggingId(null);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map(col => (
                <div
                    key={col.id}
                    className="bg-slate-50/50 rounded-[32px] p-6 border border-slate-100 min-h-[600px] flex flex-col"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, col.id)}
                >
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${col.color}`} />
                            {col.label}
                            <span className="bg-slate-200/50 text-slate-500 px-2 py-0.5 rounded-lg font-black tracking-normal ml-2">
                                {allTasks.filter(t => col.statuses.includes(t.status)).length}
                            </span>
                        </h3>
                        <button
                            onClick={() => {
                                setAddingToPhaseId(plan.phases[0]?.id || null);
                                setAddingToStatus(col.id === 'todo' ? 'not_started' : col.id === 'wip' ? 'in_progress' : 'completed');
                            }}
                            className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-teal hover:border-brand-teal transition-all shadow-sm"
                        >
                            +
                        </button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {addingToStatus === (col.id === 'todo' ? 'not_started' : col.id === 'wip' ? 'in_progress' : 'completed') && addingToPhaseId && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <AddTaskInline
                                    phaseId={addingToPhaseId}
                                    onCancel={() => setAddingToStatus(null)}
                                    onSuccess={() => setAddingToStatus(null)}
                                />
                                <div className="mt-2 px-4 pb-4">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Milestone</label>
                                    <select
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-900 outline-none"
                                        value={addingToPhaseId}
                                        onChange={(e) => setAddingToPhaseId(e.target.value)}
                                    >
                                        {plan.phases.map(ph => (
                                            <option key={ph.id} value={ph.id}>{ph.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {allTasks
                            .filter(t => col.statuses.includes(t.status))
                            .map(task => {
                                const isBlocked = task.status === 'blocked' || (task.blocked_by && task.blocked_by.length > 0);
                                return (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={() => setDraggingId(task.id)}
                                        className={`bg-white p-5 rounded-3xl border transition-all duration-300 cursor-grab active:cursor-grabbing group 
                                            ${isBlocked ? "border-red-200 bg-red-50/30 shadow-red-100" : "border-slate-100 hover:shadow-xl hover:shadow-brand-blue/5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]"}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg 
                                                ${isBlocked ? "text-red-500 bg-red-100/50" : "text-brand-blue/40 bg-slate-50"}
                                            `}>
                                                {task.phaseName}
                                            </span>
                                            <span className="text-[9px] font-black text-slate-300 font-mono italic">{task.wbs}</span>
                                        </div>

                                        <p className={`text-[13px] font-bold leading-snug mb-4 ${isBlocked ? "text-red-900" : "text-slate-900"}`}>
                                            {task.name}
                                        </p>

                                        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-white shadow-sm">
                                                    {task.owner?.charAt(0) || "?"}
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{task.owner}</span>
                                            </div>
                                            {task.deadline && (
                                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg 
                                                    ${isBlocked ? "text-white bg-red-500" : "text-brand-pink bg-brand-pink/5"}
                                                `}>
                                                    {format(new Date(task.deadline), "MMM d")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            ))}
        </div>
    );
}
