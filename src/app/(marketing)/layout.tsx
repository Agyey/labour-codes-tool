import { ReactNode } from "react";
import { MarketingHeader } from "@/components/layout/MarketingHeader";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <MarketingHeader />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="font-black text-slate-900 dark:text-white text-lg tracking-tighter mb-4">Legal OS</div>
            <p>The enterprise compliance platform for Tier-1 firms and General Counsels.</p>
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white mb-4">Product</div>
            <ul className="space-y-2">
              <li>Knowledge Graph</li>
              <li>Scenario Engine</li>
              <li>Deal Rooms</li>
              <li>Client Portal</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white mb-4">Company</div>
            <ul className="space-y-2">
              <li>About</li>
              <li>Customers</li>
              <li>Security</li>
              <li>Pricing</li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white mb-4">Legal</div>
            <ul className="space-y-2">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800 text-xs text-center">
          &copy; {new Date().getFullYear()} Legal OS Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
