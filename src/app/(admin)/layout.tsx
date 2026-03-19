import { ReactNode } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200 font-sans">
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 shadow-xl">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-rose-500" />
            <span className="font-black text-sm tracking-widest text-white uppercase">Super Admin</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/admin/overview" className="hover:text-white transition-colors">Overview</Link>
            <Link href="/admin/tenants" className="hover:text-white transition-colors">Tenants</Link>
            <Link href="/admin/knowledge-base" className="hover:text-white transition-colors">Knowledge Base</Link>
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">Exit to App</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
