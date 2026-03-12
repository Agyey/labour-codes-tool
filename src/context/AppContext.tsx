"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Provision } from "@/types/provision";
import type { CodeKey } from "@/types/code";
import { SEED_PROVISIONS } from "@/data/seed-provisions";
import { loadStorage, saveStorage, calculateStats } from "@/lib/utils";

const STORAGE_KEY = "lc-enterprise-v1";

interface StorageData {
  provs: Provision[];
  compSt: Record<string, string>;
  editorPw: string;
}

type ViewType = "mapping" | "dashboard" | "stateTracker" | "timeline" | "penalties" | "compare";
type ModeType = "read" | "admin";

interface AppState {
  // Data
  provisions: Provision[];
  complianceStatuses: Record<string, string>;
  editorPassword: string;
  loading: boolean;
  
  // UI State
  mode: ModeType;
  passwordVerified: boolean;
  activeView: ViewType;
  activeCode: CodeKey;
  searchQuery: string;
  filters: {
    impact: string;
    changeTag: string;
    workflowTag: string;
    ruleAuthority: string;
    state: string;
    chapter: string;
  };
  expandedProvisionId: string | null;
  editingProvision: Provision | null;
  showTextMap: Record<string, boolean>;
  compareA: string | null;
  compareB: string | null;
  sidebarOpen: boolean;
}

interface AppActions {
  // Data actions
  saveProvision: (p: Provision) => void;
  deleteProvision: (id: string) => void;
  togglePin: (id: string) => void;
  toggleVerify: (id: string) => void;
  setComplianceStatus: (id: string, status: string) => void;
  setEditorPassword: (pw: string) => void;
  
  // UI actions
  setMode: (mode: ModeType) => void;
  setPasswordVerified: (ok: boolean) => void;
  setActiveView: (view: ViewType) => void;
  setActiveCode: (code: CodeKey) => void;
  setSearchQuery: (q: string) => void;
  setFilter: (key: keyof AppState["filters"], value: string) => void;
  resetFilters: () => void;
  setExpandedProvision: (id: string | null) => void;
  setEditingProvision: (p: Provision | null) => void;
  toggleShowText: (key: string) => void;
  setCompareA: (id: string | null) => void;
  setCompareB: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Computed
  canEdit: boolean;
  filteredProvisions: Provision[];
  stats: ReturnType<typeof calculateStats>;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

const DEFAULT_FILTERS = {
  impact: "All",
  changeTag: "All",
  workflowTag: "All",
  ruleAuthority: "All",
  state: "All",
  chapter: "All",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [provisions, setProvisions] = useState<Provision[]>(SEED_PROVISIONS);
  const [complianceStatuses, setComplianceStatuses] = useState<Record<string, string>>({});
  const [editorPassword, setEditorPasswordState] = useState("");
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<ModeType>("read");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("mapping");
  const [activeCode, setActiveCode] = useState<CodeKey>("CoW");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [expandedProvisionId, setExpandedProvision] = useState<string | null>(null);
  const [editingProvision, setEditingProvision] = useState<Provision | null>(null);
  const [showTextMap, setShowTextMap] = useState<Record<string, boolean>>({});
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    loadStorage<StorageData>(STORAGE_KEY).then((data) => {
      if (data) {
        if (data.provs) setProvisions(data.provs);
        if (data.compSt) setComplianceStatuses(data.compSt);
        if (data.editorPw) setEditorPasswordState(data.editorPw);
      }
      setLoading(false);
    });
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      saveStorage(STORAGE_KEY, {
        provs: provisions,
        compSt: complianceStatuses,
        editorPw: editorPassword,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [provisions, complianceStatuses, editorPassword, loading]);

  // Actions
  const saveProvision = useCallback((p: Provision) => {
    setProvisions((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = p;
        return next;
      }
      return [...prev, p];
    });
    setEditingProvision(null);
  }, []);

  const deleteProvision = useCallback((id: string) => {
    setProvisions((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    setProvisions((prev) =>
      prev.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x))
    );
  }, []);

  const toggleVerify = useCallback((id: string) => {
    setProvisions((prev) =>
      prev.map((x) => (x.id === id ? { ...x, verified: !x.verified } : x))
    );
  }, []);

  const setComplianceStatus = useCallback((id: string, status: string) => {
    setComplianceStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const setEditorPassword = useCallback((pw: string) => {
    setEditorPasswordState(pw);
  }, []);

  const setFilter = useCallback(
    (key: keyof typeof DEFAULT_FILTERS, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
  }, []);

  const toggleShowText = useCallback((key: string) => {
    setShowTextMap((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const canEdit = mode === "admin" && (!editorPassword || passwordVerified);

  // Filtered provisions
  const filteredProvisions = useMemo(() => {
    let result = provisions.filter((x) => x.code === activeCode);

    if (filters.impact !== "All") result = result.filter((x) => x.impact === filters.impact);
    if (filters.changeTag !== "All") result = result.filter((x) => (x.changeTags || []).includes(filters.changeTag));
    if (filters.workflowTag !== "All") result = result.filter((x) => (x.workflowTags || []).includes(filters.workflowTag));
    if (filters.ruleAuthority !== "All") result = result.filter((x) => x.ruleAuth === filters.ruleAuthority);
    if (filters.chapter !== "All") result = result.filter((x) => x.ch === filters.chapter);
    if (filters.state !== "All") result = result.filter((x) => (x.stateNotes || {})[filters.state] || (x.stateRuleText || {})[filters.state]);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.sec.toLowerCase().includes(q) ||
          (x.sub || "").toLowerCase().includes(q) ||
          x.summary.toLowerCase().includes(q) ||
          (x.oldMappings || []).some(
            (m) =>
              m.act.toLowerCase().includes(q) ||
              m.summary.toLowerCase().includes(q) ||
              m.change.toLowerCase().includes(q)
          ) ||
          (x.compItems || []).some((c) =>
            (c.task || "").toLowerCase().includes(q)
          )
      );
    }

    return result;
  }, [provisions, activeCode, filters, searchQuery]);

  // Stats
  const stats = useMemo(
    () =>
      calculateStats(
        provisions.filter((x) => x.code === activeCode),
        complianceStatuses
      ),
    [provisions, complianceStatuses, activeCode]
  );

  const value = {
    // State
    provisions,
    complianceStatuses,
    editorPassword,
    loading,
    mode,
    passwordVerified,
    activeView,
    activeCode,
    searchQuery,
    filters,
    expandedProvisionId,
    editingProvision,
    showTextMap,
    compareA,
    compareB,
    sidebarOpen,
    // Actions
    saveProvision,
    deleteProvision,
    togglePin,
    toggleVerify,
    setComplianceStatus,
    setEditorPassword,
    setMode,
    setPasswordVerified,
    setActiveView,
    setActiveCode,
    setSearchQuery,
    setFilter,
    resetFilters,
    setExpandedProvision,
    setEditingProvision,
    toggleShowText,
    setCompareA,
    setCompareB,
    setSidebarOpen,
    // Computed
    canEdit,
    filteredProvisions,
    stats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
