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
    <div className="mx-4 mt-6 relative">
      {/* Active project chip */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left flex items-center justify-between group hover:bg-white/10 transition-all"
      >
        <div>
          <p className="text-brand-teal text-[10px] uppercase tracking-widest font-bold">Project</p>
          <p className="text-white text-sm font-bold mt-0.5 truncate max-w-[160px]">{active?.name ?? "—"}</p>
        </div>
        <span className={`text-white/30 text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {projects.map(p => (
            <button
              key={p.id}
              className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 ${p.id === activeProjectId ? "bg-white/10 text-white font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
              onClick={() => {
                setOpen(false);
                startTransition(() => switchProject(p.id));
              }}
            >
              {p.id === activeProjectId && <span className="w-1.5 h-1.5 rounded-full bg-brand-teal flex-shrink-0" />}
              <span className="truncate">{p.name}</span>
            </button>
          ))}
          <div className="border-t border-white/10">
            <button
              className="w-full text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-brand-teal hover:bg-white/5 transition-colors"
              onClick={() => { setOpen(false); setShowNew(true); }}
            >
              + New Project
            </button>
          </div>
        </div>
      )}

      {/* New project modal */}
      {showNew && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Project Name</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. Digital Lending Phase 2"
                  className="w-full bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-brand-teal"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Description (optional)</label>
                <input
                  placeholder="Short description…"
                  className="w-full bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-brand-teal"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowNew(false)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button disabled={isPending} className="flex-1 bg-brand-teal text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand-teal/20">
                {isPending ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
