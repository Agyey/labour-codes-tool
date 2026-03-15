"use client";

import type { ReactNode } from "react";
import { UIProvider } from "./UIContext";
import { DataProvider } from "./DataContext";
import { FilterProvider } from "./FilterContext";

/**
 * Composes all context providers in the correct dependency order:
 * UIProvider → DataProvider (needs activeCode from UI) → FilterProvider (needs both)
 */
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <DataProvider>
        <FilterProvider>{children}</FilterProvider>
      </DataProvider>
    </UIProvider>
  );
}
