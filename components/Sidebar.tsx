import { getProjects, getPlansByProject } from "@/lib/queries";
import { getActiveProjectId } from "@/lib/active-project";
import BrandLogo from "./BrandLogo";
import ProjectSwitcher from "./ProjectSwitcher";
import { SidebarLink } from "./SidebarLink";
import NewWorkstreamButton from "./NewWorkstreamButton";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { cn } from "@/lib/utils";

export default async function Sidebar() {
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  let projects: Awaited<ReturnType<typeof getProjects>> = [];
  let rawActiveId: string | null = null;
  let currentProfile: { is_superadmin: boolean } | null = null;

  try {
    const results = await Promise.all([
      getProjects(),
      getActiveProjectId(),
      user ? sb.from("profiles").select("is_superadmin").eq("id", user.id).single() : Promise.resolve({ data: null }),
    ]);
    projects = results[0];
    rawActiveId = results[1];
    currentProfile = results[2].data;
  } catch (err) {
    console.error("[Sidebar] Failed to load data:", err);
  }

  const activeProjectId = rawActiveId ?? projects[0]?.id ?? "";

  let plans: Awaited<ReturnType<typeof getPlansByProject>> = [];
  try {
    plans = activeProjectId ? await getPlansByProject(activeProjectId) : [];
  } catch (err) {
    console.error("[Sidebar] Failed to load plans:", err);
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-background-primary border-r border-border-subtle flex flex-col h-screen overflow-hidden sidebar-dark">
      <div className="px-6 pt-10 pb-8 flex flex-col">
        <div className="relative">
          <BrandLogo className="w-full h-8" variant="light" />
          <div className="absolute -top-4 -right-2 px-1.5 py-0.5 bg-accent-primary/10 border border-accent-primary/20 rounded text-[8px] font-black text-accent-primary uppercase tracking-widest">
            Enterprise
          </div>
        </div>
        <p className="text-muted text-[9px] uppercase tracking-[0.2em] font-medium mt-6 pl-1">Powered by Avel Africa</p>
      </div>

      <div className="px-4 mb-4">
        <ProjectSwitcher projects={projects} activeProjectId={activeProjectId} />
      </div>

      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto scrollbar-hide">
        {/* Core Section */}
        <div className="space-y-1">
          <SidebarLink href="/" label="Executive Dashboard" icon={<span className="text-lg">📊</span>} exact />
          <SidebarLink href="/my-tasks" label="My Tasks" icon={<span className="text-lg">✅</span>} />
        </div>

        {/* Workstreams Section */}
        <div className="space-y-3">
          <div className="px-3">
            <p className="text-muted text-[9px] uppercase tracking-[0.2em] font-bold">Active Workstreams</p>
          </div>
          <div className="space-y-1">
            {plans.length === 0 ? (
              <p className="px-3 text-[10px] text-muted italic">No workstreams active</p>
            ) : (
              plans.map(plan => (
                <SidebarLink
                  key={plan.id}
                  href={`/plan/${plan.id}`}
                  label={plan.name}
                  icon={
                    <div 
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        plan.color.includes('bg-') ? plan.color : ''
                      )} 
                      style={{ backgroundColor: plan.color.includes('bg-') ? undefined : plan.color }} 
                    />
                  }
                />
              ))
            )}
            
            <div className="pt-2">
              {activeProjectId && (
                <NewWorkstreamButton projectId={activeProjectId} />
              )}
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-3">
          <div className="px-3">
            <p className="text-muted text-[9px] uppercase tracking-[0.2em] font-bold">Intelligence & Assets</p>
          </div>
          <div className="space-y-1">
            <SidebarLink href="/roadmap" label="Product Roadmap" icon={<span className="text-lg">🗺️</span>} />
            <SidebarLink href="/documents" label="Knowledge Repository" icon={<span className="text-lg">🗂️</span>} />
          </div>
        </div>

        {currentProfile?.is_superadmin && (
          <div className="pt-6 border-t border-border-subtle space-y-3">
            <div className="px-3">
              <p className="text-accent-secondary/50 text-[9px] font-bold uppercase tracking-[0.2em]">Platform Admin</p>
            </div>
            <SidebarLink
              href="/superadmin/organizations"
              label="Organization Control"
              icon={<span className="text-lg">⚡</span>}
              className="!bg-accent-secondary/5 !text-accent-secondary hover:!bg-accent-secondary/10"
            />
          </div>
        )}
      </nav>

      {/* Footer / User Preview or Status could go here */}
      <div className="p-4 bg-surface/50 border-t border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-success animate-pulse" />
          <span className="text-[10px] font-medium text-secondary">System Operational</span>
        </div>
      </div>
    </aside>
  );
}
