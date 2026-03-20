/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ProvisionProvider, useProvisions } from "./ProvisionContext";
import { FrameworkProvider, useFrameworks } from "./FrameworkContext";
import { UserProvider, useUsers } from "./UserContext";
import type { Provision, Framework, Legislation, User } from "@/types/provision";

interface FullDataContext {
  // Provision State & Actions
  provisions: Provision[];
  complianceStatuses: Record<string, string>;
  loading: boolean;
  stats: any; 
  saveProvision: (p: Provision) => Promise<void>;
  deleteProvision: (id: string) => void;
  deleteProvisions: (ids: string[]) => void;
  togglePin: (id: string) => void;
  toggleVerify: (id: string) => void;
  setComplianceStatus: (id: string, status: string) => void;
  refreshProvisions: () => Promise<void>;

  // Framework State & Actions
  frameworks: Framework[];
  legislations: Legislation[];
  createFramework: (data: any) => Promise<boolean>;
  updateFramework: (id: string, data: any) => Promise<boolean>;
  deleteFramework: (id: string) => Promise<boolean>;
  createLegislation: (data: any) => Promise<boolean>;
  deleteLegislation: (id: string) => Promise<boolean>;
  refreshFrameworks: () => Promise<void>;

  // User State
  users: User[];
  canEdit: boolean;

  // Legacy / Placeholder
  editorPassword: string;
  setEditorPassword: (pw: string) => void;
}

const DataStateContext = createContext<FullDataContext | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  return (
    <FrameworkProvider>
      <UserProvider>
        <ProvisionProvider>
          <DataBridge>{children}</DataBridge>
        </ProvisionProvider>
      </UserProvider>
    </FrameworkProvider>
  );
}

function DataBridge({ children }: { children: ReactNode }) {
  const provisionContext = useProvisions();
  const frameworkContext = useFrameworks();
  const userContext = useUsers();

  const value: FullDataContext = useMemo(() => ({
    // Provision State & Actions
    provisions: provisionContext.provisions,
    complianceStatuses: provisionContext.complianceStatuses,
    loading: provisionContext.loading || frameworkContext.loading || userContext.loading,
    stats: provisionContext.stats,
    saveProvision: provisionContext.saveProvision,
    deleteProvision: provisionContext.deleteProvision,
    deleteProvisions: provisionContext.deleteProvisions,
    togglePin: provisionContext.togglePin,
    toggleVerify: provisionContext.toggleVerify,
    setComplianceStatus: provisionContext.setComplianceStatus,
    refreshProvisions: provisionContext.refreshProvisions,

    // Framework State & Actions
    frameworks: frameworkContext.frameworks,
    legislations: frameworkContext.legislations,
    createFramework: frameworkContext.createFramework,
    updateFramework: frameworkContext.updateFramework,
    deleteFramework: frameworkContext.deleteFramework,
    createLegislation: frameworkContext.createLegislation,
    deleteLegislation: frameworkContext.deleteLegislation,
    refreshFrameworks: frameworkContext.refreshFrameworks,

    // User State
    users: userContext.users,
    canEdit: userContext.canEdit,

    // Legacy / Placeholder
    editorPassword: "",
    setEditorPassword: () => {},
  }), [provisionContext, frameworkContext, userContext]);

  return (
    <DataStateContext.Provider value={value}>
      {children}
    </DataStateContext.Provider>
  );
}

export function useData(): FullDataContext {
  const context = useContext(DataStateContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
}

export const useDataActions = useData;
export const useDataState = useData;
