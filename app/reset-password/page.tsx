"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setState("loading");
    const sb = getSupabaseBrowserClient();

    const { error: sbError } = await sb.auth.updateUser({ password });

    if (sbError) {
      setState("error");
      setError(sbError.message);
    } else {
      setState("success");
      // Optional: auto-logout or redirect after a delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <BrandLogo className="w-64 mx-auto mb-3" />
          <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
            Create New Password
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {state === "success" ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto text-brand-teal text-2xl">
                ✅
              </div>
              <h2 className="text-slate-900 font-bold text-xl">Password Updated</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your password has been changed successfully. You will be redirected to the sign in page shortly.
              </p>
              <div className="pt-4">
                <Link 
                  href="/login"
                  className="text-sm font-bold text-slate-900 hover:text-black transition-colors"
                >
                  Go to sign in now →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-slate-900 font-bold text-xl mb-2">Set new password</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Please enter a new secure password for your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none
                        focus:bg-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/5 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                          <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.028 10.028 0 002.806-3.63 1.651 1.651 0 000-1.185A10.004 10.004 0 0010 3a9.997 9.997 0 00-4.512 1.074l-2.208-2.208zM13.035 12.035l-1.12-1.12a2.5 2.5 0 01-3.415-3.415l-1.253-1.253A4 4 0 0013.035 12.035z" clipRule="evenodd" />
                          <path d="M4.032 6.018l1.562 1.562A4.013 4.013 0 004.827 10a4.001 4.001 0 006.125 3.307l1.497 1.497A10.031 10.031 0 0110 17C5.743 17 2.107 14.34 0.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 014.032 6.018z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {state === "loading" ? "Updating..." : "Update Password →"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-slate-300 text-[10px] uppercase tracking-[0.2em] font-bold mt-10">
          Powered by Avel Africa
        </p>
      </div>
    </div>
  );
}
