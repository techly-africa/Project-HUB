"use client";

export default function BrandLogo({ className = "w-32", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`${className} select-none`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/new_logo.png"
        alt="Rukisha"
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      {showText && (
        <span className="block text-center text-2xl font-black text-slate-900 mt-2 tracking-tight">
          Rukisha
        </span>
      )}
    </div>
  );
}
