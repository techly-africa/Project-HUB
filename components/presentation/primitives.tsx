"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { P, MOTION } from "./tokens";
import { useCountUp } from "./hooks";
import type { Task } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────
export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const today = new Date().toLocaleDateString("en-GB", {
  day: "numeric", month: "long", year: "numeric",
});

// ── SlideShell ────────────────────────────────────────────────────────────────
export function SlideShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      {children}
    </div>
  );
}

// ── SlideHeader ───────────────────────────────────────────────────────────────
export function SlideHeader({
  eyebrow, title, delay = 0,
}: {
  eyebrow: string;
  title: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div {...MOTION.fadeUp(delay)}>
      <p style={{
        fontSize: 9, fontWeight: 700, color: P.gold,
        textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 7,
      }}>
        {eyebrow}
      </p>
      <h2 style={{
        fontSize: "clamp(1.55rem, 2.6vw, 2rem)",
        fontWeight: 900, color: P.ivory, lineHeight: 1.1, margin: 0,
      }}>
        {title}
      </h2>
      <div style={{
        height: 1, marginTop: 10,
        background: `linear-gradient(to right, ${P.gold}, transparent)`,
        opacity: 0.4,
      }} />
    </motion.div>
  );
}

// ── AnimatedBar ───────────────────────────────────────────────────────────────
export function Bar({
  pct, color = P.gold, h = 5, delay = 0, track = "rgba(255,255,255,0.06)",
}: {
  pct: number; color?: string; h?: number; delay?: number; track?: string;
}) {
  return (
    <div style={{ height: h, background: track, borderRadius: 999, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ delay, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: "100%", background: color, borderRadius: 999 }}
      />
    </div>
  );
}

// ── ArcProgress (SVG) ─────────────────────────────────────────────────────────
export function ArcProgress({ pct, sz = 118 }: { pct: number; sz?: number }) {
  const r   = sz * 0.37;
  const c   = sz / 2;
  const len = 2 * Math.PI * r;
  const sw  = sz * 0.09;
  const n   = useCountUp(pct);

  return (
    <motion.svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} {...MOTION.fadeUp(0.1)}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
      <motion.circle
        cx={c} cy={c} r={r} fill="none"
        stroke={P.gold} strokeWidth={sw} strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${len}` }}
        animate={{ strokeDasharray: `${(pct / 100) * len} ${len}` }}
        transition={{ delay: 0.2, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        transform={`rotate(-90 ${c} ${c})`}
      />
      <text x={c} y={c - 2} textAnchor="middle" fill={P.ivory} fontSize={sz * 0.2} fontWeight="900" fontFamily="Inter,system-ui">{n}%</text>
      <text x={c} y={c + sz * 0.13} textAnchor="middle" fill={P.muted} fontSize={sz * 0.075} fontWeight="700" letterSpacing="2" fontFamily="Inter,system-ui">DONE</text>
    </motion.svg>
  );
}

// ── KpiCard ───────────────────────────────────────────────────────────────────
export function KpiCard({
  label, value, sub, accent = P.gold, delay = 0,
}: {
  label: string; value: number | string; sub?: string; accent?: string; delay?: number;
}) {
  const num     = typeof value === "number" ? value : null;
  const counted = useCountUp(num ?? 0);

  return (
    <motion.div {...MOTION.fadeUp(delay)} style={{
      background: P.slate, border: `1px solid ${P.border}`,
      borderRadius: 14, padding: "1.05rem 1.15rem",
    }}>
      <p style={{ fontSize: 9, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 34, fontWeight: 900, color: accent, lineHeight: 1, fontFamily: "Inter,system-ui", fontVariantNumeric: "tabular-nums" }}>
        {num !== null ? counted : value}
      </p>
      {sub && <p style={{ fontSize: 10, color: P.muted, marginTop: 4 }}>{sub}</p>}
    </motion.div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({
  children, style, delay = 0,
}: {
  children: React.ReactNode; style?: React.CSSProperties; delay?: number;
}) {
  return (
    <motion.div {...MOTION.fadeUp(delay)} style={{
      background: P.slate, border: `1px solid ${P.border}`,
      borderRadius: 14, padding: "0.9rem 1rem", ...style,
    }}>
      {children}
    </motion.div>
  );
}

export function CardLabel({ children, color = P.gold }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{ fontSize: 9, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 9 }}>
      {children}
    </p>
  );
}

// ── TaskRow ───────────────────────────────────────────────────────────────────
type TaskWithCtx = Task & { planName?: string };

const STATUS_COLOR: Record<string, string> = {
  completed:   P.sage,
  in_progress: P.teal,
  blocked:     P.coral,
  critical:    "#E07B39",
  not_started: P.muted,
};

export function TaskRow({ task, idx }: { task: TaskWithCtx; idx: number }) {
  const [open, setOpen] = useState(false);
  const dot = STATUS_COLOR[task.status] ?? P.muted;
  const overdue = task.deadline && new Date(task.deadline) < new Date();

  return (
    <motion.div
      {...MOTION.fadeUp(idx * 0.045)}
      onClick={() => setOpen(x => !x)}
      whileHover={{ backgroundColor: "rgba(201,169,98,0.05)" }}
      style={{
        background: open ? "rgba(201,169,98,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${open ? "rgba(201,169,98,0.2)" : "rgba(255,255,255,0.05)"}`,
        borderRadius: 9, padding: "0.52rem 0.75rem", cursor: "pointer",
        transition: "background 0.18s, border-color 0.18s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12, color: P.ivory, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {task.name}
        </span>
        {task.planName && (
          <span style={{ fontSize: 9, color: P.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>
            {task.planName}
          </span>
        )}
        {task.deadline && (
          <span style={{ fontSize: 9, fontWeight: 700, color: overdue ? P.coral : P.gold, flexShrink: 0 }}>
            {fmtDate(task.deadline)}
          </span>
        )}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: P.muted, display: "flex", flexShrink: 0 }}
        >
          <ChevronDown size={12} />
        </motion.span>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{ paddingTop: "0.45rem", paddingLeft: 14, display: "flex", flexWrap: "wrap", gap: "0.35rem 1.1rem" }}
        >
          {task.owner && <span style={{ fontSize: 10, color: P.stone }}><span style={{ color: P.gold }}>Owner </span>{task.owner}</span>}
          {task.assignee?.full_name && <span style={{ fontSize: 10, color: P.stone }}><span style={{ color: P.gold }}>Assigned </span>{task.assignee.full_name}</span>}
          {task.remarks && <span style={{ fontSize: 10, color: P.stone }}><span style={{ color: P.gold }}>Remarks </span>{task.remarks}</span>}
          {!task.owner && !task.assignee && !task.remarks && (
            <span style={{ fontSize: 10, color: P.muted, fontStyle: "italic" }}>No additional details.</span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ── SectionBadge ──────────────────────────────────────────────────────────────
export function SectionBadge({ n, label }: { n: string | number; label: string }) {
  return (
    <motion.div {...MOTION.fadeUp()} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
      <span style={{ fontSize: "clamp(3rem,8vw,5rem)", fontWeight: 900, color: "rgba(201,169,98,0.18)", lineHeight: 1, fontFamily: "Inter,system-ui" }}>
        {String(n).padStart(2, "0")}
      </span>
      <div style={{ width: 2, height: 48, background: P.gold, borderRadius: 2, opacity: 0.6 }} />
      <span style={{ fontSize: "clamp(1.2rem,2.5vw,1.6rem)", fontWeight: 800, color: P.ivory }}>{label}</span>
    </motion.div>
  );
}
