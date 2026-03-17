"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Suspense } from "react";
import BrandLogo from "@/components/BrandLogo";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("loading");
    const sb = getSupabaseBrowserClient();

    const { data: { user }, error: sbError } = await sb.auth.signInWithPassword({ email, password });

    if (sbError) {
      setState("error");
      setError(sbError.message);
    } else if (user) {
      const { data: profile } = await sb
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single();
      
      if (profile?.is_superadmin) {
        router.push("/superadmin");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-teal/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-pink/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-10">
          <BrandLogo className="w-64 mx-auto mb-4" variant="light" />
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">
            Enterprise Asset Intelligence
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand-teal/20 to-transparent" />
          
          <div className="mb-8">
            <h2 className="text-white font-black text-2xl tracking-tight">Sign In</h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">Access your organizational workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Security Identifier
              </label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-brand-teal transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full pl-12 pr-4 py-4 text-sm bg-white/5 border border-white/5 rounded-2xl outline-none
                    text-white placeholder:text-slate-700 focus:bg-white/10 focus:border-brand-teal/40 focus:ring-4 focus:ring-brand-teal/5 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Access Key
                </label>
                <a 
                  href="/forgot-password" 
                  className="text-[10px] font-black uppercase tracking-widest text-brand-teal hover:text-brand-teal/80 transition-colors"
                >
                  Recovery
                </a>
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-brand-teal transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 text-sm bg-white/5 border border-white/5 rounded-2xl outline-none
                    text-white placeholder:text-slate-700 focus:bg-white/10 focus:border-brand-teal/40 focus:ring-4 focus:ring-brand-teal/5 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3"
              >
                Verification Failed: {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={state === "loading"}
              className="w-full bg-brand-teal text-slate-950 text-xs font-black uppercase tracking-[0.2em]
                py-4 rounded-2xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:bg-brand-teal/90 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {state === "loading" ? "Validating..." : (
                <>
                  Establish Connection <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-slate-600 text-[9px] uppercase tracking-[0.4em] font-black">
            System Operational · v0.1.0-stable
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-white/5" />
            <a href="https://www.avel.africa" target="_blank" className="text-slate-700 hover:text-brand-teal text-[9px] font-black uppercase tracking-widest transition-colors">
              Avel Africa
            </a>
            <div className="h-px w-8 bg-white/5" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
