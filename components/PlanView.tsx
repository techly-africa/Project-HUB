"use client";

import { useState, useMemo } from "react";
import type { Plan } from "@/lib/types";
import { createPhase } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import PhaseCard from "./PhaseCard";
import { Search, Filter, X } from "lucide-react";
import { TaskStatus } from "@/lib/types";

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
  const [view, setView] = useState<"list" | "kanban" | "timeline" | "gantt">("list");
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [newPhaseWbs, setNewPhaseWbs] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  const router = useRouter();

  // Filtering Logic
  const filteredPlan = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return {
      ...plan,
      phases: plan.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.filter(task => {
          const matchesSearch = task.name.toLowerCase().includes(query) || task.wbs.toLowerCase().includes(query);
          const matchesStatus = statusFilter === "all" || task.status === statusFilter;
          return matchesSearch && matchesStatus;
        })
      })).filter(phase => phase.tasks.length > 0 || searchQuery === "") // Keep all phases if not searching, otherwise filter out empty phases
    };
  }, [plan, searchQuery, statusFilter]);

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
            <p className="text-[10px] font-black text-brand-teal uppercase tracking-[0.2em] mb-2 drop-shadow-sm">
              Workstream
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-md">{plan.name}</h1>

            {/* View Switcher & Search/Filter */}
            <div className="flex items-center gap-4 flex-wrap mt-6">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
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

              <div className="flex items-center gap-2 flex-grow max-w-md">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 border-none rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-brand-teal transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="appearance-none bg-slate-100 border-none rounded-xl pl-4 pr-10 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-2 focus:ring-brand-teal transition-all cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                    <option value="critical">Critical</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
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
                <p className="text-4xl font-black text-slate-950 tracking-tighter">{pct}%</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">Complete</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="space-y-2 text-[10px] font-black uppercase tracking-wider">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">{done} Success</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-blue" />
                  <span className="text-slate-600">{inProg} Active</span>
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
        {view === "list" && filteredPlan.phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            planType={plan.type}
            allTasks={plan.phases.flatMap(ph => ph.tasks)}
          />
        ))}
        {view === "kanban" && <KanbanView plan={filteredPlan as Plan} />}
        {view === "timeline" && <TimelineView plan={filteredPlan as Plan} />}
        
        {/* Empty State for Filters */}
        {filteredPlan.phases.length === 0 && (searchQuery || statusFilter !== "all") && (
          <div className="py-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">No tasks match your filters</p>
            <button 
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
              className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-teal hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
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
