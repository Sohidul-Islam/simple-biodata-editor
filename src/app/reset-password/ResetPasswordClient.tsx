'use client';

import { useActionState, useEffect } from 'react';
import { resetPassword } from '@/app/auth-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResetPasswordClient({ token }: { token: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-outfit antialiased">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-rose-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-amber-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl relative z-10 transition duration-300 hover:border-slate-700/80">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-600 rounded-2xl text-white shadow-xl shadow-rose-900/30 mb-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zM12 2v4M2 12h4M12 12l9-9M18 10l-4-4"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            Choose New Password
          </h1>
          <p className="text-sm text-slate-400">
            Set your secure new password credentials below
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
              <p className="font-semibold text-emerald-200">Password Reset Successful</p>
              <p className="text-xs text-slate-300">
                Your password has been successfully updated. Redirecting to the sign-in page in a few moments...
              </p>
            </div>
            
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-2xl text-xs transition"
              >
                Sign In Immediately
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

            {/* Hidden field for token */}
            <input type="hidden" name="token" value={token} />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase px-1">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 rounded-2xl text-sm outline-none transition text-slate-100 placeholder:text-slate-600"
                  placeholder="At least 6 characters"
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
                  <span>Resetting Password...</span>
                </>
              ) : (
                <span>Confirm New Password</span>
              )}
            </button>
          </form>
        )}

        <div className="border-t border-slate-800 pt-6 text-center">
          <Link
            href="/login"
            className="text-xs font-bold text-rose-400 hover:text-rose-300 transition"
          >
            Cancel and Return to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
