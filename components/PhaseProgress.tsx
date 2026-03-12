import type { Task } from "@/lib/types";

export default function PhaseProgress({ tasks }: { tasks: Task[] }) {
  const active = tasks.filter((t) => t.status !== "not_applicable");
  const done = active.filter((t) => t.status === "completed").length;
  const pct = active.length ? Math.round((done / active.length) * 100) : 0;

  const inProg = active.filter((t) => t.status === "in_progress").length;
  const blocked = active.filter((t) => t.status === "blocked").length;
  const critical = active.filter((t) => t.status === "critical").length;

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* Bar */}
      <div className="flex-1 h-2 rounded-full bg-slate-50 overflow-hidden min-w-[60px] border border-slate-100">
        <div
          className="h-full bg-brand-teal rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Text */}
      <span className="text-[10px] font-black text-slate-800 whitespace-nowrap tracking-tight">{pct}%</span>
      {/* Pills */}
      <div className="flex gap-1">
        {inProg > 0 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-brand-blue/5 text-brand-blue font-black uppercase tracking-tighter">
            {inProg}P
          </span>
        )}
        {critical > 0 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 font-black uppercase tracking-tighter">
            {critical}C
          </span>
        )}
        {blocked > 0 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-brand-pink/5 text-brand-pink font-black uppercase tracking-tighter">
            {blocked}B
          </span>
        )}
      </div>
    </div>
  );
}
