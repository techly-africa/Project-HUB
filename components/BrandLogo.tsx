"use client";

/* 
  Using a standard img tag instead of next/image because 
  Next.js image optimization was failing with "received null" errors
  for /logo.png in this specific environment.
*/

export default function BrandLogo({ className = "w-32", showText = true }: { className?: string; showText?: boolean }) {
    return (
        <div className={`flex flex-col items-center select-none ${className}`}>
            <div className="relative w-full aspect-[2/1] flex items-center justify-center">
                <img
                    src="/new_logo.png"
                    alt="Project Hub Logo"
                    className="max-w-full max-h-full object-contain"
                />
            </div>
            {showText && (
                <span className="text-3xl font-black text-black mt-2 tracking-tight">
                    Project Hub
                </span>
            )}
        </div>
    );
}
