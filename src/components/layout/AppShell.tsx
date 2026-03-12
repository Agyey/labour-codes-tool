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
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white shadow-xl">
        <div className="max-w-[1400px] mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center shadow-lg">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight leading-tight">
                  India Labour Code Reform
                </h1>
                <p className="text-[10px] text-white/60 leading-tight">
                  Legal Intelligence Platform · 4 Codes · 29 Repealed Acts ·
                  6 Jurisdictions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Global Search */}
              <CommandPalette />

              {/* User Session Info */}
              {session?.user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold leading-tight">{session.user.name || session.user.email}</p>
                    <p className="text-[10px] text-white/70 capitalize">
                      Role: {(session.user as any).role || "Viewer"}
                    </p>
                  </div>
                  {session.user.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border-2 border-white/20">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-xs font-bold transition-colors"
                >
                  Sign In
                </button>
              )}

              {/* Mode toggle - Only visible to Admins/Editors */}
              {(session?.user as any)?.role === "admin" || (session?.user as any)?.role === "editor" ? (
                <button
                  onClick={() => setMode(mode === "read" ? "admin" : "read")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    mode === "admin"
                      ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
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
                className="p-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-[60px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center overflow-x-auto">
          {/* View tabs */}
          <div className="flex items-center">
            {VIEWS.map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id as typeof activeView)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeView === v.id
                      ? "border-slate-800 text-slate-800 bg-slate-50 font-bold"
                      : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
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
          <div className="flex items-center">
            {(Object.entries(CODES) as [CodeKey, typeof CODES[CodeKey]][]).map(
              ([key, code]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCode(key);
                    setExpandedProvision(null);
                    setFilter("chapter", "All");
                  }}
                  className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeCode === key
                      ? "font-bold"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                  style={
                    activeCode === key
                      ? {
                          borderBottomColor: code.c,
                          color: code.c,
                          backgroundColor: code.bg,
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
