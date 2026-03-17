"use client";

import { useState, useTransition } from "react";
import { createPlanAction } from "@/app/actions/project";
import { toast } from "sonner";

const COLOR_OPTIONS = [
  { label: "Blue",    value: "bg-brand-blue",   hex: "#3B82F6" },
  { label: "Teal",    value: "bg-brand-teal",   hex: "#14B8A6" },
  { label: "Pink",    value: "bg-brand-pink",   hex: "#EC4899" },
  { label: "Amber",   value: "bg-amber-500",    hex: "#F59E0B" },
  { label: "Green",   value: "bg-emerald-500",  hex: "#10B981" },
  { label: "Purple",  value: "bg-violet-500",   hex: "#8B5CF6" },
  { label: "Red",     value: "bg-rose-500",     hex: "#F43F5E" },
  { label: "Navy",    value: "bg-brand-navy",   hex: "#1E3A5F" },
];

export default function NewWorkstreamButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createPlanAction(projectId, name.trim(), color);
        toast.success("Workstream created");
        setOpen(false);
        setName("");
        setColor(COLOR_OPTIONS[0].value);
      } catch {
        toast.error("Failed to create workstream");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-2 text-white/30 hover:text-brand-teal text-[10px] font-black uppercase tracking-widest transition-colors"
      >
        <span className="text-base leading-none">+</span>
        <span>Add workstream</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-background-primary/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-background-secondary border border-border-subtle rounded-[32px] p-8 w-full max-w-md shadow-premium relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Decoration */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-primary/5 blur-3xl rounded-full" />
            
            <h2 className="text-xl font-bold text-white tracking-tight mb-6">New Workstream</h2>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 block px-1">
                  Name
                </label>
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Product & Technology"
                  className="w-full bg-surface border border-border-subtle rounded-2xl px-5 py-3 text-sm font-medium text-white placeholder:text-muted outline-none focus:border-accent-primary/50 focus:ring-4 focus:ring-accent-primary/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 block px-1">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.label}
                      onClick={() => setColor(opt.value)}
                      className="w-8 h-8 rounded-full transition-all border-2"
                      style={{
                        backgroundColor: opt.hex,
                        borderColor: color === opt.value ? "#fff" : "transparent",
                        boxShadow: color === opt.value ? `0 0 0 2px ${opt.hex}` : "none",
                      }}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-3 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-xs text-secondary font-medium">{name || "Workstream name"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-surface border border-transparent hover:border-border-subtle transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !name.trim()}
                className="flex-1 bg-brand-teal text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand-teal/20 disabled:opacity-40"
              >
                {isPending ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
