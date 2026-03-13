"use client";

import { useUI } from "@/context/UIContext";
import { useLegalOS } from "@/context/LegalOSContext";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { CommandPalette } from "../shared/CommandPalette";
import { Scale, User, LogOut, Pencil, Eye, Menu } from "lucide-react";
import { ThemeToggle } from "../shared/ThemeToggle";

export function AppHeader() {
  const { mode, setMode, sidebarOpen, setSidebarOpen } = useUI();
  const { activeProduct } = useLegalOS();
  const { data: session } = useSession();

  const productTitles: Record<typeof activeProduct, { title: string, subtitle: string }> = {
    MAPPING: { title: "Legal Frameworks", subtitle: "Universal Provision Mapping" },
    COMPLIANCE: { title: "Compliance Tracker", subtitle: "Entity-Level Applicability" },
    AGREEMENTS: { title: "Template Vault", subtitle: "Modular Agreement Generation" },
    DILIGENCE: { title: "Due Diligence", subtitle: "Master Hygiene Checklists" },
    WORKFLOW_DASH: { title: "Workflow Execution", subtitle: "Firm Operations Overview" },
    WORKSPACE: { title: "Active Deal Room", subtitle: "VC/PE Workflow Execution" },
  };

  const currentProduct = productTitles[activeProduct];

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-zinc-800/50 shadow-sm transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center shadow-lg shadow-slate-900/10 dark:shadow-zinc-950/50">
              <Scale className="w-5 h-5 text-white dark:text-zinc-900" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
                {currentProduct.title}
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                {currentProduct.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search */}
            <CommandPalette />

            <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

            {/* Theme Toggle */}
            <ThemeToggle />

            <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

            {/* Mode toggle - Only visible to Admins/Editors */}
            {(session?.user?.role === "admin" || session?.user?.role === "editor") && (
              <button
                onClick={() => setMode(mode === "read" ? "admin" : "read")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer select-none active:scale-95 ${
                  mode === "admin"
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 shadow-sm shadow-indigo-100"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm"
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
            )}

            {/* User Session Info */}
            {session?.user ? (
              <div className="flex items-center gap-3 ml-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{session.user.name || session.user.email}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                    {session.user.role || "Viewer"}
                  </p>
                </div>
                <div className="relative">
                  {session.user.image ? (
                    <Image 
                      src={session.user.image} 
                      alt="Avatar" 
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm object-cover" 
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-4 py-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-colors shadow-md"
              >
                Sign In
              </button>
            )}

            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-sm"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
