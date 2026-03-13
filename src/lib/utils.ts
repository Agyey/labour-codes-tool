import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  Provision,
  OldMapping,
} from "@/types/provision";
import { STATES } from "@/config/states";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** localStorage wrapper with JSON (de)serialization */
export function loadStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage save error:", e);
  }
}

/** Create a blank provision template */
export function createBlankProvision(code: string): Provision {
  return {
    id: `${code}-${Date.now()}`,
    code,
    ch: "",
    chName: "",
    sec: "",
    sub: "",
    title: "",
    provisionType: "section",
    parentSection: undefined,
    subSections: [],
    linkedRuleRefs: [],
    ruleAuth: "Appropriate Government",
    summary: "",
    fullText: "",
    oldMappings: [],
    impact: "Medium",
    changeTags: [],
    workflowTags: [],
    compItems: [],
    draftRules: [],
    repealedRules: [],
    forms: [],
    stateNotes: Object.fromEntries(STATES.map((s) => [s, ""])),
    stateRuleText: Object.fromEntries(STATES.map((s) => [s, ""])),
    stateCompStatus: Object.fromEntries(
      STATES.map((s) => [s, "Not Started" as const])
    ),
    penaltyOld: "",
    penaltyNew: "",
    timelineDates: [],
    notes: "",
    verified: false,
    pinned: false,
    assignee: "",
    dueDate: "",
  };
}

/** Create a blank old-act mapping */
export function createBlankOldMapping(): OldMapping {
  return {
    act: "",
    sec: "",
    summary: "",
    fullText: "",
    change: "",
    changeTags: [],
  };
}

/** Format section reference */
export function formatSection(provision: Provision): string {
  return `S.${provision.sec}${provision.sub}`;
}

/** Calculate compliance stats for a set of provisions */
export function calculateStats(
  provisions: Provision[],
  complianceStatuses: Record<string, string>
) {
  let total = 0,
    compliant = 0,
    inProgress = 0,
    notApplicable = 0;

  provisions.forEach((p) => {
    (p.compItems || []).forEach((_, j) => {
      total++;
      const status = complianceStatuses[`${p.id}-${j}`];
      if (status === "Compliant") compliant++;
      else if (status === "In Progress") inProgress++;
      else if (status === "N/A") notApplicable++;
    });
  });

  return {
    totalProvisions: provisions.length,
    totalCompItems: total,
    compliant,
    inProgress,
    notApplicable,
    notStarted: total - compliant - inProgress - notApplicable,
    verified: provisions.filter((x) => x.verified).length,
    pinned: provisions.filter((x) => x.pinned).length,
  };
}
