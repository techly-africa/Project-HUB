"use client";

import { motion } from "framer-motion";
import type { PlanSummary } from "../buildSlides";
import { P, MOTION } from "../tokens";
import { SlideShell, SlideHeader, Bar } from "../primitives";
import { useCountUp } from "../hooks";

export function SlideTeam({ plans }: { plans: PlanSummary[] }) {
  const all = plans.flatMap(({ plan }) =>
    plan.phases.flatMap(ph => ph.tasks.map(t => ({ ...t, planName: plan.name })))
  );

  const byPerson = all.reduce<Record<string, { name: string; tasks: typeof all }>>(
    (acc, t) => {
      const name = (t.assignee?.full_name ?? t.assignee?.email ?? t.owner ?? "Unassigned").trim();
      if (!acc[name]) acc[name] = { name, tasks: [] };
      acc[name].tasks.push(t);
      return acc;
    },
    {}
  );

  const people = Object.values(byPerson).sort((a, b) => b.tasks.length - a.tasks.length).slice(0, 8);
  const n = useCountUp(people.length);

  return (
    <SlideShell>
      <SlideHeader
        eyebrow="Team & Assignments"
        title={<><span style={{ color: P.gold }}>{n}</span> contributors</>}
      />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "0.65rem", overflow: "auto" }}>
        {people.map((person, idx) => {
          const done    = person.tasks.filter(t => t.status === "completed").length;
          const active  = person.tasks.filter(t => t.status === "in_progress").length;
          const at_risk = person.tasks.filter(t => ["blocked","critical"].includes(t.status)).length;
          const pct     = person.tasks.length > 0 ? Math.round((done / person.tasks.length) * 100) : 0;

          // Initials from name
          const initials = person.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

          return (
            <motion.div key={person.name} {...MOTION.scale(idx * 0.055)}
              style={{ background: P.slate, border: `1px solid ${P.border}`, borderRadius: 14, padding: "1rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(201,169,98,0.12)", border: "1px solid rgba(201,169,98,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 900, color: P.gold,
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: P.ivory, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {person.name}
                  </p>
                  <p style={{ fontSize: 10, color: P.muted }}>{person.tasks.length} tasks assigned</p>
                </div>
                <p style={{ fontSize: 18, fontWeight: 900, color: P.gold, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{pct}%</p>
              </div>

              <Bar pct={pct} color={P.gold} h={3} delay={idx * 0.055} />

              <div style={{ display: "flex", gap: 10, marginTop: 9 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: P.sage }}>{done} done</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: P.teal }}>{active} active</span>
                {at_risk > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: P.coral }}>{at_risk} at risk</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </SlideShell>
  );
}
