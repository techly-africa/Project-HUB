"use client";

import { useState, useTransition } from "react";
import { switchProject } from "@/app/actions/project";
import { createProject } from "@/lib/queries";
import type { Project } from "@/lib/types";
import { useRouter } from "next/navigation";

interface Props {
  projects: Project[];
  activeProjectId: string;
}

export default function ProjectSwitcher({ projects, activeProjectId }: Props) {
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const active = projects.find(p => p.id === activeProjectId) ?? projects[0];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const project = await createProject(name.trim(), description.trim() || undefined);
      await switchProject(project.id);
    });
    setShowNew(false);
    setName("");
    setDescription("");
  }

  return (
    <div className="relative">
      {/* Active project chip */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 rounded-xl bg-surface border border-border-subtle text-left flex items-center justify-between group hover:bg-surface-elevated hover:border-border-medium transition-all duration-200"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary font-bold">
            {active?.name?.charAt(0) ?? "P"}
          </div>
          <div className="min-w-0">
            <p className="text-accent-primary text-[9px] uppercase tracking-[0.2em] font-black">Project</p>
            <p className="text-white text-sm font-semibold truncate">{active?.name ?? "Select Project"}</p>
          </div>
        </div>
        <span className={`text-muted text-xs transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 p-1.5 glass-morphism rounded-2xl shadow-premium z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto scrollbar-hide py-1">
            {projects.map(p => (
              <button
                key={p.id}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 ${p.id === activeProjectId ? "bg-accent-primary/10 text-white font-semibold" : "text-secondary hover:bg-surface hover:text-white"}`}
                onClick={() => {
                  setOpen(false);
                  startTransition(() => switchProject(p.id));
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${p.id === activeProjectId ? "bg-accent-primary shadow-[0_0_8px_rgba(20,184,166,0.5)]" : "bg-muted/30"}`} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-1 pt-1 border-t border-border-subtle">
            <button
              className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary hover:bg-accent-primary/5 transition-all rounded-xl"
              onClick={() => { setOpen(false); setShowNew(true); }}
            >
              + Create New Project
            </button>
          </div>
        </div>
      )}

      {/* New project modal */}
      {showNew && (
        <div className="fixed inset-0 bg-background-primary/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowNew(false)}>
          <form
            onSubmit={handleCreate}
            className="bg-background-secondary border border-border-subtle rounded-[32px] p-10 w-full max-w-md shadow-premium relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Decoration */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-primary/5 blur-3xl rounded-full" />
            
            <h2 className="text-2xl font-bold text-white tracking-tight mb-8">Initiate New Project</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 block px-1">Project Identifier</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Portfolio Strategy 2024"
                  className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-muted outline-none focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 transition-all"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 block px-1">Scope & Objectives</label>
                <textarea
                  placeholder="Define high-level outcomes..."
                  className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-muted outline-none focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 transition-all min-h-[100px] resize-none"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setShowNew(false)} className="flex-1 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-surface border border-transparent hover:border-border-subtle transition-all">
                Cancel
              </button>
              <button 
                disabled={isPending} 
                className="flex-1 bg-accent-primary px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50"
              >
                {isPending ? "Deploying..." : "Launch Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
