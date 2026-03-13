"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ProductType = 
  | "MAPPING" 
  | "COMPLIANCE" 
  | "AGREEMENTS" 
  | "DILIGENCE"
  | "WORKFLOW_DASH"
  | "WORKSPACE";

// For tracking specific organizations or companies (Product 2, 3, 4, 5)
export interface EntityContext {
  activeCompanyId: string | null;
  activeFrameworkId: string | null;
}

interface LegalOSContextType {
  activeProduct: ProductType;
  setActiveProduct: (product: ProductType) => void;
  entityContext: EntityContext;
  setEntityContext: (context: Partial<EntityContext>) => void;
}

const LegalOSContext = createContext<LegalOSContextType | undefined>(undefined);

export function LegalOSProvider({ children }: { children: ReactNode }) {
  const [activeProduct, setActiveProduct] = useState<ProductType>("MAPPING");
  const [entityContext, setEntityContextState] = useState<EntityContext>({
    activeCompanyId: null,
    activeFrameworkId: null, // If null, assume 'Labour Codes' legacy view
  });

  const setEntityContext = (updates: Partial<EntityContext>) => {
    setEntityContextState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <LegalOSContext.Provider
      value={{
        activeProduct,
        setActiveProduct,
        entityContext,
        setEntityContext,
      }}
    >
      {children}
    </LegalOSContext.Provider>
  );
}

export function useLegalOS() {
  const context = useContext(LegalOSContext);
  if (context === undefined) {
    throw new Error("useLegalOS must be used within a LegalOSProvider");
  }
  return context;
}
