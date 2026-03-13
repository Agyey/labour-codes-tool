"use client";

import { useUI } from "@/context/UIContext";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { CommandPalette } from "../shared/CommandPalette";
import { Scale, User, LogOut, Pencil, Eye, Menu } from "lucide-react";

export function AppHeader() {
  const { mode, setMode, sidebarOpen, setSidebarOpen } = useUI();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                India Labour Code Reform
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                Legal Intelligence Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search */}
            <CommandPalette />

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* User Session Info */}
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{session.user.name || session.user.email}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                    {session.user.role || "Viewer"}
                  </p>
                </div>
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt="Avatar" 
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full ring-2 ring-slate-100 shadow-sm" 
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-slate-200">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
              >
                Sign In
              </button>
            )}

            {/* Mode toggle - Only visible to Admins/Editors */}
            {session?.user?.role === "admin" || session?.user?.role === "editor" ? (
              <button
                onClick={() => setMode(mode === "read" ? "admin" : "read")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  mode === "admin"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-100"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {mode === "admin" ? (
                  <>
                    <Pencil className="w-3.5 h-3.5" /> EDITOR
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" /> READER
                  </>
                )}
              </button>
            ) : null}

            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-sm"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
