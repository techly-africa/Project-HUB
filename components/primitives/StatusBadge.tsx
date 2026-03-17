"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ 
  label, 
  variant = "neutral", 
  className,
  dot = false 
}: StatusBadgeProps) {
  const variants = {
    primary: "bg-accent-primary/10 border-accent-primary/20 text-accent-primary",
    success: "bg-accent-success/10 border-accent-success/20 text-accent-success",
    warning: "bg-accent-warning/10 border-accent-warning/20 text-accent-warning",
    danger: "bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    neutral: "bg-white/5 border-white/10 text-muted",
  };

  const dots = {
    primary: "bg-accent-primary",
    success: "bg-accent-success",
    warning: "bg-accent-warning",
    danger: "bg-accent-secondary",
    info: "bg-blue-400",
    neutral: "bg-muted",
  };

  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dots[variant], variant !== 'neutral' && "animate-pulse")} />
      )}
      {label}
    </motion.span>
  );
}
