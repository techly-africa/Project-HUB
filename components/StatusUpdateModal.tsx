"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, X, Maximize2, Minimize2,
  Printer, MonitorPlay, MonitorOff, Timer, SkipBack,
} from "lucide-react";
import type { Plan, Project, ProjectStats } from "@/lib/types";
import { buildSlides } from "./presentation/buildSlides";
import { usePresenterTimer } from "./presentation/hooks";
import { P } from "./presentation/tokens";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PlanSummary { plan: Plan; stats: ProjectStats }
interface Props { project: Project; plans: PlanSummary[]; onClose: () => void }

// ── Directional slide variants ─────────────────────────────────────────────
type BezierTuple = [number, number, number, number];
const EASE_IN:  BezierTuple = [0.22, 1, 0.36, 1];
const EASE_OUT: BezierTuple = [0.55, 0, 1, 0.45];

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "55%" : "-55%",
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.42, ease: EASE_IN },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-55%" : "55%",
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.3, ease: EASE_OUT },
  }),
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function StatusUpdateModal({ project, plans, onClose }: Props) {
  const slides      = buildSlides(project, plans);
  const total       = slides.length;

  const [idx, setIdx]               = useState(0);
  const [dir, setDir]               = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [presenter, setPresenter]   = useState(false);
  const containerRef                = useRef<HTMLDivElement>(null);
  const timer                       = usePresenterTimer();

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(total - 1, next));
    setDir(clamped > idx ? 1 : -1);
    setIdx(clamped);
  }, [idx, total]);

  const exitFs = () => { if (document.fullscreenElement) document.exitFullscreen(); };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      exitFs();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowRight": case "ArrowDown": case " ": e.preventDefault(); go(idx + 1); break;
        case "ArrowLeft":  case "ArrowUp":             e.preventDefault(); go(idx - 1); break;
        case "f": case "F": toggleFullscreen(); break;
        case "p": case "P": setPresenter(v => !v); break;
        case "Escape":
          if (fullscreen) exitFs();
          else if (presenter) setPresenter(false);
          else onClose();
          break;
        case "Home": go(0); break;
        case "End":  go(total - 1); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, fullscreen, presenter, go, onClose, total, toggleFullscreen]);

  // Fullscreen listeners
  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Print all slides
  const handlePrint = useCallback(() => {
    const printArea = document.getElementById("pres-print-area");
    if (!printArea) return;
    printArea.style.display = "block";
    window.print();
    printArea.style.display = "none";
  }, []);

  const slide = slides[idx];

  return (
    <>
      {/* ── Backdrop ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* ── Centering wrapper (positioning only, no animation transforms) ── */}
      <div
        style={{
          position: "fixed", zIndex: 9999,
          inset: fullscreen ? 0 : undefined,
          top: fullscreen ? undefined : "50%",
          left: fullscreen ? undefined : "50%",
          transform: fullscreen ? undefined : "translate(-50%, -50%)",
          width: fullscreen ? "100vw" : "min(94vw, 1280px)",
          height: fullscreen ? "100vh" : "92vh",
        }}
      >
      {/* ── Modal shell (animation only, no positional transforms) ── */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          height: "100%",
          background: P.navy,
          borderRadius: fullscreen ? 0 : 20,
          border: fullscreen ? "none" : `1px solid ${P.border}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Top chrome ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.75rem 1.25rem",
          borderBottom: `1px solid ${P.border}`,
          background: `${P.slate}cc`,
          backdropFilter: "blur(12px)",
          flexShrink: 0,
          gap: 12,
        }}>
          {/* Left: project name + slide counter */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: P.gold, boxShadow: `0 0 8px ${P.gold}`,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: 12, fontWeight: 700, color: P.ivory,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {project.name}
            </span>
            <span style={{ fontSize: 11, color: P.muted, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
              {idx + 1} / {total}
            </span>
          </div>

          {/* Center: slide title */}
          <span style={{
            fontSize: 12, fontWeight: 600, color: P.muted,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            flex: 1, textAlign: "center",
          }}>
            {slide.title}
          </span>

          {/* Right: actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {presenter && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: P.gold,
                fontVariantNumeric: "tabular-nums",
                background: `${P.gold}18`, borderRadius: 6,
                padding: "3px 8px", border: `1px solid ${P.gold}33`,
              }}>
                <Timer size={10} style={{ display: "inline", marginRight: 4 }} />
                {timer.display}
              </span>
            )}
            <IconBtn title="Presenter mode (P)" onClick={() => { setPresenter(v => !v); if (!presenter) timer.start(); }} active={presenter}>
              {presenter ? <MonitorOff size={14} /> : <MonitorPlay size={14} />}
            </IconBtn>
            <IconBtn title="Print / Export" onClick={handlePrint}>
              <Printer size={14} />
            </IconBtn>
            <IconBtn title={fullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </IconBtn>
            <div style={{ width: 1, height: 18, background: P.border }} />
            <IconBtn title="Close (Esc)" onClick={onClose}>
              <X size={14} />
            </IconBtn>
          </div>
        </div>

        {/* ── Content area ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

          {/* Slide viewport */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden", padding: "2rem 2.5rem" }}>
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={idx}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ height: "100%", willChange: "transform" }}
              >
                {slide.content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Presenter notes panel */}
          <AnimatePresence>
            {presenter && (
              <motion.aside
                key="notes"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  flexShrink: 0,
                  overflow: "hidden",
                  borderLeft: `1px solid ${P.border}`,
                  background: P.slate,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ padding: "1.1rem", flex: 1, overflow: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, color: P.gold, textTransform: "uppercase", letterSpacing: "0.3em" }}>
                      Presenter Notes
                    </span>
                    <button
                      onClick={timer.running ? timer.pause : timer.start}
                      style={{
                        background: "none", border: `1px solid ${P.border}`,
                        borderRadius: 6, padding: "2px 8px",
                        fontSize: 10, fontWeight: 700, color: P.muted, cursor: "pointer",
                      }}
                    >
                      {timer.running ? "Pause" : "Resume"}
                    </button>
                  </div>

                  {/* Timer */}
                  <div style={{
                    background: `${P.gold}0d`, border: `1px solid ${P.gold}22`,
                    borderRadius: 10, padding: "0.65rem 0.85rem", marginBottom: 14,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <Timer size={12} color={P.gold} />
                    <span style={{ fontSize: 20, fontWeight: 900, color: P.gold, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                      {timer.display}
                    </span>
                    <button
                      onClick={timer.reset}
                      title="Reset timer"
                      style={{
                        marginLeft: "auto", background: "none", border: "none",
                        color: P.muted, cursor: "pointer", padding: 2,
                      }}
                    >
                      <SkipBack size={11} />
                    </button>
                  </div>

                  {/* Notes text */}
                  <p style={{
                    fontSize: 12, lineHeight: 1.7, color: P.ivory,
                    opacity: 0.85,
                  }}>
                    {slide.notes}
                  </p>

                  {/* Slide outline */}
                  <div style={{ marginTop: 20, borderTop: `1px solid ${P.border}`, paddingTop: 16 }}>
                    <p style={{ fontSize: 9, fontWeight: 900, color: P.muted, textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: 10 }}>
                      Slides
                    </p>
                    {slides.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => go(i)}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          background: i === idx ? `${P.gold}18` : "none",
                          border: i === idx ? `1px solid ${P.gold}33` : "1px solid transparent",
                          borderRadius: 7, padding: "5px 9px", marginBottom: 3,
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 700, color: i === idx ? P.gold : P.muted, marginRight: 6, fontVariantNumeric: "tabular-nums" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: i === idx ? P.ivory : P.muted }}>
                          {s.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom chrome: nav + dot indicators ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0.7rem 1.25rem", gap: 16,
          borderTop: `1px solid ${P.border}`,
          background: `${P.slate}cc`,
          backdropFilter: "blur(12px)",
          flexShrink: 0,
        }}>
          <NavBtn onClick={() => go(idx - 1)} disabled={idx === 0} label="Previous">
            <ChevronLeft size={16} />
          </NavBtn>

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                title={slides[i].title}
                style={{
                  width: i === idx ? 20 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === idx ? P.gold : P.border,
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>

          <NavBtn onClick={() => go(idx + 1)} disabled={idx === total - 1} label="Next">
            <ChevronRight size={16} />
          </NavBtn>
        </div>
      </motion.div>
      </div>

      {/* ── Hidden print area ── */}
      <div id="pres-print-area" style={{ display: "none" }}>
        <style>{`
          @media print {
            body > * { display: none !important; }
            #pres-print-area { display: block !important; }
            #pres-print-area .print-slide {
              width: 100vw; height: 100vh; page-break-after: always;
              background: ${P.navy}; overflow: hidden;
              padding: 2.5rem 3rem; box-sizing: border-box;
            }
          }
        `}</style>
        {slides.map((s, i) => (
          <div key={i} className="print-slide">
            {s.content}
          </div>
        ))}
      </div>
    </>
  );
}

// ── Small helper components ─────────────────────────────────────────────────
function IconBtn({
  children, onClick, title, active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? `${P.gold}18` : "none",
        border: `1px solid ${active ? P.gold + "44" : P.border}`,
        borderRadius: 8,
        padding: "5px 7px",
        cursor: "pointer",
        color: active ? P.gold : P.muted,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

function NavBtn({
  children, onClick, disabled, label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        background: disabled ? "none" : `${P.slate}`,
        border: `1px solid ${disabled ? "transparent" : P.border}`,
        borderRadius: 10,
        padding: "6px 14px",
        cursor: disabled ? "default" : "pointer",
        color: disabled ? P.border : P.ivory,
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 12, fontWeight: 600,
        opacity: disabled ? 0.3 : 1,
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}
