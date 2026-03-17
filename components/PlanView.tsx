"use client";

import { useState } from "react";
import type { Plan } from "@/lib/types";
import { createPhase } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import PhaseCard from "./PhaseCard";

const KanbanView = dynamic(() => import("./KanbanView"), {
  loading: () => <div className="h-64 rounded-3xl bg-slate-50 animate-pulse" />,
});
const TimelineView = dynamic(() => import("./TimelineView"), {
  loading: () => <div className="h-64 rounded-3xl bg-slate-50 animate-pulse" />,
});

function calcStats(plan: Plan) {
  const tasks = plan.phases.flatMap((p) => p.tasks);
  const active = tasks.filter((t) => t.status !== "not_applicable");
  return {
    total: active.length,
    done: active.filter((t) => t.status === "completed").length,
    inProg: active.filter((t) => t.status === "in_progress").length,
    blocked: active.filter((t) => t.status === "blocked").length,
  };
}

export default function PlanView({ plan }: { plan: Plan }) {
  const [view, setView] = useState<"list" | "kanban" | "timeline">("list");
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseWbs, setNewPhaseWbs] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { total, done, inProg, blocked } = calcStats(plan);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const barColor = plan.color ?? "bg-brand-blue";

  async function handleAddPhase(e: React.FormEvent) {
    e.preventDefault();
    if (!newPhaseName || !newPhaseWbs) return;
    setIsLoading(true);
    try {
      await createPhase(plan.id, newPhaseName, newPhaseWbs);
      setNewPhaseName("");
      setNewPhaseWbs("");
      setIsAddingPhase(false);
      toast.success("Milestone created");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create milestone.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <p className="text-[10px] font-black text-brand-teal uppercase tracking-[0.2em] mb-2">
              Workstream
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">{plan.name}</h1>

            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mt-6">
              {[
                { id: "list", label: "List" },
                { id: "kanban", label: "Kanban" },
                { id: "timeline", label: "Timeline" }
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === v.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => setIsAddingPhase(true)}
              className="bg-brand-navy text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-brand-navy/10"
            >
              + New Milestone
            </button>

            {/* Progress widget */}
            <div className="flex items-center gap-6 bg-white rounded-3xl border border-slate-100 px-8 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="text-center">
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{pct}%</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Complete</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="space-y-2 text-[10px] font-black uppercase tracking-wider">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-500">{done} Success</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-blue" />
                  <span className="text-slate-500">{inProg} Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global progress bar */}
        <div className="mt-8 h-3 rounded-full bg-slate-50 overflow-hidden border border-slate-100 shadow-inner">
          <div
            className={`h-full transition-all duration-1000 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Add Phase Modal Overlay */}
      {isAddingPhase && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddPhase} className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6 text-center">New Milestone</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">WBS Code</label>
                <input
                  autoFocus
                  required
                  placeholder="e.g. 1.1"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-teal transition-all"
                  value={newPhaseWbs}
                  onChange={e => setNewPhaseWbs(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Milestone Name</label>
                <input
                  required
                  placeholder="e.g. Infrastructure Setup"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-teal transition-all"
                  value={newPhaseName}
                  onChange={e => setNewPhaseName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setIsAddingPhase(false)}
                className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-bold"
              >
                Cancel
              </button>
              <button
                disabled={isLoading}
                className="flex-1 bg-brand-teal text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand-teal/20"
              >
                {isLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Conditional View Rendering */}
      <div className="space-y-4 min-h-[400px]">
        {view === "list" && plan.phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            planType={plan.type}
            allTasks={plan.phases.flatMap(ph => ph.tasks)}
          />
        ))}
        {view === "kanban" && <KanbanView plan={plan} />}
        {view === "timeline" && <TimelineView plan={plan} />}
      </div>

      {/* Help Footer */}
      <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        <span>Click badge to update</span>
        <span className="w-1 h-1 rounded-full bg-slate-200" />
        <span>Click row for notes</span>
      </div>
    </div>
  );
}
