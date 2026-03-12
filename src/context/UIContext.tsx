"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Provision } from "@/types/provision";
import type { CodeKey } from "@/types/code";

type ViewType = "mapping" | "dashboard" | "stateTracker" | "timeline" | "penalties" | "compare";
type ModeType = "read" | "admin";

interface UIState {
  mode: ModeType;
  passwordVerified: boolean;
  activeView: ViewType;
  activeCode: CodeKey;
  expandedProvisionId: string | null;
  editingProvision: Provision | null;
  showTextMap: Record<string, boolean>;
  compareA: string | null;
  compareB: string | null;
  sidebarOpen: boolean;
}

interface UIActions {
  setMode: (mode: ModeType) => void;
  setPasswordVerified: (ok: boolean) => void;
  setActiveView: (view: ViewType) => void;
  setActiveCode: (code: CodeKey) => void;
  setExpandedProvision: (id: string | null) => void;
  setEditingProvision: (p: Provision | null) => void;
  toggleShowText: (key: string) => void;
  setCompareA: (id: string | null) => void;
  setCompareB: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
}

const UIContext = createContext<(UIState & UIActions) | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ModeType>("read");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("mapping");
  const [activeCode, setActiveCode] = useState<CodeKey>("CoW");
  const [expandedProvisionId, setExpandedProvision] = useState<string | null>(null);
  const [editingProvision, setEditingProvision] = useState<Provision | null>(null);
  const [showTextMap, setShowTextMap] = useState<Record<string, boolean>>({});
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleShowText = useCallback((key: string) => {
    setShowTextMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const value = useMemo(() => ({
    mode,
    passwordVerified,
    activeView,
    activeCode,
    expandedProvisionId,
    editingProvision,
    showTextMap,
    compareA,
    compareB,
    sidebarOpen,
    setMode,
    setPasswordVerified,
    setActiveView,
    setActiveCode,
    setExpandedProvision,
    setEditingProvision,
    toggleShowText,
    setCompareA,
    setCompareB,
    setSidebarOpen,
  }), [
    mode, passwordVerified, activeView, activeCode, expandedProvisionId,
    editingProvision, showTextMap, compareA, compareB, sidebarOpen, toggleShowText
  ]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
