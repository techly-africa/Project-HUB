"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/lib/types";
import { updateTaskStatus } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  User,
  Calendar,
  Layers,
  Activity,
  AlertCircle
} from "lucide-react";
import TaskSidePanel from "./TaskSidePanel";

export default function MyTasksKanbanView({ tasks }: { tasks: Task[] }) {
    const router = useRouter();
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);
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
            toast.error("Failed to update task status");
        } finally {
            setDraggingId(null);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {columns.map(col => {
                const colTasks = tasks.filter(t => col.statuses.includes(t.status));
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
                        </div>

                        {/* Column Body */}
                        <div className={`flex-1 rounded-[2.5rem] bg-surface/40 border border-border-subtle p-4 backdrop-blur-sm transition-all duration-500 group-hover/col:bg-surface/60 group-hover/col:border-border-medium relative overflow-hidden ${dragOverCol === col.id ? "ring-2 ring-accent-primary/50 bg-surface/80 scale-[1.01] shadow-premium" : ""}`}>
                            <div className="space-y-4 relative z-10">
                                <AnimatePresence mode="popLayout">
                                    {colTasks.map((task, idx) => {
                                        const isBlocked = task.status === 'blocked' || (task.blocked_by && task.blocked_by.length > 0);
                                        const isCritical = task.status === 'critical';
                                        
                                        // Cast phase for type safety since we hydrated it in query
                                        const phaseInfo = (task as any).phase;
                                        const planName = phaseInfo?.plan?.name || "Global";
                                        const planColor = phaseInfo?.plan?.color || "#94a3b8";

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
                                                        <div 
                                                            className="w-2 h-2 rounded-full" 
                                                            style={{ backgroundColor: planColor }}
                                                        />
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted">
                                                            {planName}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] font-black text-muted font-mono italic group-hover/card:text-secondary transition-colors uppercase">{task.wbs}</span>
                                                </div>

                                                <p className={`text-[13px] font-bold leading-relaxed mb-6 group-hover/card:text-contrast transition-colors line-clamp-2
                                                    ${isBlocked ? "text-accent-danger/80" : "text-secondary"}`}>
                                                    {task.name}
                                                </p>

                                                <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-xl bg-background-primary flex items-center justify-center text-[10px] font-black text-muted border border-border-subtle shadow-inner group-hover/card:border-accent-primary/30 transition-all uppercase">
                                                            {task.owner?.charAt(0) || <User className="w-3 h-3" />}
                                                        </div>
                                                        <span className="text-[10px] font-black text-muted uppercase tracking-widest group-hover/card:text-secondary transition-colors">
                                                            {phaseInfo?.name || "Phase"}
                                                        </span>
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
                                
                                {colTasks.length === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center opacity-20 grayscale scale-95 pointer-events-none">
                                        <Layers className="w-12 h-12 text-muted mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Empty</p>
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
