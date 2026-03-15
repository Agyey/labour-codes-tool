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

type ViewType = "mapping" | "dashboard" | "bucket" | "stateTracker" | "timeline" | "penalties" | "compare";
type ModeType = "read" | "admin";

interface UIState {
  mode: ModeType;
  passwordVerified: boolean;
  activeView: ViewType;
  activeCode: CodeKey;
  expandedProvisionId: string | null;
  editingProvision: Provision | null;
  showTextMap: Record<string, boolean>;
  comparePayload: {
    sideA: Provision | null;
    sideB: { code: string; title: string; summary: string; fullText?: string } | null;
  } | null;
  sidebarOpen: boolean;
  pdfBlobUrl: string | null;
  isGeneratingPDF: boolean;
}

interface UIActions {
  setMode: (mode: ModeType) => void;
  setPasswordVerified: (ok: boolean) => void;
  setActiveView: (view: ViewType) => void;
  setActiveCode: (code: CodeKey) => void;
  setExpandedProvision: (id: string | null) => void;
  setEditingProvision: (p: Provision | null) => void;
  toggleShowText: (key: string) => void;
  setComparePayload: (payload: {
    sideA: Provision | null;
    sideB: { code: string; title: string; summary: string; fullText?: string } | null;
  } | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setPdfBlobUrl: (url: string | null) => void;
  setIsGeneratingPDF: (generating: boolean) => void;
}

const UIContext = createContext<(UIState & UIActions) | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ModeType>("read");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [activeCode, setActiveCode] = useState<CodeKey>("CoW");
  const [expandedProvisionId, setExpandedProvision] = useState<string | null>(null);
  const [editingProvision, setEditingProvision] = useState<Provision | null>(null);
  const [showTextMap, setShowTextMap] = useState<Record<string, boolean>>({});
  const [comparePayload, setComparePayload] = useState<{
    sideA: Provision | null;
    sideB: { code: string; title: string; summary: string; fullText?: string } | null;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
    comparePayload,
    sidebarOpen,
    pdfBlobUrl,
    isGeneratingPDF,
    setMode,
    setPasswordVerified,
    setActiveView,
    setActiveCode,
    setExpandedProvision,
    setEditingProvision,
    toggleShowText,
    setComparePayload,
    setSidebarOpen,
    setPdfBlobUrl,
    setIsGeneratingPDF,
  }), [
    mode, 
    passwordVerified, 
    activeView, 
    activeCode, 
    expandedProvisionId,
    editingProvision, 
    showTextMap, 
    comparePayload, 
    sidebarOpen,
    pdfBlobUrl, 
    isGeneratingPDF, 
    toggleShowText
  ]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
