"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  title: string;
  subtitle?: string;
  date?: string | Date;
  owner?: string;
  status?: "default" | "active" | "danger" | "success" | "warning";
  className?: string;
}

export function TimelineItem({ 
  title, 
  subtitle, 
  date, 
  owner,
  status = "default",
  className 
}: TimelineItemProps) {
  const statusColors = {
    default: "border-border-subtle",
    active: "border-accent-primary shadow-[0_0_15px_rgba(20,184,166,0.3)]",
    danger: "border-accent-secondary shadow-[0_0_15px_rgba(219,39,119,0.4)]",
    success: "border-accent-success shadow-[0_0_15px_rgba(34,197,94,0.3)]",
    warning: "border-accent-warning shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  };

  const dotColors = {
    default: "bg-muted",
    active: "bg-accent-primary",
    danger: "bg-accent-secondary",
    success: "bg-accent-success",
    warning: "bg-accent-warning",
  };

  const formattedDate = date instanceof Date 
    ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : date;

  return (
    <motion.div 
      whileHover={{ x: 8 }}
      className={cn("relative group transition-all", className)}
    >
      {/* Connector Dot */}
      <div className={cn(
        "absolute -left-[45px] top-1.5 w-4 h-4 rounded-full bg-background-primary border-[3px] group-hover:scale-125 transition-all duration-300",
        statusColors[status]
      )} />
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className={cn(
            "text-base font-bold text-contrast transition-colors leading-tight",
            status === "danger" ? "group-hover:text-accent-secondary" : "group-hover:text-accent-primary"
          )}>
            {title}
          </h4>
          <div className="flex items-center gap-3">
            {subtitle && (
              <span className="text-xs text-muted">{subtitle}</span>
            )}
            {subtitle && owner && <span className="w-1 h-1 rounded-full bg-border-medium" />}
            {owner && (
              <span className="text-xs text-accent-primary font-medium">{owner}</span>
            )}
          </div>
        </div>
        {formattedDate && (
          <div className="text-right">
            <p className={cn(
              "text-sm font-semibold tracking-tight leading-none",
              status === "danger" ? "text-accent-secondary" : "text-contrast"
            )}>
              {formattedDate}
            </p>
            <p className="text-xs text-muted mt-1">Due</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
