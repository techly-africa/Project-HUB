import { getOrganization, getProfiles, getTaskStatuses } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import MembersManager from "@/components/MembersManager";
import StatusManager from "@/components/StatusManager";

export default async function SettingsPage() {
  const sb = createSupabaseServerClient();
  const [org, members, { data: { user } }] = await Promise.all([
    getOrganization(),
    getProfiles(),
    sb.auth.getUser(),
  ]);

  let statuses: Awaited<ReturnType<typeof getTaskStatuses>> = [];
  try {
    statuses = await getTaskStatuses();
  } catch {
    // migration not yet applied
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Settings</h1>

      {/* Organization */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Organization</h2>
        {org ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-lg">{org.name[0]}</span>
            </div>
            <div>
              <p className="font-black text-slate-900 text-lg">{org.name}</p>
              {org.domain && (
                <p className="text-sm text-slate-400 mt-0.5">@{org.domain}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No organization found — run migration 014 in your Supabase dashboard.</p>
        )}
      </section>

      {/* Priority Status */}
      <StatusManager statuses={statuses} />

      {/* Members */}
      <MembersManager members={members} currentUserId={user?.id ?? ""} />
    </div>
  );
}
