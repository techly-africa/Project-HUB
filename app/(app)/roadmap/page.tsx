import { getPlanByType } from "@/lib/queries";
import GanttChart from "@/components/GanttChart";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const [productTech, legal, bizDev] = await Promise.all([
    getPlanByType("product-tech"),
    getPlanByType("legal"),
    getPlanByType("biz-dev"),
  ]);

  const allPhases = [
    ...productTech.phases.map(p => ({ ...p, type: 'Product & Tech', color: 'bg-brand-blue' })),
    ...legal.phases.map(p => ({ ...p, type: 'Legal', color: 'bg-amber-500' })),
    ...bizDev.phases.map(p => ({ ...p, type: 'Business Dev', color: 'bg-brand-pink' }))
  ].sort((a, b) => a.wbs.localeCompare(b.wbs));

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <header className="mb-12">
        <p className="text-[10px] font-black text-brand-teal uppercase tracking-[0.2em] mb-2">Strategic Overview</p>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Project Roadmap</h1>
        <p className="text-slate-500 font-medium">Unified Gantt visualization of all critical milestones across Technology and Operational workstreams.</p>
      </header>

      <div className="mb-12">
        <GanttChart phases={allPhases} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allPhases.map((phase) => {
          const totalTasks = phase.tasks.length;
          const completedTasks = phase.tasks.filter(t => t.status === 'completed').length;
          const pct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
          return (
            <div key={phase.id} className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-lg ${phase.color} shadow-brand-blue/20`}>
                    {phase.wbs}
                  </span>
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg mb-1 block w-fit ${phase.color}/10 text-slate-700 opacity-80 bg-slate-100`}>
                      {phase.type}
                    </span>
                    <h3 className="text-lg font-black text-slate-900">{phase.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{pct}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                </div>
              </div>

              {/* Tiny progress strip */}
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 mb-6">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${phase.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {phase.tasks.slice(0, 5).map(task => (
                  <div key={task.id} className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border ${task.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                    task.status === 'critical' ? 'bg-red-50 border-red-100 text-red-600' :
                      'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                    {task.wbs}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-blue" />
          <span>Product & Technology</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Legal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-pink" />
          <span>Business Development</span>
        </div>
      </footer>
    </div>
  );
}
