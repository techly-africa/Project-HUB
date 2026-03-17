"use client";

import { motion } from "framer-motion";
import type { Plan, ProjectStats } from "@/lib/types";
import { P, MOTION } from "../tokens";
import { SlideShell, SlideHeader, Bar, CardLabel } from "../primitives";
import { useCountUp } from "../hooks";

export function SlideWorkstream({ plan, stats }: { plan: Plan; stats: ProjectStats }) {
  const active = stats.total - stats.not_applicable;
  const pct    = active > 0 ? Math.round((stats.completed / active) * 100) : 0;
  const n      = useCountUp(pct);

  const pills = [
    { key: "completed",   label: "Completed",   c: P.sage   },
    { key: "in_progress", label: "In Progress", c: P.teal   },
    { key: "blocked",     label: "Blocked",     c: P.coral  },
    { key: "critical",    label: "Critical",    c: "#E07B39" },
    { key: "not_started", label: "Not Started", c: P.muted  },
  ];

  const STATUS_COLOR: Record<string, string> = {
    completed:   P.sage,
    in_progress: P.teal,
    critical:    P.coral,
    blocked:     P.coral,
    not_started: P.muted,
  };

  return (
    <SlideShell>
      {/* Header + Big number */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <SlideHeader eyebrow="Workstream Detail" title={plan.name} />
          {/* Status pills */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
            {pills.map(({ key, label, c }) => {
              const v = stats[key as keyof ProjectStats] as number;
              if (!v) return null;
              return (
                <motion.span key={key} {...MOTION.fadeUp(0.1)} style={{
                  background: P.slate, border: `1px solid ${P.border}`,
                  borderRadius: 8, padding: "4px 10px",
                  fontSize: 11, fontWeight: 700, color: c,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: c }} />
                  {v} {label}
                </motion.span>
              );
            })}
          </div>
        </div>

        <motion.div {...MOTION.scale(0.05)} style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 58, fontWeight: 900, color: P.gold, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{n}%</p>
          <p style={{ fontSize: 9, color: P.muted, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700 }}>
            {stats.completed} / {active} complete
          </p>
          <div style={{ width: 120, marginTop: 8, marginLeft: "auto" }}>
            <Bar pct={pct} color={P.gold} h={4} delay={0.15} />
          </div>
        </motion.div>
      </div>

      {/* Phase list */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
        {plan.phases.map((ph, idx) => {
          const total = ph.tasks.length;
          const done  = ph.tasks.filter(t => t.status === "completed").length;
          const p     = total ? Math.round((done / total) * 100) : 0;

          return (
            <motion.div key={ph.id} {...MOTION.fadeUp(0.05 + idx * 0.04)}
              style={{ background: P.slate, border: `1px solid ${P.border}`, borderRadius: 12, padding: "0.75rem 0.9rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 9, fontWeight: 900, color: P.muted, fontFamily: "monospace" }}>{ph.wbs}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: P.ivory }}>{ph.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 900, color: P.gold }}>{p}%</span>
              </div>
              <Bar pct={p} color={P.gold} h={3} delay={0.1 + idx * 0.04} />
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 7 }}>
                {ph.tasks.slice(0, 10).map(t => (
                  <span key={t.id} title={t.name} style={{
                    padding: "2px 5px", borderRadius: 5, fontSize: 8, fontWeight: 700,
                    background: `${STATUS_COLOR[t.status] ?? P.muted}18`,
                    color: STATUS_COLOR[t.status] ?? P.muted,
                    border: `1px solid ${STATUS_COLOR[t.status] ?? P.muted}30`,
                  }}>
                    {t.wbs}
                  </span>
                ))}
                {ph.tasks.length > 10 && <span style={{ fontSize: 8, color: P.muted }}>+{ph.tasks.length - 10}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </SlideShell>
  );
}
