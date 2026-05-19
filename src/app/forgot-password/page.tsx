'use client';

import { useActionState } from 'react';
import { forgotPassword } from '@/app/auth-actions';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-outfit antialiased">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-rose-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl relative z-10 transition duration-300 hover:border-slate-700/80">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-600 rounded-2xl text-white shadow-xl shadow-rose-900/30 mb-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-sm text-slate-400">
            Enter your email and we'll print a reset link to the server console
          </p>
        </div>

        {state?.success ? (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 p-5 rounded-2xl text-sm leading-relaxed space-y-2">
              <div className="flex justify-center text-emerald-400 mb-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <p className="font-semibold text-emerald-200">Request Processed Successfully</p>
              <p className="text-xs text-slate-300">
                Please check the terminal console logs of your application to retrieve the generated password reset link.
              </p>
            </div>
            
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-2xl text-xs transition"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="bg-rose-950/50 border border-rose-800/80 text-rose-300 p-4 rounded-2xl text-xs flex items-center gap-2.5">
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase px-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 rounded-2xl text-sm outline-none transition text-slate-100 placeholder:text-slate-600"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-xl shadow-rose-900/20 active:scale-[0.98] transition cursor-pointer flex justify-center items-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Generate Reset Link</span>
              )}
            </button>
          </form>
        )}

        {!state?.success && (
          <div className="border-t border-slate-800 pt-6 text-center">
            <Link
              href="/login"
              className="text-xs font-bold text-rose-400 hover:text-rose-300 transition"
            >
              Return to Sign In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
