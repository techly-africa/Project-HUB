import { getGlobalStats, listAllOrgs } from "@/lib/superadmin-queries";
import OrgTable from "@/components/superadmin/OrgTable";
import CreateOrgModal from "@/components/superadmin/CreateOrgModal";

export default async function OrgsPage() {
  const [stats, orgs] = await Promise.all([
    getGlobalStats(),
    listAllOrgs(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">Organizations</h1>
          <p className="text-slate-400 text-sm">Manage company accounts and access</p>
        </div>
        <CreateOrgModal />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Organizations" value={stats.total_orgs} icon="🏢" color="violet" />
        <StatCard label="Total Users" value={stats.total_users} icon="👥" color="teal" />
        <StatCard label="Active Projects" value={stats.total_projects} icon="📁" color="blue" />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <OrgTable initialOrgs={orgs} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400",
    teal: "from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-6 relative overflow-hidden group`}>
      <div className="relative z-10">
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-3xl font-black text-white mb-1">{value.toLocaleString()}</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">
          {label}
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12 grayscale select-none pointer-events-none">
        {icon}
      </div>
    </div>
  );
}
