"use client";

import { useUI } from "@/context/UIContext";
import { AppHeader } from "./AppHeader";
import { AppNavigation } from "./AppNavigation";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUI();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <AppHeader />
      <AppNavigation />

      {/* Main content area with optional sidebar */}
      <div className="max-w-[1400px] mx-auto flex">
        {sidebarOpen && <AppSidebar />}

        {/* Main content */}
        <main className="flex-1 p-4 overflow-auto min-h-[calc(100vh-120px)]">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 py-3 text-center text-[10px] text-gray-400">
          Auto-saves · States may amend Central provisions — verify state rules
          · Not legal advice · Data as of March 2026
        </div>
      </footer>
    </div>
  );
}

