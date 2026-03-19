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
import type { User } from "@/types/provision";
import { getUsers } from "@/app/actions/users";
import { useSession } from "next-auth/react";
import { useUI } from "@/context/UIContext";

interface UserState {
  users: User[];
  canEdit: boolean;
  loading: boolean;
}

const UserStateContext = createContext<UserState | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { mode } = useUI();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    try {
      const dbUsers = await getUsers();
      if (dbUsers) setUsers(dbUsers as User[]);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const canEdit = useMemo(() => 
    mode === "admin" && !!session?.user && (session.user.role === "admin" || session.user.role === "editor"),
  [mode, session]);

  const stateValue = useMemo(() => ({
    users,
    canEdit,
    loading,
  }), [users, canEdit, loading]);

  return (
    <UserStateContext.Provider value={stateValue}>
      {children}
    </UserStateContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserStateContext);
  if (!context) throw new Error("useUsers must be used within UserProvider");
  return context;
}
