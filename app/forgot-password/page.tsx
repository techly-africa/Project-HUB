"use client";

import { useState } from "react";
import { forgotPasswordAction } from "@/app/actions/auth";
import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("loading");
    
    try {
      const result = await forgotPasswordAction(email);
      if (result?.success) {
        setState("success");
      } else {
        setState("error");
        setError("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      setState("error");
      setError(err.message || "Failed to send reset link");
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <BrandLogo className="w-64 mx-auto mb-3" />
          <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
            Account Recovery
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {state === "success" ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto text-brand-teal text-2xl">
                ✉️
              </div>
              <h2 className="text-slate-900 font-bold text-xl">Check your email</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                If an account exists for <span className="font-bold text-slate-700">{email}</span>, you will receive a password reset link shortly via SendGrid.
              </p>
              <div className="pt-4">
                <Link 
                  href="/login"
                  className="text-sm font-bold text-slate-900 hover:text-black transition-colors"
                >
                  ← Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-slate-900 font-bold text-xl mb-2">Forgot password?</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
              </p>

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
                  {state === "loading" ? "Sending link..." : "Send Reset Link →"}
                </button>

                <div className="text-center pt-2">
                  <Link 
                    href="/login"
                    className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Back to sign in
                  </Link>
                </div>
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
