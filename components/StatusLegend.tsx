"use client";

import { useState } from "react";
import type { TaskStatusConfig } from "@/lib/types";

interface Props {
  statuses: TaskStatusConfig[];
}

export default function StatusLegend({ statuses }: Props) {
  const [open, setOpen] = useState(false);

  if (!statuses.length) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
        title="Status legend"
      >
        <span className="flex gap-1">
          {statuses.slice(0, 4).map(s => (
            <span key={s.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
          ))}
        </span>
        <span>Legend</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-3 space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority Status</p>
            {statuses.map(s => (
              <div key={s.id} className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-slate-600 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
