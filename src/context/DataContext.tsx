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
import type { User } from "@/types/provision";
import { getProvisions, updateProvision } from "@/app/actions/provisions";
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
  complianceStatuses: Record<string, string>;
  editorPassword: string;
  loading: boolean;
  users: User[];
}

interface DataActions {
  saveProvision: (p: Provision) => void;
  deleteProvision: (id: string) => void;
  togglePin: (id: string) => void;
  toggleVerify: (id: string) => void;
  setComplianceStatus: (id: string, status: string) => void;
  setEditorPassword: (pw: string) => void;
  canEdit: boolean;
  stats: ReturnType<typeof calculateStats>;
}

const DataContext = createContext<(DataState & DataActions) | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { activeCode, mode, passwordVerified } = useUI();

  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [complianceStatuses, setComplianceStatuses] = useState<Record<string, string>>({});
  const [editorPassword, setEditorPasswordState] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Load from database + localStorage
  useEffect(() => {
    async function initData() {
      try {
        const dbProvs = await getProvisions();
        if (dbProvs && dbProvs.length > 0) {
          setProvisions(dbProvs as Provision[]);
        }

        const dbUsers = await getUsers();
        if (dbUsers) {
          setUsers(dbUsers as User[]);
        }

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
    }
    initData();
  }, []);

  // Auto-save local preferences with debounce
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

  const canEdit = !!session?.user && (session.user.role === "admin" || session.user.role === "editor") || (mode === "admin" && (!editorPassword || passwordVerified));

  const stats = useMemo(
    () =>
      calculateStats(
        provisions.filter((x) => x.code === activeCode),
        complianceStatuses
      ),
    [provisions, complianceStatuses, activeCode]
  );

  const value = useMemo(() => ({
    provisions,
    complianceStatuses,
    editorPassword,
    loading,
    users,
    saveProvision,
    deleteProvision,
    togglePin,
    toggleVerify,
    setComplianceStatus,
    setEditorPassword,
    canEdit,
    stats,
  }), [
    provisions, complianceStatuses, editorPassword, loading, users,
    saveProvision, deleteProvision, togglePin, toggleVerify,
    setComplianceStatus, setEditorPassword, canEdit, stats
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
