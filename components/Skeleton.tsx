"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
}

export function Skeleton({ className = "", variant = "rect" }: SkeletonProps) {
  return (
    <div 
      className={`
        relative overflow-hidden bg-white/5 
        ${variant === "circle" ? "rounded-full" : variant === "text" ? "rounded-md h-4" : "rounded-2xl"}
        ${className}
      `}
    >
      <motion.div
        animate={{
          x: ["-100%", "100%"]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header Skeleton */}
      <div className="bg-surface border border-border-subtle rounded-[32px] p-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4 flex-1">
            <Skeleton className="w-24 h-6 text-xs uppercase" />
            <Skeleton className="w-3/4 h-12" />
            <div className="flex gap-4">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
          <div className="flex gap-6 items-center">
            <Skeleton variant="circle" className="w-20 h-20" />
            <Skeleton className="w-40 h-14 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="bg-surface border border-border-subtle rounded-3xl p-8 h-48 space-y-6">
             <Skeleton className="w-1/2 h-4" />
             <Skeleton className="w-1/3 h-10" />
             <Skeleton className="w-full h-2" />
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="bg-surface border border-border-subtle rounded-[32px] p-8 h-48 space-y-4">
            <div className="flex gap-4 items-center">
              <Skeleton variant="circle" className="w-8 h-8" />
              <Skeleton className="w-40 h-6" />
            </div>
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-4/5 h-4" />
          </div>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border-subtle rounded-3xl p-8 h-32 space-y-4">
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-2/3 h-8" />
          </div>
        ))}
      </div>

      {/* Workstreams Section */}
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-32 h-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border-subtle rounded-[32px] p-8 h-64 space-y-6">
               <Skeleton className="w-1/2 h-6" />
               <Skeleton className="w-full h-2" />
               <div className="flex justify-between items-end">
                 <Skeleton className="w-24 h-10" />
                 <div className="flex -space-x-2">
                   <Skeleton variant="circle" className="w-6 h-6" />
                   <Skeleton variant="circle" className="w-6 h-6" />
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
