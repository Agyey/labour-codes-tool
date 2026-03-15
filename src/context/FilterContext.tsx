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
