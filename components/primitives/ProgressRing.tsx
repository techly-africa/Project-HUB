"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  pct: number;
  size?: number;
  stroke?: number;
  className?: string;
}

export function ProgressRing({ 
  pct, 
  size = 64, 
  stroke = 6,
  className 
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-border-medium"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          className="text-accent-primary shadow-[0_0_10px_rgba(20,184,166,0.3)]"
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-contrast">{Math.round(pct)}%</span>
    </div>
  );
}
