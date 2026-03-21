"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useData } from "./DataContext";
import { useUI } from "./UIContext";

const DEFAULT_FILTERS = {
  impact: "All",
  changeTag: "All",
  workflowTag: "All",
  ruleAuthority: "All",
  state: "All",
  chapter: "All",
};

type Filters = typeof DEFAULT_FILTERS;

interface FilterState {
  searchQuery: string;
  filters: Filters;
}

interface FilterActions {
  setSearchQuery: (q: string) => void;
  setFilter: (key: keyof Filters, value: string) => void;
  resetFilters: () => void;
  filteredProvisions: ReturnType<typeof Array.prototype.filter>;
}

const FilterContext = createContext<(FilterState & FilterActions) | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const { provisions } = useData();
  const { activeCode } = useUI();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const setFilter = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
  }, []);

  const filteredProvisions = useMemo(() => {
    /* ⚡ Bolt Optimization:
     * Previously, this used 7 chained `.filter()` calls, resulting in O(7n) time complexity
     * and multiple intermediate array allocations on every render/keystroke.
     * We've combined all conditions into a single O(n) pass and hoisted the
     * `searchQuery.toLowerCase()` transformation outside the loop to prevent
     * redundant string allocations.
     */
    const q = searchQuery ? searchQuery.toLowerCase() : "";

    return provisions.filter((x) => {
      // 1. Basic activeCode filter
      if (x.code !== activeCode) return false;

      // 2. Dropdown filters
      if (filters.impact !== "All" && x.impact !== filters.impact) return false;
      if (filters.changeTag !== "All" && !(x.changeTags || []).includes(filters.changeTag)) return false;
      if (filters.workflowTag !== "All" && !(x.workflowTags || []).includes(filters.workflowTag)) return false;
      if (filters.ruleAuthority !== "All" && x.ruleAuth !== filters.ruleAuthority) return false;
      if (filters.chapter !== "All" && x.ch !== filters.chapter) return false;
      if (filters.state !== "All" && !((x.stateNotes || {})[filters.state] || (x.stateRuleText || {})[filters.state])) return false;

      // 3. Search query filter
      if (q) {
        if (
          x.title.toLowerCase().includes(q) ||
          x.sec.toLowerCase().includes(q) ||
          (x.sub || "").toLowerCase().includes(q) ||
          x.summary.toLowerCase().includes(q)
        ) {
          return true;
        }

        const matchOldMapping = (x.oldMappings || []).some(
          (m) =>
            m.act.toLowerCase().includes(q) ||
            m.summary.toLowerCase().includes(q) ||
            m.change.toLowerCase().includes(q)
        );
        if (matchOldMapping) return true;

        const matchCompItem = (x.compItems || []).some((c) =>
          (c.task || "").toLowerCase().includes(q)
        );
        if (matchCompItem) return true;

        return false;
      }

      return true;
    });
  }, [provisions, activeCode, filters, searchQuery]);

  const value = useMemo(() => ({
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    resetFilters,
    filteredProvisions,
  }), [searchQuery, filters, setFilter, resetFilters, filteredProvisions]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within FilterProvider");
  return ctx;
}
