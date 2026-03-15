import { ReactNode } from "react";
import Link from "next/link";
import { LogOut, GlobeLock } from "lucide-react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 font-sans">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GlobeLock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-black text-lg tracking-tighter text-slate-900 dark:text-white">Client Portal</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400 px-3 py-1.5 rounded-full">Secure Connection</div>
            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] mx-auto w-full p-6">
        {children}
      </main>
    </div>
  );
}
