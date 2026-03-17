/**
 * Design tokens for the executive presentation system.
 * Palette: "Refined Authority" — Swiss fintech meets boardroom precision.
 */

export const P = {
  // ── Backgrounds ──────────────────────────────────────────
  navy:       "#0A192F",   // deep slide background
  slate:      "#1E293B",   // surface / card base
  slateLight: "#243447",   // elevated card
  border:     "rgba(201,169,98,0.15)",  // gold-tinted structural border
  borderSub:  "rgba(255,255,255,0.06)", // subtle white border

  // ── Text ─────────────────────────────────────────────────
  ivory:  "#F8F6F3",   // primary text (warm, not harsh)
  stone:  "#94A3B8",   // secondary text
  muted:  "#475569",   // tertiary / labels

  // ── Accent system ─────────────────────────────────────────
  gold:   "#C9A962",   // authority / callouts
  goldHi: "#E5C97E",   // gold on hover
  sage:   "#7D9B76",   // positive / completed
  teal:   "#3D8B8B",   // active / in-progress
  coral:  "#E07A5F",   // critical / risk

  // ── Semantic ─────────────────────────────────────────────
  success: "#7D9B76",
  warning: "#C9A962",
  danger:  "#E07A5F",
  info:    "#3D8B8B",
} as const;

type BezierTuple = [number, number, number, number];
const EASE: BezierTuple = [0.22, 1, 0.36, 1];

/** Framer Motion presets */
export const MOTION = {
  slide: (dir: number) => ({
    initial:   { opacity: 0, x: dir > 0 ? 28 : -28 },
    animate:   { opacity: 1, x: 0 },
    exit:      { opacity: 0, x: dir > 0 ? -18 : 18, scale: 0.99 },
    transition:{ duration: 0.42, ease: EASE },
  }),
  fadeUp: (delay = 0) => ({
    initial:   { opacity: 0, y: 14 },
    animate:   { opacity: 1, y: 0 },
    transition:{ delay, duration: 0.55, ease: EASE },
  }),
  scale: (delay = 0) => ({
    initial:   { opacity: 0, scale: 0.95 },
    animate:   { opacity: 1, scale: 1 },
    transition:{ delay, duration: 0.5, ease: EASE },
  }),
};

/** Chart color sequences */
export const CHART_COLORS = [P.gold, P.teal, P.sage, P.coral, P.stone];

export type Palette = typeof P;
