"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  pct: number;
  className?: string;
  variant?: "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  shimmer?: boolean;
}

export function ProgressBar({ 
  pct, 
  className, 
  variant = "primary",
  size = "sm",
  shimmer = true
}: ProgressBarProps) {
  const variants = {
    primary: "bg-accent-primary shadow-[0_0_12px_rgba(20,184,166,0.3)]",
    success: "bg-accent-success shadow-[0_0_12px_rgba(34,197,94,0.3)]",
    warning: "bg-accent-warning shadow-[0_0_12px_rgba(245,158,11,0.3)]",
    danger: "bg-accent-secondary shadow-[0_0_12px_rgba(219,39,119,0.3)]",
  };

  const heights = {
    sm: "h-1.5",
    md: "h-3",
    lg: "h-5",
  };

  return (
    <div className={cn("relative w-full bg-white/5 rounded-full overflow-hidden", heights[size], className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-500", variants[variant])}
      />
      {shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full -translate-x-full animate-shimmer" />
      )}
    </div>
  );
}
