import { listOrgMembers } from "@/lib/superadmin-queries";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrgAction } from "@/app/actions/superadmin";
import MemberRow from "@/components/superadmin/MemberRow";
import DeleteOrgButton from "@/components/superadmin/DeleteOrgButton";
import InviteMemberModal from "@/components/superadmin/InviteMemberModal";
import LicenseManager from "@/components/superadmin/LicenseManager";

export default async function OrgDetailPage({ params }: { params: { id: string } }) {
  const admin = createSupabaseAdminClient();
  const [{ data: org }, members, { data: allOrgs }] = await Promise.all([
    admin.from("organizations").select("*").eq("id", params.id).single(),
    listOrgMembers(params.id),
    admin.from("organizations").select("id, name").neq("id", params.id).order("name"),
  ]);

  if (!org) notFound();

  return (
    <div className="space-y-8">
      {/* ... (breadcrumb section) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link 
            href="/superadmin/organizations"
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-700 transition-all"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 12L6 8L10 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">{org.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              Organization Profile 
              <span className="w-1 h-1 rounded-full bg-slate-700" /> 
              ID: {org.id}
            </p>
          </div>
        </div>
        
        <InviteMemberModal orgId={org.id} orgName={org.name} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Column */}
        <div className="lg:col-span-1 space-y-6">
          <LicenseManager 
            orgId={org.id}
            currentType={org.license_type}
            currentExpiry={org.license_expires_at}
            licenseKey={org.license_key}
          />

          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Org Settings</h2>
            <form action={updateOrgAction.bind(null, org.id)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Company Name</label>
                <input 
                  name="name"
                  defaultValue={org.name}
                  required
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600">Email Domain</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs">@</span>
                  <input 
                    name="domain"
                    defaultValue={org.domain || ""}
                    placeholder="example.com"
                    className="w-full bg-slate-800 border border-slate-700/50 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/20 hover:border-violet-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Save Changes
              </button>
            </form>
          </section>

          <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Danger Zone</h2>
            <p className="text-[11px] text-red-400/60 mb-4 leading-relaxed font-medium">
              Deleting this organization will disconnect all members and remove all associated projects. This cannot be undone.
            </p>
            <DeleteOrgButton id={org.id} name={org.name} />
          </section>
        </div>

        {/* Members Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Organization Members ({members.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50">
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-600">Member</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-600">Admin</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-600">Joined</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {members.map(member => (
                    <MemberRow 
                      key={member.id} 
                      member={member} 
                      orgId={org.id}
                      orgs={allOrgs ?? []}
                    />
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="text-3xl mb-2 grayscale">👥</div>
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No members found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
