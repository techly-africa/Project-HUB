"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Suspense } from "react";
import BrandLogo from "@/components/BrandLogo";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("loading");
    const sb = getSupabaseBrowserClient();

    const { error: sbError } = await sb.auth.signInWithPassword({ email, password });

    if (sbError) {
      setState("error");
      setError(sbError.message);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <BrandLogo className="w-28 mx-auto mb-3" showText={false} />
          <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Implementation Tracker</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-slate-900 font-bold text-xl mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none
                  focus:bg-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/5 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none
                  focus:bg-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/5 transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={state === "loading"}
              className="w-full bg-slate-900 hover:bg-black text-white text-sm font-bold
                py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-black/5 active:scale-[0.98]"
            >
              {state === "loading" ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-300 text-[10px] uppercase tracking-[0.2em] font-bold mt-10">
          Project Hub
        </p>
      </div>
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
