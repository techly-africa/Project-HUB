"use client";

import { useState } from "react";
import type { OrgWithStats } from "@/lib/superadmin-queries";
import { format } from "date-fns";
import Link from "next/link";
import { deleteOrgAction } from "@/app/actions/superadmin";
import { toast } from "sonner";

export default function OrgTable({ initialOrgs }: { initialOrgs: OrgWithStats[] }) {
  const [search, setSearch] = useState("");
  const filtered = initialOrgs.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.domain?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove all member associations.`)) return;
    try {
      await deleteOrgAction(id);
      toast.success(`Organization ${name} deleted`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  return (
    <div className="w-full">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center gap-3">
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-slate-500" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7.5" cy="7.5" r="5.5" />
          <path d="M11.5 11.5L14.5 14.5" strokeLinecap="round" />
        </svg>
        <input 
          type="text" 
          placeholder="Filter organizations..."
          className="bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none w-full"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Organization</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Domain</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Stats</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Created At</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filtered.map(org => (
              <tr key={org.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-black text-lg">
                      {org.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white mb-0.5">{org.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{org.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {org.domain ? (
                    <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                      @{org.domain}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600 italic">No domain</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-4 text-xs font-bold">
                    <div className="text-center">
                      <div className="text-white">{org.member_count}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-tighter">Users</div>
                    </div>
                    <div className="w-px h-6 bg-slate-800" />
                    <div className="text-center">
                      <div className="text-white">{org.project_count}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-tighter">Projs</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-400">
                    {format(new Date(org.created_at), "MMM d, yyyy")}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={`/superadmin/organizations/${org.id}`}
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700"
                    >
                      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 8H12M12 8L9 5M12 8L9 11" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    <button 
                      onClick={() => handleDelete(org.id, org.name)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                    >
                      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M12 4V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="text-4xl mb-3 grayscale">🏢</div>
                  <div className="text-sm font-bold text-slate-600 tracking-tight">No organizations found</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
