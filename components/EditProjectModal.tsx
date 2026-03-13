"use client";

import { useState, useTransition } from "react";
import type { Project } from "@/lib/types";
import { updateProjectAction } from "@/app/actions/project";
import { toast } from "sonner";

export function EditProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [startDate, setStartDate] = useState(project.start_date ?? "");
  const [targetDate, setTargetDate] = useState(project.target_date ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await updateProjectAction(project.id, {
          name: name.trim(),
          description: description.trim() || null,
          start_date: startDate || null,
          target_date: targetDate || null,
        });
        toast.success("Project updated");
        onClose();
      } catch {
        toast.error("Failed to update project");
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Edit Project</h2>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
              Project Name
            </label>
            <input
              autoFocus
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-teal outline-none transition-all"
              placeholder="e.g. Merchant Lending MVP"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-teal outline-none transition-all resize-none"
              placeholder="Short project description…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-teal outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-teal outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-brand-teal text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand-teal/20 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
