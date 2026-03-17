"use client";

import { useState, useTransition } from "react";
import { updateOrgLicenseAction } from "@/app/actions/superadmin";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  orgId: string;
  currentType: "standard" | "freemium";
  currentExpiry: string | null;
  licenseKey: string | null;
}

export default function LicenseManager({ orgId, currentType, currentExpiry, licenseKey }: Props) {
  const [isPending, startTransition] = useTransition();
  const [days, setDays] = useState(30);

  async function handleUpdate(type: "standard" | "freemium") {
    startTransition(async () => {
      try {
        await updateOrgLicenseAction(orgId, type, days);
        toast.success(`License updated to ${type}`);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  }

  const isExpired = currentExpiry ? new Date(currentExpiry) < new Date() : true;

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">License Management</h2>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
          isExpired 
            ? "text-red-400 bg-red-500/10 border-red-500/20" 
            : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        }`}>
          {isExpired ? "Expired" : "Active"}
        </span>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Type</p>
              <p className="text-xs font-bold text-white capitalize">{currentType}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Expires At</p>
              <p className="text-xs font-bold text-slate-300">
                {currentExpiry ? format(new Date(currentExpiry), "MMM d, yyyy") : "Never"}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Current Key</p>
            <p className="text-[10px] font-mono text-slate-500 break-all">{licenseKey || "None issued"}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Duration (Days)</label>
            <div className="grid grid-cols-4 gap-2">
              {[7, 30, 90, 365].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    days === d 
                      ? "bg-violet-600 border-violet-500 text-white" 
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {d === 30 ? "1M" : d === 90 ? "3M" : d === 365 ? "1Y" : `${d}d`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleUpdate("standard")}
              disabled={isPending}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              Standard
            </button>
            <button
              onClick={() => handleUpdate("freemium")}
              disabled={isPending}
              className="py-2.5 bg-amber-500/10 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/20 hover:border-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              Freemium
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
