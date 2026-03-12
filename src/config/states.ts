import { CodeKey } from "@/types/code";

// Tracked states/jurisdictions
export const STATES = [
  "Centre",
  "Delhi",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
] as const;

export type TrackedState = (typeof STATES)[number];

// State-wise rule status (Draft / Final / Not Published)
export const STATE_RULE_STATUS: Record<
  TrackedState,
  Record<CodeKey, string>
> = {
  Centre: { CoW: "Draft", IRC: "Draft", CoSS: "Draft", OSHW: "Draft" },
  Delhi: { CoW: "Final", IRC: "Draft", CoSS: "Final", OSHW: "Draft" },
  Karnataka: { CoW: "Final", IRC: "Final", CoSS: "Draft", OSHW: "Draft" },
  Maharashtra: { CoW: "Final", IRC: "Final", CoSS: "Final", OSHW: "Final" },
  "Tamil Nadu": {
    CoW: "Draft",
    IRC: "Draft",
    CoSS: "Not Published",
    OSHW: "Draft",
  },
  Telangana: { CoW: "Draft", IRC: "Draft", CoSS: "Draft", OSHW: "Draft" },
};
