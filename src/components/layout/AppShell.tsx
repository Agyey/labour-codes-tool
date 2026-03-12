"use client";

import { useApp } from "@/context/AppContext";
import { CODES } from "@/config/codes";
import type { CodeKey } from "@/types/code";
import {
  LayoutDashboard,
  Map,
  Globe,
  Clock,
  AlertTriangle,
  GitCompare,
  Menu,
  Eye,
  Pencil,
  Lock,
  ChevronRight,
  Pin,
  Scale,
} from "lucide-react";
import { useState } from "react";

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
    setEditorPassword,
  } = useApp();

  const [pwInput, setPwInput] = useState("");

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

            <div className="flex items-center gap-2">
              {/* Password input for admin mode */}
              {mode === "admin" && editorPassword && !passwordVerified && (
                <div className="flex items-center gap-1.5 animate-in slide-in-from-right">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <input
                    type="password"
                    value={pwInput}
                    onChange={(e) => setPwInput(e.target.value)}
                    placeholder="Editor password"
                    className="px-2 py-1.5 rounded-md text-xs bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-400 w-28"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (pwInput === editorPassword) setPasswordVerified(true);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (pwInput === editorPassword) setPasswordVerified(true);
                    }}
                    className="px-2.5 py-1.5 bg-amber-500 text-black rounded-md text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    Unlock
                  </button>
                </div>
              )}

              {/* Mode toggle */}
              <button
                onClick={() => {
                  setMode(mode === "read" ? "admin" : "read");
                  setPasswordVerified(false);
                  setPwInput("");
                }}
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

              {/* Editor password setting */}
              {canEdit && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-gray-700 mb-2">
                    Editor Password
                  </h4>
                  <input
                    value={editorPassword}
                    onChange={(e) => setEditorPassword(e.target.value)}
                    placeholder="Set password"
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs"
                  />
                </div>
              )}
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
