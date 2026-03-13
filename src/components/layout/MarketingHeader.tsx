"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function MarketingHeader() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Platform", href: "/#platform" },
    { name: "Solutions", href: "/#solutions" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-black tracking-tighter shadow-lg shadow-slate-900/20 dark:shadow-white/20 group-hover:scale-105 transition-transform">
              L
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">Legal OS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  pathname === link.href 
                    ? "text-slate-900 dark:text-white" 
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/20"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="md:hidden p-2 text-slate-600 dark:text-zinc-300">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
