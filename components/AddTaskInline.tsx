"use client";

import { useState } from "react";
import { createTask } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddTaskInline({ phaseId, onCancel, onSuccess }: { phaseId: string; onCancel?: () => void; onSuccess?: () => void }) {
    const [isAdding, setIsAdding] = useState(!onCancel);
    const [name, setName] = useState("");
    const [wbs, setWbs] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name || !wbs || !startDate || !endDate) {
            toast.error("Task name, WBS, Start Date, and End Date are required.");
            return;
        }
        setIsLoading(true);
        try {
            await createTask(phaseId, name, wbs, undefined, description, startDate, endDate);
            setName("");
            setWbs("");
            setDescription("");
            setStartDate("");
            setEndDate("");
            if (onCancel) setIsAdding(false);
            if (onSuccess) onSuccess();
            toast.success("Task created");
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create task.");
        } finally {
            setIsLoading(false);
        }
    }

    if (!isAdding && onCancel) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className="w-full py-3 px-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-teal transition-colors text-left flex items-center gap-2"
            >
                <span className="text-sm">+</span> Add Task
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="px-5 py-6 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-1 duration-200 rounded-2xl border border-slate-100 mt-2">
            <div className="flex gap-3">
                <input
                    autoFocus
                    required
                    placeholder="WBS"
                    className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-900 focus:ring-1 focus:ring-brand-teal outline-none"
                    value={wbs}
                    onChange={e => setWbs(e.target.value)}
                />
                <input
                    required
                    placeholder="Task Name..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-900 focus:ring-1 focus:ring-brand-teal outline-none"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </div>

            <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[140px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Start Date</label>
                    <input
                        type="date"
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-900 focus:ring-1 focus:ring-brand-teal outline-none"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <div className="flex-1 min-w-[140px]">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">End Date (Deadline)</label>
                    <input
                        type="date"
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-900 focus:ring-1 focus:ring-brand-teal outline-none"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <textarea
                placeholder="Optional description..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-900 focus:ring-1 focus:ring-brand-teal outline-none resize-none h-20"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />

            <div className="flex justify-end gap-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsAdding(false);
                            onCancel();
                        }}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white transition-all"
                    >
                        Cancel
                    </button>
                )}
                <button
                    disabled={isLoading}
                    className="bg-brand-teal text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand-teal/10"
                >
                    {isLoading ? "..." : "Save Task"}
                </button>
            </div>
        </form>
    );
}
