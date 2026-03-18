"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie,
} from "recharts";
import { motion } from "framer-motion";
import { P, CHART_COLORS, MOTION } from "./tokens";

// ── Shared tooltip ────────────────────────────────────────────────────────────
interface TooltipEntry {
  color?: string;
  value: number | string;
  name?: string;
}

const TooltipBox = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: P.slateLight, border: `1px solid ${P.border}`, borderRadius: 9, padding: "8px 12px" }}>
      {label && <p style={{ fontSize: 10, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ fontSize: 12, fontWeight: 700, color: entry.color ?? P.gold }}>
          {typeof entry.value === "number" && entry.name?.includes("pct") ? `${entry.value}%` : entry.value}
        </p>
      ))}
    </div>
  );
};

// ── Workstream completion bar chart ───────────────────────────────────────────
export function WorkstreamChart({
  data,
}: {
  data: { name: string; pct: number }[];
}) {
  return (
    <motion.div {...MOTION.fadeUp(0.15)} style={{ width: "100%", height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: P.muted }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <YAxis
            type="category" dataKey="name" tick={{ fontSize: 11, fill: P.stone, fontWeight: 500 }}
            tickLine={false} axisLine={false} width={130}
            tickFormatter={v => v.length > 18 ? v.slice(0, 17) + "…" : v}
          />
          <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={14}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// ── Task status donut chart ───────────────────────────────────────────────────
export function StatusPie({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  return (
    <motion.div {...MOTION.fadeUp(0.2)} style={{ width: "100%", height: 140 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.filter(d => d.value > 0)}
            cx="50%" cy="50%"
            innerRadius={40} outerRadius={58}
            dataKey="value" startAngle={90} endAngle={-270}
            stroke="none"
          >
            {data.filter(d => d.value > 0).map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<TooltipBox />} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// ── Risk / blocker count chart ────────────────────────────────────────────────
export function RiskChart({
  blocked, critical, overdue,
}: {
  blocked: number; critical: number; overdue: number;
}) {
  const data = [
    { name: "Blocked",  value: blocked,  fill: P.coral },
    { name: "Critical", value: critical, fill: "#E07B39" },
    { name: "Overdue",  value: overdue,  fill: P.gold },
  ];
  return (
    <motion.div {...MOTION.fadeUp(0.1)} style={{ width: "100%", height: 130 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: P.stone }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9, fill: P.muted }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={36}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
