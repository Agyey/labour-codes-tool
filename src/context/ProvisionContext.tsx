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
import { getProvisions } from "@/app/actions/provisions/read";
import { updateProvision } from "@/app/actions/provisions/write";
import { 
  deleteProvision as deleteProvisionAction,
  deleteProvisions as deleteProvisionsAction,
  togglePin as togglePinAction,
  toggleVerify as toggleVerifyAction,
} from "@/app/actions/provisions/toggle";
import { loadStorage, saveStorage, calculateStats } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useUI } from "@/context/UIContext";
import toast from "react-hot-toast";

const STORAGE_KEY = "lc-provisions-v1";

interface ProvisionState {
  provisions: Provision[];
  complianceStatuses: Record<string, string>;
  loading: boolean;
  stats: ReturnType<typeof calculateStats>;
}

interface ProvisionActions {
  saveProvision: (p: Provision) => Promise<void>;
  deleteProvision: (id: string) => void;
  deleteProvisions: (ids: string[]) => void;
  togglePin: (id: string) => void;
  toggleVerify: (id: string) => void;
  setComplianceStatus: (id: string, status: string) => void;
  refreshProvisions: () => Promise<void>;
}

const ProvisionStateContext = createContext<ProvisionState | null>(null);
const ProvisionActionsContext = createContext<ProvisionActions | null>(null);

export function ProvisionProvider({ children }: { children: ReactNode }) {
  useSession();
  const { activeCode } = useUI();

  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [complianceStatuses, setComplianceStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const refreshProvisions = useCallback(async () => {
    setLoading(true);
    try {
      const dbProvs = await getProvisions();
      if (dbProvs) setProvisions(dbProvs);

      const data = loadStorage<{ compSt: Record<string, string> }>(STORAGE_KEY);
      if (data?.compSt) setComplianceStatuses(data.compSt);
    } catch (err) {
      console.error("Failed to refresh provisions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProvisions();
  }, [refreshProvisions]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      saveStorage(STORAGE_KEY, { compSt: complianceStatuses });
    }, 1500);
    return () => clearTimeout(timer);
  }, [complianceStatuses, loading]);

  const saveProvision = useCallback(async (p: Provision) => {
    if (!p.id) return;
    
    await toast.promise(
      updateProvision(p.id, p).then((res) => {
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
  }, []);

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
    setProvisions(prev => prev.map(x => x.id === id ? { ...x, pinned: newPinned } : x));
    
    const res = await togglePinAction(id, newPinned);
    if (!res.success) {
      setProvisions(p => p.map(x => x.id === id ? { ...x, pinned: !newPinned } : x));
      toast.error("Failed to update pin status.");
    }
  }, [provisions]);

  const toggleVerify = useCallback(async (id: string) => {
    const prov = provisions.find(x => x.id === id);
    if (!prov) return;
    
    const newVerified = !prov.verified;
    setProvisions(prev => prev.map(x => x.id === id ? { ...x, verified: newVerified } : x));
    
    const res = await toggleVerifyAction(id, newVerified);
    if (!res.success) {
      setProvisions(p => p.map(x => x.id === id ? { ...x, verified: !newVerified } : x));
      toast.error("Failed to update verification status.");
    }
  }, [provisions]);

  const setComplianceStatus = useCallback((id: string, status: string) => {
    setComplianceStatuses((prev) => ({ ...prev, [id]: status }));
  }, []);

  const stats = useMemo(() => 
    calculateStats(provisions.filter((x) => x.code === activeCode), complianceStatuses),
  [provisions, complianceStatuses, activeCode]);

  const stateValue = useMemo(() => ({
    provisions,
    complianceStatuses,
    loading,
    stats,
  }), [provisions, complianceStatuses, loading, stats]);

  const actionsValue = useMemo(() => ({
    saveProvision,
    deleteProvision,
    deleteProvisions,
    togglePin,
    toggleVerify,
    setComplianceStatus,
    refreshProvisions,
  }), [saveProvision, deleteProvision, deleteProvisions, togglePin, toggleVerify, setComplianceStatus, refreshProvisions]);

  return (
    <ProvisionStateContext.Provider value={stateValue}>
      <ProvisionActionsContext.Provider value={actionsValue}>
        {children}
      </ProvisionActionsContext.Provider>
    </ProvisionStateContext.Provider>
  );
}

export function useProvisions() {
  const state = useContext(ProvisionStateContext);
  const actions = useContext(ProvisionActionsContext);
  if (!state || !actions) throw new Error("useProvisions must be used within ProvisionProvider");
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
