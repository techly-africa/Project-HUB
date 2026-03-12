"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Suspense } from "react";
import BrandLogo from "@/components/BrandLogo";

const ALLOWED_DOMAIN = "rukisha.co.rw";

function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const urlError = params.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError(`Access is restricted to @${ALLOWED_DOMAIN} email addresses.`);
      return;
    }

    setState("loading");
    const sb = getSupabaseBrowserClient();

    const { error: sbError } = await sb.auth.signInWithPassword({
      email,
      password,
    });

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
        {/* Logo block */}
        <div className="text-center mb-8">
          <BrandLogo className="w-48 mx-auto mb-2" showText={false} />
          <p className="text-slate-400 text-sm mt-0 uppercase tracking-widest font-bold">Implementation Tracker</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-slate-900 font-bold text-xl mb-1">
            Sign in
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Use your <span className="font-semibold text-brand-pink">@rukisha.co.rw</span> work email.
          </p>

          {/* URL error (e.g. unauthorized domain) */}
          {urlError === "unauthorised" && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-red-700 text-sm leading-relaxed">
                Access denied. Only <strong>@rukisha.co.rw</strong> accounts may sign in.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                Work email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`name@${ALLOWED_DOMAIN}`}
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
