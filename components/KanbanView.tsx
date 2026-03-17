"use client";

import { useState } from "react";
import type { Plan, Task, TaskStatus } from "@/lib/types";
import { updateTaskStatus } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Calendar,
  Layers,
  MoreVertical,
  Activity
} from "lucide-react";
import AddTaskInline from "./AddTaskInline";
import TaskSidePanel from "./TaskSidePanel";

export default function KanbanView({ plan }: { plan: Plan }) {
    const router = useRouter();
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);
    const [addingToPhaseId, setAddingToPhaseId] = useState<string | null>(null);
    const [addingToStatus, setAddingToStatus] = useState<TaskStatus | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const columns: { id: string, label: string, icon: any, colorClass: string, glowClass: string, statuses: TaskStatus[] }[] = [
        {
            id: "todo",
            label: "Backlog",
            icon: Clock,
            colorClass: "text-slate-400",
            glowClass: "bg-slate-500/10",
            statuses: ["not_started"]
        },
        {
            id: "wip",
            label: "In Progress",
            icon: Activity,
            colorClass: "text-accent-primary",
            glowClass: "bg-accent-primary/10",
            statuses: ["in_progress", "critical", "blocked"]
        },
        {
            id: "done",
            label: "Completed",
            icon: CheckCircle2,
            colorClass: "text-accent-success",
            glowClass: "bg-accent-success/10",
            statuses: ["completed"]
        }
    ];

    const allTasks = plan.phases.flatMap(ph => ph.tasks.map(t => ({ ...t, phaseName: ph.name })));
    const activePhase = plan.phases.find(p => p.id === addingToPhaseId) ?? null;

    async function handleDrop(e: React.DragEvent, targetStatus: string) {
        e.preventDefault();
        if (!draggingId) return;

        const statusMap: Record<string, TaskStatus> = {
            todo: "not_started",
            wip: "in_progress",
            done: "completed"
        };

        try {
            const nextStatus = statusMap[targetStatus];
            await updateTaskStatus(draggingId, nextStatus);
            toast.success(`Task shifted to ${columns.find(c => c.id === targetStatus)?.label}`);
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Protocol failure: Re-routing impossible");
        } finally {
            setDraggingId(null);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {columns.map(col => {
                const colTasks = allTasks.filter(t => col.statuses.includes(t.status));
                const Icon = col.icon;

                return (
                    <div
                        key={col.id}
                        className="flex flex-col min-h-[700px] group/col"
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() => setDragOverCol(col.id)}
                        onDragLeave={() => setDragOverCol(null)}
                        onDrop={(e) => {
                            setDragOverCol(null);
                            handleDrop(e, col.id);
                        }}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-6 px-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${col.glowClass} border border-border-subtle`}>
                                    <Icon className={`w-4 h-4 ${col.colorClass}`} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-contrast">
                                    {col.label}
                                    <span className="ml-3 px-2 py-0.5 rounded-lg bg-surface-elevated border border-border-subtle text-[10px] text-secondary font-mono tracking-normal">
                                        {colTasks.length}
                                    </span>
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setAddingToPhaseId(plan.phases[0]?.id || null);
                                    setAddingToStatus(col.id === 'todo' ? 'not_started' : col.id === 'wip' ? 'in_progress' : 'completed');
                                }}
                                className="w-8 h-8 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-secondary hover:text-contrast hover:bg-surface-hover hover:border-border-medium transition-all shadow-xl active:scale-90"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Column Body */}
                        <div className={`flex-1 rounded-[2.5rem] bg-surface/40 border border-border-subtle p-4 backdrop-blur-sm transition-all duration-500 group-hover/col:bg-surface/60 group-hover/col:border-border-medium relative overflow-hidden ${dragOverCol === col.id ? "ring-2 ring-accent-primary/50 bg-surface/80 scale-[1.01] shadow-premium" : ""}`}>
                            <div className={`absolute inset-0 opacity-0 group-hover/col:opacity-100 transition-opacity pointer-events-none bg-gradient-to-b from-contrast/[0.02] to-transparent`} />

                            <div className="space-y-4 relative z-10">
                                <AnimatePresence mode="popLayout">
                                    {addingToStatus === (col.id === 'todo' ? 'not_started' : col.id === 'wip' ? 'in_progress' : 'completed') && activePhase && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-surface-elevated border border-border-medium rounded-3xl p-1 mb-4 overflow-hidden shadow-2xl"
                                        >
                                            <div className="bg-background-secondary/50 p-4 rounded-[1.4rem]">
                                                <AddTaskInline
                                                    phaseId={activePhase.id}
                                                    phaseWbs={activePhase.wbs}
                                                    taskCount={activePhase.tasks.length}
                                                    onCancel={() => setAddingToStatus(null)}
                                                    onSuccess={() => setAddingToStatus(null)}
                                                />
                                                <div className="mt-4 px-1">
                                                    <label className="text-[8px] font-black text-muted uppercase tracking-widest block mb-2 px-1">Target Vessel (Phase)</label>
                                                    <select
                                                        className="w-full bg-background-primary border border-border-subtle rounded-xl px-4 py-2 text-[10px] font-bold text-primary outline-none focus:ring-2 ring-accent-primary/20 transition-all cursor-pointer"
                                                        value={activePhase.id}
                                                        onChange={(e) => setAddingToPhaseId(e.target.value)}
                                                    >
                                                        {plan.phases.map(ph => (
                                                            <option key={ph.id} value={ph.id}>{ph.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {colTasks.map((task, idx) => {
                                        const isBlocked = task.status === 'blocked' || (task.blocked_by && task.blocked_by.length > 0);
                                        const isCritical = task.status === 'critical';

                                        return (
                                            <motion.div
                                                layout
                                                key={task.id}
                                                layoutId={task.id}
                                                draggable
                                                onDragStart={() => setDraggingId(task.id)}
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setIsPanelOpen(true);
                                                }}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`group/card bg-surface-elevated p-5 rounded-[2rem] border transition-all duration-500 cursor-grab active:cursor-grabbing hover:bg-surface-hover hover:scale-[1.02] shadow-sm hover:shadow-premium
                                                    ${isBlocked 
                                                        ? "border-accent-danger/30 bg-accent-danger/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
                                                        : isCritical 
                                                            ? "border-accent-secondary/30 bg-accent-secondary/5"
                                                            : "border-border-subtle hover:border-border-medium"}
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border
                                                            ${isBlocked ? "text-accent-danger bg-accent-danger/10 border-accent-danger/20" : "text-muted bg-surface border-border-subtle"}
                                                        `}>
                                                            {task.phaseName}
                                                        </span>
                                                        {isBlocked && <AlertCircle className="w-3 h-3 text-accent-danger animate-pulse" />}
                                                    </div>
                                                    <span className="text-[9px] font-black text-muted font-mono italic group-hover/card:text-secondary transition-colors uppercase">{task.wbs}</span>
                                                </div>

                                                <p className={`text-[13px] font-bold leading-relaxed mb-6 group-hover/card:text-contrast transition-colors
                                                    ${isBlocked ? "text-accent-danger/80" : "text-secondary"}`}>
                                                    {task.name}
                                                </p>

                                                <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-xl bg-background-primary flex items-center justify-center text-[10px] font-black text-muted border border-border-subtle shadow-inner group-hover/card:border-accent-primary/30 transition-all">
                                                            {task.owner?.charAt(0) || <User className="w-3 h-3" />}
                                                        </div>
                                                        <span className="text-[10px] font-black text-muted uppercase tracking-widest group-hover/card:text-secondary transition-colors">{task.owner || "Anonymous"}</span>
                                                    </div>
                                                    
                                                    {task.deadline && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className={`w-3 h-3 ${isBlocked ? "text-accent-danger" : "text-muted"}`} />
                                                            <span className={`text-[9px] font-black uppercase tracking-tighter
                                                                ${isBlocked ? "text-accent-danger" : "text-secondary group-hover/card:text-accent-secondary"}
                                                            `}>
                                                                {format(new Date(task.deadline), "MMM d")}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                
                                {colTasks.length === 0 && !addingToStatus && (
                                    <div className="py-20 flex flex-col items-center justify-center opacity-20 grayscale scale-95 pointer-events-none">
                                        <Layers className="w-12 h-12 text-muted mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Terminal Idle</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            <TaskSidePanel
                task={selectedTask}
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
            />
        </div>
    );
}

function TaskSidePanelWrapper({ task, isOpen, onClose }: { task: Task | null, isOpen: boolean, onClose: () => void }) {
    return (
        <TaskSidePanel
            task={task}
            isOpen={isOpen}
            onClose={onClose}
        />
    );
}
