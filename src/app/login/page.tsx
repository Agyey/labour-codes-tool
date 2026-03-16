"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithGoogle() {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  async function bypassLogin() {
    setIsLoading(true);
    await signIn("credentials", {
      email: "admin@dev.local",
      callbackUrl: "/dashboard",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center shadow-lg mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            India Labour Code Reform Platform
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed items-center gap-3"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Sign in with Google
          </button>

          {process.env.NODE_ENV !== "production" && (
            <button
              onClick={bypassLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-emerald-500 text-sm font-semibold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all shadow-sm items-center gap-3"
            >
              🚀 Local Developer Bypass
            </button>
          )}
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 text-xs">
                Private enterprise access only
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
