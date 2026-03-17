"use client";

import { useState } from "react";
import { createTask } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X, Save } from "lucide-react";

export default function AddTaskInline({ phaseId, phaseWbs, taskCount, onCancel, onSuccess }: { phaseId: string; phaseWbs: string; taskCount: number; onCancel?: () => void; onSuccess?: () => void }) {
    const [isAdding, setIsAdding] = useState(!onCancel);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name || !startDate || !endDate) {
            toast.error("Asset Name, Start Date, and Deadline are required.");
            return;
        }
        const wbs = `${phaseWbs}.${taskCount + 1}`;
        setIsLoading(true);
        try {
            await createTask(phaseId, name, wbs, undefined, description, startDate, endDate);
            setName("");
            setDescription("");
            setStartDate("");
            setEndDate("");
            if (onCancel) setIsAdding(false);
            if (onSuccess) onSuccess();
            toast.success("Task synchronized successfully");
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Synchronization failure");
        } finally {
            setIsLoading(false);
        }
    }

    if (!isAdding && onCancel) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className="w-full py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent-primary hover:bg-surface-elevated rounded-2xl transition-all text-left flex items-center gap-3 group border border-transparent hover:border-border-subtle"
            >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Add Task Object
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="px-6 py-8 bg-surface border border-border-medium space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
            
            <div className="flex gap-4 items-center">
                <span className="text-[10px] font-black text-muted font-mono bg-surface-elevated px-3 py-2.5 rounded-xl border border-border-subtle shrink-0">
                    {phaseWbs}.{taskCount + 1}
                </span>
                <input
                    autoFocus
                    required
                    placeholder="Identify task..."
                    className="flex-1 bg-background-secondary border border-border-subtle rounded-xl px-5 py-3 text-xs font-bold text-primary focus:outline-none focus:ring-2 ring-accent-primary/20 transition-all placeholder:text-muted"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </div>

            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[140px]">
                    <label className="text-[9px] font-black text-muted uppercase tracking-widest block mb-2 ml-1">Commencement</label>
                    <input
                        type="date"
                        required
                        className="w-full bg-background-secondary border border-border-subtle rounded-xl px-4 py-3 text-[10px] font-bold text-primary focus:outline-none focus:ring-2 ring-accent-primary/20 transition-all"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <div className="flex-1 min-w-[140px]">
                    <label className="text-[9px] font-black text-muted uppercase tracking-widest block mb-2 ml-1">Deadline</label>
                    <input
                        type="date"
                        required
                        className="w-full bg-background-secondary border border-border-subtle rounded-xl px-4 py-3 text-[10px] font-bold text-primary focus:outline-none focus:ring-2 ring-accent-primary/20 transition-all"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <textarea
                placeholder="Optional telemetry or metadata description..."
                className="w-full bg-background-secondary border border-border-subtle rounded-xl px-5 py-3 text-xs font-bold text-primary focus:outline-none focus:ring-2 ring-accent-primary/20 transition-all placeholder:text-muted resize-none h-24"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdding(false);
                            onCancel();
                        }}
                        className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-contrast hover:bg-surface-elevated transition-all"
                    >
                        Esc
                    </button>
                )}
                <button
                    disabled={isLoading}
                    className="bg-accent-primary text-white dark:text-slate-950 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-primary/90 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)] disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading ? "..." : (
                        <>
                            <Save className="w-3 h-3" /> Save Object
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
