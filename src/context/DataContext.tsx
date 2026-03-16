"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Provision, Framework, Legislation, User } from "@/types/provision";
import { 
  getProvisions, 
  updateProvision, 
  deleteProvision as deleteProvisionAction,
  deleteProvisions as deleteProvisionsAction,
  togglePin as togglePinAction,
  toggleVerify as toggleVerifyAction,
  getFrameworks,
  getLegislations,
  createFramework as createFrameworkAction,
  updateFramework as updateFrameworkAction,
  deleteFramework as deleteFrameworkAction,
  createLegislation as createLegislationAction,
  deleteLegislation as deleteLegislationAction
} from "@/app/actions/provisions";
import { getUsers } from "@/app/actions/users";
import { loadStorage, saveStorage, calculateStats } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useUI } from "@/context/UIContext";
import toast from "react-hot-toast";

const STORAGE_KEY = "lc-enterprise-v1";

interface StorageData {
  provs: Provision[];
  compSt: Record<string, string>;
  editorPw: string;
}

interface DataState {
  provisions: Provision[];
  frameworks: Framework[];
  legislations: Legislation[];
  complianceStatuses: Record<string, string>;
  editorPassword: string;
  loading: boolean;
  users: User[];
  canEdit: boolean;
  stats: ReturnType<typeof calculateStats>;
}

interface DataActions {
  saveProvision: (p: Provision) => Promise<void>;
  deleteProvision: (id: string) => void;
  deleteProvisions: (ids: string[]) => void;
  togglePin: (id: string) => void;
  toggleVerify: (id: string) => void;
  setComplianceStatus: (id: string, status: string) => void;
  setEditorPassword: (pw: string) => void;
  createFramework: (data: any) => Promise<boolean>;
  updateFramework: (id: string, data: any) => Promise<boolean>;
  deleteFramework: (id: string) => Promise<boolean>;
  createLegislation: (data: any) => Promise<boolean>;
  deleteLegislation: (id: string) => Promise<boolean>;
}

const DataStateContext = createContext<DataState | null>(null);
const DataActionsContext = createContext<DataActions | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { activeCode, mode, passwordVerified } = useUI();

  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [legislations, setLegislations] = useState<Legislation[]>([]);
  const [complianceStatuses, setComplianceStatuses] = useState<Record<string, string>>({});
  const [editorPassword, setEditorPasswordState] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [dbProvs, dbUsers, dbFrameworks, dbLegislations] = await Promise.all([
        getProvisions(),
        getUsers(),
        getFrameworks(),
        getLegislations()
      ]);

      if (dbProvs) setProvisions(dbProvs as Provision[]);
      if (dbUsers) setUsers(dbUsers as User[]);
      if (dbFrameworks) setFrameworks(dbFrameworks as any[]);
      if (dbLegislations) setLegislations(dbLegislations as any[]);

      const data = loadStorage<StorageData>(STORAGE_KEY);
      if (data) {
        if (data.compSt) setComplianceStatuses(data.compSt);
        if (data.editorPw) setEditorPasswordState(data.editorPw);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      saveStorage(STORAGE_KEY, {
        compSt: complianceStatuses,
        editorPw: editorPassword,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [complianceStatuses, editorPassword, loading]);

  const saveProvision = useCallback(async (p: Provision) => {
    if (!p.id) return;
    const userId = session?.user?.id;
    
    await toast.promise(
      updateProvision(p.id, p, userId).then((res) => {
        if (!res.success) throw new Error("Failed to save");
        setProvisions((prev) => {
          const i = prev.findIndex((x) => x.id === p.id);
          if (i >= 0) {
            const next = [...prev];
            next[i] = p;
            return next;
          }
          return [...prev, p];
        });
        return res;
      }),
      {
        loading: "Saving provision...",
        success: "Provision saved.",
        error: "Failed to save. Check your connection.",
      }
    );
  }, [session]);

  const deleteProvision = useCallback(async (id: string) => {
    const res = await deleteProvisionAction(id);
    if (res.success) {
      setProvisions((prev) => prev.filter((x) => x.id !== id));
      toast.success("Provision deleted.");
    } else {
      toast.error("Failed to delete provision.");
    }
  }, []);

  const deleteProvisions = useCallback(async (ids: string[]) => {
    const res = await deleteProvisionsAction(ids);
    if (res.success) {
      setProvisions((prev) => prev.filter((x) => !ids.includes(x.id)));
      toast.success(`${ids.length} provisions deleted.`);
    } else {
      toast.error("Failed to delete provisions.");
    }
  }, []);

  const togglePin = useCallback(async (id: string) => {
    const prov = provisions.find(x => x.id === id);
    if (!prov) return;
    
    const newPinned = !prov.pinned;
    // Optimistic update
    setProvisions(prev => prev.map(x => x.id === id ? { ...x, pinned: newPinned } : x));
    
    const res = await togglePinAction(id, newPinned);
    if (!res.success) {
      // Revert on failure
      setProvisions(p => p.map(x => x.id === id ? { ...x, pinned: !newPinned } : x));
      toast.error("Failed to update pin status.");
    }
  }, [provisions]);

  const toggleVerify = useCallback(async (id: string) => {
    const prov = provisions.find(x => x.id === id);
    if (!prov) return;
    
    const newVerified = !prov.verified;
    // Optimistic update
    setProvisions(prev => prev.map(x => x.id === id ? { ...x, verified: newVerified } : x));
    
    const res = await toggleVerifyAction(id, newVerified);
    if (!res.success) {
      // Revert on failure
      setProvisions(p => p.map(x => x.id === id ? { ...x, verified: !newVerified } : x));
      toast.error("Failed to update verification status.");
    }
  }, [provisions]);

  const setComplianceStatus = useCallback((id: string, status: string) => {
    setComplianceStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const createFramework = useCallback(async (data: any) => {
    const res = await createFrameworkAction(data);
    if (res.success) {
      await refreshData();
      toast.success("Framework created.");
      return true;
    }
    toast.error(res.error || "Failed to create framework.");
    return false;
  }, [refreshData]);

  const updateFramework = useCallback(async (id: string, data: any) => {
    const res = await updateFrameworkAction(id, data);
    if (res.success) {
      await refreshData();
      toast.success("Framework updated.");
      return true;
    }
    toast.error(res.error || "Failed to update framework.");
    return false;
  }, [refreshData]);

  const deleteFramework = useCallback(async (id: string) => {
    if (!confirm("Delete this framework and all its contents?")) return false;
    const res = await deleteFrameworkAction(id);
    if (res.success) {
      await refreshData();
      toast.success("Framework deleted.");
      return true;
    }
    toast.error("Failed to delete framework.");
    return false;
  }, [refreshData]);

  const createLegislation = useCallback(async (data: any) => {
    const res = await createLegislationAction(data);
    if (res.success) {
      await refreshData();
      toast.success("Legislation created.");
      return true;
    }
    toast.error(res.error || "Failed to create legislation.");
    return false;
  }, [refreshData]);

  const deleteLegislation = useCallback(async (id: string) => {
    const res = await deleteLegislationAction(id);
    if (res.success) {
      await refreshData();
      toast.success("Legislation deleted.");
      return true;
    }
    toast.error("Failed to delete legislation.");
    return false;
  }, [refreshData]);

  const setEditorPassword = useCallback((pw: string) => {
    setEditorPasswordState(pw);
  }, []);

  const canEdit = useMemo(() => 
    mode === "admin" && !!session?.user && (session.user.role === "admin" || session.user.role === "editor"),
  [mode, session]);

  const stats = useMemo(() => 
    calculateStats(provisions.filter((x) => x.code === activeCode), complianceStatuses),
  [provisions, complianceStatuses, activeCode]);

  const stateValue = useMemo(() => ({
    provisions,
    frameworks,
    legislations,
    complianceStatuses,
    editorPassword,
    loading,
    users,
    canEdit,
    stats,
  }), [provisions, frameworks, legislations, complianceStatuses, editorPassword, loading, users, canEdit, stats]);

  const actionsValue = useMemo(() => ({
    saveProvision,
    deleteProvision,
    deleteProvisions,
    togglePin,
    toggleVerify,
    setComplianceStatus,
    setEditorPassword,
    createFramework,
    updateFramework,
    deleteFramework,
    createLegislation,
    deleteLegislation,
  }), [
    saveProvision, deleteProvision, deleteProvisions, togglePin, toggleVerify,
    setComplianceStatus, setEditorPassword, createFramework, updateFramework, 
    deleteFramework, createLegislation, deleteLegislation
  ]);

  return (
    <DataStateContext.Provider value={stateValue}>
      <DataActionsContext.Provider value={actionsValue}>
        {children}
      </DataActionsContext.Provider>
    </DataStateContext.Provider>
  );
}

export function useData() {
  const state = useContext(DataStateContext);
  const actions = useContext(DataActionsContext);
  if (!state || !actions) throw new Error("useData must be used within DataProvider");
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}

export function useDataActions() {
    const actions = useContext(DataActionsContext);
    if (!actions) throw new Error("useDataActions must be used within DataProvider");
    return actions;
}

export function useDataState() {
    const state = useContext(DataStateContext);
    if (!state) throw new Error("useDataState must be used within DataProvider");
    return state;
}
