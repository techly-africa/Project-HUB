"use client";

import { useState } from "react";
import { createOrgAction } from "@/app/actions/superadmin";
import { toast } from "sonner";

export default function CreateOrgModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createOrgAction(formData);
      toast.success("Organization created successfully");
      setIsOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center gap-2 active:scale-95"
      >
        <span>➕</span> New Organization
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={() => setIsOpen(false)} 
      />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
        
        <h2 className="text-xl font-black text-white mb-1">Create Organization</h2>
        <p className="text-sm text-slate-400 mb-8 font-medium">Add a new company or division</p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Name</label>
            <input 
              required
              autoFocus
              name="name"
              placeholder="e.g. Acme Corp"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Domain (Optional)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 font-bold">@</span>
              <input 
                name="domain"
                placeholder="acme.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-5 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-sm rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Org"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
