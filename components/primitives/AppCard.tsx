"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AppCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "subtle" | "danger";
  glow?: boolean;
}

export function AppCard({ 
  children, 
  className, 
  variant = "default", 
  glow = false,
  ...props 
}: AppCardProps) {
  const variants = {
    default: "bg-surface border-border-subtle",
    elevated: "bg-surface-elevated border-border-medium shadow-premium",
    subtle: "bg-white/[0.02] border-white/5",
    danger: "bg-accent-secondary/[0.03] border-accent-secondary/20 shadow-[inset_0_0_30px_rgba(219,39,119,0.05)]",
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className={cn(
        "relative overflow-hidden rounded-[32px] border p-8 transition-colors duration-500",
        variants[variant],
        className
      )}
      {...props}
    >
      {glow && (
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent-primary/5 blur-[100px] rounded-full pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
}
