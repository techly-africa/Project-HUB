import { getProjects, getPlansByProject } from "@/lib/queries";
import { getActiveProjectId } from "@/lib/active-project";
import BrandLogo from "./BrandLogo";
import ProjectSwitcher from "./ProjectSwitcher";
import { SidebarLink } from "./SidebarLink";
import NewWorkstreamButton from "./NewWorkstreamButton";

export default async function Sidebar() {
  let projects: Awaited<ReturnType<typeof getProjects>> = [];
  let rawActiveId: string | null = null;

  try {
    [projects, rawActiveId] = await Promise.all([
      getProjects(),
      getActiveProjectId(),
    ]);
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
    <aside className="w-60 flex-shrink-0 bg-brand-navy flex flex-col h-screen shadow-2xl">
      <div className="px-6 pt-8 pb-6 border-b border-white/5 flex flex-col items-center">
        <BrandLogo className="w-28" showText={false} />
        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mt-4">Project Tracker</p>
      </div>

      <ProjectSwitcher projects={projects} activeProjectId={activeProjectId} />

      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <SidebarLink href="/" label="Dashboard" icon="⬛" exact />

        <div className="pt-2 pb-1 px-1">
          <p className="text-white/20 text-[9px] uppercase tracking-[0.2em] font-black">Workstreams</p>
        </div>

        {plans.map(plan => (
          <SidebarLink
            key={plan.id}
            href={`/plan/${plan.id}`}
            label={plan.name}
            icon="📋"
          />
        ))}

        {activeProjectId && (
          <NewWorkstreamButton projectId={activeProjectId} />
        )}

        <div className="pt-2 pb-1 px-1">
          <p className="text-white/20 text-[9px] uppercase tracking-[0.2em] font-black">Views</p>
        </div>

        <SidebarLink href="/roadmap" label="Roadmap" icon="🗺️" />
        <SidebarLink href="/repository" label="Repository" icon="🗂️" />
      </nav>
    </aside>
  );
}
