import { useMemo } from "react";
import type { Plan, Project, ProjectStats } from "@/lib/types";
import { motion } from "framer-motion";

interface Props {
  plans: { plan: Plan; stats: ProjectStats }[];
}

export function ProjectHealthScore({ plans }: Props) {
  const score = useMemo(() => {
    const allTasks = plans.flatMap(p => p.plan.phases.flatMap(ph => ph.tasks));
    const totalActive = allTasks.filter(t => t.status !== "not_applicable").length;
    const completed = allTasks.filter(t => t.status === "completed").length;
    const blocked = allTasks.filter(t => t.status === "blocked").length;
    const critical = allTasks.filter(t => t.status === "critical").length;
    const overdue = allTasks.filter(t => t.deadline && t.status !== "completed" && new Date(t.deadline) < new Date()).length;

    if (totalActive === 0) return 100;

    const completionExp = (completed / totalActive) * 100;
    
    // Penalties
    const blockedPenalty = Math.min(25, blocked * 8);
    const criticalPenalty = Math.min(40, critical * 15);
    const overduePenalty = Math.min(30, overdue * 10);

    let final = completionExp - blockedPenalty - criticalPenalty - overduePenalty;
    
    // Recovery bonus for early stages
    if (completionExp < 20) final += 30; 
    
    return Math.max(0, Math.min(100, Math.round(final)));
  }, [plans]);

  const color = score > 80 ? "text-accent-success" : score > 50 ? "text-accent-warning" : "text-accent-secondary";
  const label = score > 80 ? "Excellent" : score > 50 ? "Stable" : "At Risk";

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group relative bg-surface border border-border-subtle rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:shadow-premium"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-muted mb-1">Project Health Index</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-4xl font-bold tracking-tighter ${color}`}>{score}</h3>
            <span className="text-sm font-bold text-muted">/ 100</span>
          </div>
        </div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${color.replace('text-', 'bg-').replace('accent-', 'accent-')}/10 ${color.replace('text-', 'border-').replace('accent-', 'accent-')}/20 ${color}`}
        >
          {label}
        </motion.div>
      </div>

      <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`absolute top-0 left-0 h-full rounded-full ${score > 80 ? 'bg-accent-success' : score > 50 ? 'bg-accent-primary' : 'bg-accent-secondary'}`}
        />
      </div>

      <p className="text-xs text-muted font-medium leading-relaxed">
        Calculated based on <span className="text-contrast font-bold">momentum vs dependencies</span>.
        {score < 60 ? " Immediate intervention recommended on blocked tasks." : " Trajectory remains within nominal parameters."}
      </p>

      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
    </motion.div>
  );
}

export function AIInsightPanel({ plans }: { plans: { plan: Plan; stats: ProjectStats }[] }) {
  const insights = useMemo(() => {
    const allTasks = plans.flatMap(p => p.plan.phases.flatMap(ph => ph.tasks));
    const completed = allTasks.filter(t => t.status === "completed").length;
    const total = allTasks.filter(t => t.status !== "not_applicable").length;
    const blocked = allTasks.filter(t => t.status === "blocked").length;
    const critical = allTasks.filter(t => t.status === "critical").length;
    
    const res: { text: string; type: "success" | "warning" | "danger" | "info" }[] = [];

    if (critical > 0) {
      res.push({ text: `Critical risk detected in ${critical} segments. Immediate executive action required to maintain timeline.`, type: "danger" });
    }
    if (blocked > 0) {
      res.push({ text: `${blocked} workstreams are currently stalled. Review resource allocation for cross-functional dependencies.`, type: "warning" });
    }
    if (completed / total > 0.75) {
      res.push({ text: "Velocity is exceeding forecasts. Deployment ahead of schedule is strategically viable.", type: "success" });
    } else if (completed > 0) {
      res.push({ text: "Momentum is stabilizing across primary workstreams. Consistent output observed.", type: "info" });
    }

    if (allTasks.length > 50 && blocked === 0 && critical === 0) {
      res.push({ text: "Exceptional operational discipline. All complex nodes are tracking within threshold.", type: "success" });
    }

    return res.length > 0 ? res : [{ text: "Gathering telemetry... AI insights will materialize as project complexity increases.", type: "info" }];
  }, [plans]);

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-surface border border-border-subtle rounded-[32px] p-8 relative overflow-hidden transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary animate-pulse"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-contrast">Executive Intelligence</h2>
          <p className="text-xs text-muted">AI Insight Engine</p>
        </div>
      </div>

      <div className="space-y-6">
        {insights.map((insight, i) => (
          <motion.div 
            key={i} 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4 group"
          >
            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
              insight.type === "danger" ? 'bg-accent-secondary shadow-[0_0_8px_rgba(219,39,119,0.5)]' : 
              insight.type === "warning" ? 'bg-accent-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
              insight.type === "success" ? 'bg-accent-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
              'bg-accent-primary shadow-[0_0_8px_rgba(20,184,166,0.5)]'
            }`} />
            <p className="text-sm font-medium text-secondary group-hover:text-contrast transition-colors leading-relaxed">
              {insight.text}
            </p>
          </motion.div>
        ))}
      </div>

      {/* AI background effect */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-accent-primary/5 blur-[60px] rounded-full" />
    </motion.div>
  );
}
