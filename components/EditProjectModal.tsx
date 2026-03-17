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
    <div className="fixed inset-0 bg-background-primary/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-background-secondary border border-border-subtle rounded-[32px] p-10 w-full max-w-lg shadow-premium relative overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-primary/5 blur-3xl rounded-full" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">System Configuration</h2>
            <p className="text-xs text-muted font-medium mt-1">Update global project parameters and metadata.</p>
          </div>
          <button onClick={onClose} type="button" className="p-2 text-muted hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 block px-1">
              Project Identifier
            </label>
            <input
              autoFocus
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-muted outline-none focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 transition-all"
              placeholder="e.g. Merchant Lending MVP"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 block px-1">
              Executive Summary
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-muted outline-none focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 transition-all resize-none"
              placeholder="Primary objectives and mission statement..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 block px-1">
                Initiation Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-2xl px-4 py-4 text-sm font-medium text-white focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 block px-1">
                Target Realization
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-2xl px-4 py-4 text-sm font-medium text-white focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-surface border border-transparent hover:border-border-subtle transition-all"
          >
            Abort
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-accent-primary px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50"
          >
            {isPending ? "Syncing..." : "Update System"}
          </button>
        </div>
      </form>
    </div>
  );
}
