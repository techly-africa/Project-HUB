import BrandLogo from "@/components/BrandLogo";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-brand-teal animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="/new_logo.png"
                        alt=""
                        className="w-10 h-10 object-contain animate-pulse"
                    />
                </div>
            </div>
            <p className="mt-6 text-slate-500 font-medium animate-pulse tracking-wide uppercase text-xs">
                Loading project data...
            </p>
        </div>
    );
}
