import Link from "next/link";
import type { Plan, ProjectStats } from "@/lib/types";

interface PlanSummary { plan: Plan; stats: ProjectStats }

const STATUS_COLORS = [
  { key: "completed", label: "Completed", color: "bg-emerald-500" },
  { key: "critical", label: "Critical", color: "bg-red-500" },
  { key: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { key: "blocked", label: "Blocked", color: "bg-brand-pink" },
  { key: "not_started", label: "Not Started", color: "bg-slate-300" },
];

function PlanCard({ data, href }: { data: PlanSummary; href: string }) {
  const { plan, stats } = data;
  const active = stats.total - stats.not_applicable;
  const pct = active ? Math.round((stats.completed / active) * 100) : 0;

  const config: Record<string, { label: string; color: string; text: string; light: string }> = {
    "product-tech": { label: "Product & Tech", color: "bg-brand-blue", text: "text-brand-blue", light: "bg-brand-blue/10" },
    "legal": { label: "Legal", color: "bg-amber-500", text: "text-amber-500", light: "bg-amber-500/10" },
    "biz-dev": { label: "Business Dev", color: "bg-brand-pink", text: "text-brand-pink", light: "bg-brand-pink/10" },
  };

  const typeConfig = config[plan.type] || { label: "General", color: "bg-slate-500", text: "text-slate-500", light: "bg-slate-500/10" };

  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-brand-teal/20 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg ${typeConfig.light} ${typeConfig.text}`}>
              {typeConfig.label}
            </span>
            <h3 className="text-slate-900 font-extrabold mt-3 text-lg leading-tight group-hover:text-brand-teal transition-colors">
              {plan.name}
            </h3>
          </div>
          <span className="text-slate-200 group-hover:text-brand-teal text-xl transition-colors">→</span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 rounded-full bg-slate-50 overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${typeConfig.color}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-slate-800">{pct}%</span>
          <span className="text-xs text-slate-400">{stats.completed}/{active} tasks complete</span>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_COLORS.map(({ key, label, color }) => {
            const count = stats[key as keyof ProjectStats];
            if (count === 0) return null;
            return (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-slate-600">{count} {label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard({
  productTechPlan,
  legalPlan,
  bizDevPlan
}: {
  productTechPlan: PlanSummary;
  legalPlan: PlanSummary;
  bizDevPlan: PlanSummary
}) {
  const plans = [productTechPlan, legalPlan, bizDevPlan];
  const totalTasks = plans.reduce((acc, p) => acc + p.stats.total, 0);
  const totalDone = plans.reduce((acc, p) => acc + p.stats.completed, 0);
  const totalBlocked = plans.reduce((acc, p) => acc + p.stats.blocked, 0);
  const totalCritical = plans.reduce((acc, p) => acc + p.stats.critical, 0);
  const totalNotApplicable = plans.reduce((acc, p) => acc + p.stats.not_applicable, 0);
  const totalActive = plans.reduce((acc, p) => acc + p.stats.in_progress, 0) + totalCritical;

  const overallPct = totalTasks ? Math.round((totalDone / (totalTasks - totalNotApplicable)) * 100) : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">March 2026</p>
        <h1 className="text-2xl font-bold text-slate-800">Merchant Lending — Project Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Pre-launch phase · Product name TBD · Tenor: 60 days · Partners: MTN Rwanda, I&amp;M Bank, Panamax
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Overall Progress", value: `${overallPct}%`, sub: `${totalDone}/${totalTasks - totalNotApplicable} tasks` },
          { label: "Active & Critical", value: totalActive, sub: `${totalCritical} critical` },
          { label: "Blocked", value: totalBlocked, sub: "need action", red: totalBlocked > 0 },
          { label: "Phases", value: plans.reduce((acc, p) => acc + p.plan.phases.length, 0), sub: "across 3 tracks" },
        ].map(({ label, value, sub, red }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${red ? "text-red-600" : "text-slate-800"}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PlanCard data={productTechPlan} href="/plan/product-tech" />
        <PlanCard data={legalPlan} href="/plan/legal" />
        <PlanCard data={bizDevPlan} href="/plan/biz-dev" />
      </div>

      {/* Immediate actions */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-bold text-slate-800 mb-3">🔔 Immediate Actions Required</h2>
        <ol className="space-y-2">
          {[
            { text: "Sign Panamax development contract", badge: "CRITICAL", color: "bg-red-100 text-red-700" },
            { text: "Convene tripartite commercial discussion (MTN / Rukisha / I&M)", badge: "HIGH", color: "bg-orange-100 text-orange-700" },
            { text: "Respond to TransUnion bureau integration proposal", badge: "HIGH", color: "bg-orange-100 text-orange-700" },
            { text: "Schedule RDB meeting — business registry API for KYB", badge: "PENDING", color: "bg-amber-100 text-amber-700" },
            { text: "Schedule RRA tax compliance meeting", badge: "PENDING", color: "bg-amber-100 text-amber-700" },
            { text: "Attend Scoring & NPL meeting (Monday)", badge: "THIS WEEK", color: "bg-blue-100 text-blue-700" },
            { text: "Define the product name", badge: "PENDING", color: "bg-slate-100 text-slate-600" },
          ].map(({ text, badge, color }, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${color}`}>{badge}</span>
              <span className="text-slate-700">{text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
