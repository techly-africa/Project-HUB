"use client";

import { useState } from "react";
import { inviteUserToOrgAction } from "@/app/actions/superadmin";
import { toast } from "sonner";

interface Props {
  orgId: string;
  orgName: string;
}

export default function InviteMemberModal({ orgId, orgName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const fullName = formData.get("full_name") as string;

    try {
      await inviteUserToOrgAction(orgId, email, fullName);
      toast.success(`Invite sent to ${email} for ${orgName}`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-slate-700 flex items-center gap-2 active:scale-95"
      >
        <span>✉️</span> Invite Member
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={() => setIsOpen(false)} 
      />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden text-left">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-teal to-violet-500" />
        
        <h2 className="text-xl font-black text-white mb-1">Invite Member</h2>
        <p className="text-sm text-slate-400 mb-8 font-medium">Add a user to <span className="text-white">{orgName}</span></p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name (Optional)</label>
            <input 
              name="full_name"
              placeholder="e.g. John Doe"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-teal transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</label>
            <input 
              required
              type="email"
              name="email"
              placeholder="john@example.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-teal transition-colors"
            />
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
              className="flex-1 px-4 py-3.5 bg-brand-teal hover:bg-brand-teal/80 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-brand-teal/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Send Invite"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
