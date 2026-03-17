"use client";

import { useEffect } from "react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Error</p>
        <h2 className="text-xl font-black text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-400 mb-6">
          {error.digest ? `Reference: ${error.digest}` : "An unexpected error occurred while loading this page."}
        </p>
        <button
          onClick={reset}
          className="bg-brand-teal text-white px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
