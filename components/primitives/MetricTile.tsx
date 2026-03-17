"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricTileProps {
  label: string;
  value: string | number;
  sub: string;
  trend?: string;
  priority?: boolean;
  className?: string;
}

export function MetricTile({
  label,
  value,
  sub,
  trend,
  priority,
  className
}: MetricTileProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative bg-surface border border-border-subtle rounded-3xl p-7 transition-all duration-500 hover:bg-surface-elevated hover:border-border-medium hover:shadow-premium overflow-hidden",
        priority && "ring-1 ring-accent-primary/20 bg-accent-primary/[0.02]",
        className
      )}
    >
      {priority && (
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent-primary/5 blur-[40px] rounded-full" />
      )}

      <div className="flex justify-between items-start mb-5 relative z-10">
        <p className="text-xs font-medium text-secondary group-hover:text-primary transition-colors">
          {label}
        </p>
        {trend && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              trend.startsWith('↑')
                ? "bg-accent-success/10 text-accent-success border border-accent-success/20"
                : "bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20"
            )}
          >
            {trend}
          </motion.span>
        )}
      </div>

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tighter text-contrast mb-1.5"
        >
          {value}
        </motion.p>
        <p className="text-xs text-muted leading-relaxed">
          {sub}
        </p>
      </div>

      {priority && (
        <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
      )}
    </motion.div>
  );
}
