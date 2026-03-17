"use client";

import { useState, useTransition } from "react";
import type { OrgMember } from "@/lib/superadmin-queries";
import { format } from "date-fns";
import { removeOrgMemberAction, transferMemberAction, resendInviteAction } from "@/app/actions/superadmin";
import { toast } from "sonner";

interface Props {
  member: OrgMember;
  orgId: string;
  orgs: { id: string; name: string }[];
}

export default function MemberRow({ member, orgId, orgs }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showTransfer, setShowTransfer] = useState(false);

  async function handleRemove() {
    if (!confirm(`Remove ${member.email} from organization?`)) return;
    startTransition(async () => {
      try {
        await removeOrgMemberAction(member.id, orgId);
        toast.success("Member removed");
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  }

  async function handleTransfer(toOrgId: string) {
    startTransition(async () => {
      try {
        await transferMemberAction(member.id, toOrgId, orgId);
        toast.success("Member transferred");
        setShowTransfer(false);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  }

  async function handleResendInvite() {
    startTransition(async () => {
      try {
        await resendInviteAction(member.email, orgId, member.full_name || undefined);
        toast.success("Invitation resent");
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  }

  return (
    <tr className="hover:bg-slate-800/40 transition-all group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {member.avatar_url ? (
            <img src={member.avatar_url} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">
              {member.full_name?.[0] || member.email[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-sm font-bold text-white leading-tight">{member.full_name || "Anonymous User"}</div>
            <div className="text-[11px] text-slate-500 font-medium">{member.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {member.is_superadmin ? (
          <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
            Super
          </span>
        ) : (
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">—</span>
        )}
      </td>
      <td className="px-6 py-4">
        {/* Joined date removed as it is not in profiles schema */}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 relative">
          {showTransfer ? (
            <div className="absolute right-0 top-0 z-[70] bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-2 min-w-[200px]">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-2 py-2 border-b border-slate-800 mb-2">Transfer to...</div>
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {orgs.map(o => (
                  <button
                    key={o.id}
                    onClick={() => handleTransfer(o.id)}
                    disabled={isPending}
                    className="w-full text-left px-2 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>🏢</span> <span className="truncate">{o.name}</span>
                  </button>
                ))}
                {orgs.length === 0 && <p className="text-[10px] text-slate-500 px-2 italic py-2">No other orgs</p>}
              </div>
              <button 
                onClick={() => setShowTransfer(false)}
                className="w-full mt-2 py-1 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors border-t border-slate-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={handleResendInvite}
                disabled={isPending}
                className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white border border-teal-500/20 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                Resend Invite
              </button>
              <button 
                onClick={() => setShowTransfer(true)}
                disabled={isPending}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                Transfer
              </button>
              <button 
                onClick={handleRemove}
                disabled={isPending}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
