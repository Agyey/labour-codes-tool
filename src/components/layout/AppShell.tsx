"use client";

import { useApp } from "@/context/AppContext";
import { CODES } from "@/config/codes";
import type { CodeKey } from "@/types/code";
import { CommandPalette } from "../shared/CommandPalette";
import {
  LayoutDashboard,
  Map,
  Globe,
  Clock,
  AlertTriangle,
  GitCompare,
  Menu,
  Pencil,
  Eye,
  Lock,
  ChevronRight,
  Pin,
  Scale,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const VIEWS = [
  { id: "mapping", label: "Mapping", icon: Map },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "stateTracker", label: "States", icon: Globe },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "penalties", label: "Penalties", icon: AlertTriangle },
  { id: "compare", label: "Compare", icon: GitCompare },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    mode,
    setMode,
    passwordVerified,
    setPasswordVerified,
    editorPassword,
    activeView,
    setActiveView,
    activeCode,
    setActiveCode,
    sidebarOpen,
    setSidebarOpen,
    setExpandedProvision,
    setFilter,
    provisions,
    canEdit,
  } = useApp();

  const { data: session } = useSession();

  const cObj = CODES[activeCode];

  // Chapters for current code
  const chapterMap: Record<string, string> = {};
  provisions
    .filter((x) => x.code === activeCode)
    .forEach((p) => {
      if (!chapterMap[p.ch]) chapterMap[p.ch] = p.chName;
    });
  const chapters = Object.entries(chapterMap);

  const pinnedProvisions = provisions.filter(
    (x) => x.code === activeCode && x.pinned
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
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
                      {(session.user as any).role || "Viewer"}
                    </p>
                  </div>
                  {session.user.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-9 h-9 rounded-full ring-2 ring-slate-100 shadow-sm" />
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
              {(session?.user as any)?.role === "admin" || (session?.user as any)?.role === "editor" ? (
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
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-sm"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-[73px] z-40 bg-white/60 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center overflow-x-auto px-4">
          {/* View tabs */}
          <div className="flex items-center gap-1 py-1.5">
            {VIEWS.map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id as typeof activeView)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeView === v.id
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {v.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1" />

          {/* Code tabs */}
          <div className="flex items-center gap-2 py-1.5">
            {(Object.entries(CODES) as [CodeKey, typeof CODES[CodeKey]][]).map(
              ([key, code]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCode(key);
                    setExpandedProvision(null);
                    setFilter("chapter", "All");
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer border border-transparent ${
                    activeCode === key
                      ? "shadow-sm border-opacity-20"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  style={
                    activeCode === key
                      ? {
                          borderColor: code.c,
                          color: code.c,
                          backgroundColor: `${code.c}10`,
                        }
                      : undefined
                  }
                >
                  {code.s}
                </button>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Main content area with optional sidebar */}
      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="p-3">
              <h3
                className="text-xs font-bold mb-3"
                style={{ color: cObj.c }}
              >
                Chapters — {cObj.s}
              </h3>

              <button
                onClick={() => setFilter("chapter", "All")}
                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs mb-0.5 transition-colors cursor-pointer hover:bg-gray-100"
              >
                All Chapters
              </button>

              {chapters.map(([ch, name]) => (
                <button
                  key={ch}
                  onClick={() => setFilter("chapter", ch)}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-xs mb-0.5 transition-colors cursor-pointer hover:bg-gray-100"
                >
                  <span className="font-medium">Ch {ch}:</span>{" "}
                  <span className="text-gray-500">{name}</span>
                </button>
              ))}

              {/* Pinned */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <Pin className="w-3 h-3 text-amber-500" />
                  Pinned
                </h4>
                {pinnedProvisions.length === 0 ? (
                  <p className="text-[10px] text-gray-400">No pins yet</p>
                ) : (
                  pinnedProvisions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setExpandedProvision(p.id);
                        setFilter("chapter", "All");
                      }}
                      className="w-full text-left px-2 py-1 rounded text-[10px] cursor-pointer hover:bg-gray-100 transition-colors block"
                      style={{ color: cObj.c }}
                    >
                      <ChevronRight className="w-2.5 h-2.5 inline mr-0.5" />
                      S.{p.sec}
                      {p.sub} {p.title}
                    </button>
                  ))
                )}
              </div>

            </div>
          </aside>
        )}

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
