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
import type { Framework, Legislation } from "@/types/provision";
import {
  getFrameworks,
  getLegislations,
  createFramework as createFrameworkAction,
  updateFramework as updateFrameworkAction,
  deleteFramework as deleteFrameworkAction,
  createLegislation as createLegislationAction,
  deleteLegislation as deleteLegislationAction
} from "@/app/actions/frameworks";
import toast from "react-hot-toast";

interface FrameworkState {
  frameworks: Framework[];
  legislations: Legislation[];
  loading: boolean;
}

interface FrameworkActions {
  createFramework: (data: any) => Promise<boolean>;
  updateFramework: (id: string, data: any) => Promise<boolean>;
  deleteFramework: (id: string) => Promise<boolean>;
  createLegislation: (data: any) => Promise<boolean>;
  deleteLegislation: (id: string) => Promise<boolean>;
  refreshFrameworks: () => Promise<void>;
}

const FrameworkStateContext = createContext<FrameworkState | null>(null);
const FrameworkActionsContext = createContext<FrameworkActions | null>(null);

export function FrameworkProvider({ children }: { children: ReactNode }) {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [legislations, setLegislations] = useState<Legislation[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFrameworks = useCallback(async () => {
    setLoading(true);
    try {
      const [dbFrameworks, dbLegislations] = await Promise.all([
        getFrameworks(),
        getLegislations()
      ]);
      if (dbFrameworks) setFrameworks(dbFrameworks as Framework[]);
      if (dbLegislations) setLegislations(dbLegislations as Legislation[]);
    } catch (err) {
      console.error("Failed to fetch frameworks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFrameworks();
  }, [refreshFrameworks]);

  const createFramework = useCallback(async (data: any) => {
    const res = await createFrameworkAction(data);
    if (res.success) {
      await refreshFrameworks();
      toast.success("Framework created.");
      return true;
    }
    toast.error("Failed to create framework.");
    return false;
  }, [refreshFrameworks]);

  const updateFramework = useCallback(async (id: string, data: any) => {
    const res = await updateFrameworkAction(id, data);
    if (res.success) {
      await refreshFrameworks();
      toast.success("Framework updated.");
      return true;
    }
    toast.error("Failed to update framework.");
    return false;
  }, [refreshFrameworks]);

  const deleteFramework = useCallback(async (id: string) => {
    if (!confirm("Delete this framework and all its contents?")) return false;
    const res = await deleteFrameworkAction(id);
    if (res.success) {
      await refreshFrameworks();
      toast.success("Framework deleted.");
      return true;
    }
    toast.error("Failed to delete framework.");
    return false;
  }, [refreshFrameworks]);

  const createLegislation = useCallback(async (data: any) => {
    const res = await createLegislationAction(data);
    if (res.success) {
      await refreshFrameworks();
      toast.success("Legislation created.");
      return true;
    }
    toast.error("Failed to create legislation.");
    return false;
  }, [refreshFrameworks]);

  const deleteLegislation = useCallback(async (id: string) => {
    const res = await deleteLegislationAction(id);
    if (res.success) {
      await refreshFrameworks();
      toast.success("Legislation deleted.");
      return true;
    }
    toast.error("Failed to delete legislation.");
    return false;
  }, [refreshFrameworks]);

  const stateValue = useMemo(() => ({
    frameworks,
    legislations,
    loading,
  }), [frameworks, legislations, loading]);

  const actionsValue = useMemo(() => ({
    createFramework,
    updateFramework,
    deleteFramework,
    createLegislation,
    deleteLegislation,
    refreshFrameworks,
  }), [createFramework, updateFramework, deleteFramework, createLegislation, deleteLegislation, refreshFrameworks]);

  return (
    <FrameworkStateContext.Provider value={stateValue}>
      <FrameworkActionsContext.Provider value={actionsValue}>
        {children}
      </FrameworkActionsContext.Provider>
    </FrameworkStateContext.Provider>
  );
}

export function useFrameworks() {
  const state = useContext(FrameworkStateContext);
  const actions = useContext(FrameworkActionsContext);
  if (!state || !actions) throw new Error("useFrameworks must be used within FrameworkProvider");
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
