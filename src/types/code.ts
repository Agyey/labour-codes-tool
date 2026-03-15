export type CodeKey = "CoW" | "IRC" | "CoSS" | "OSHW";

export interface CodeMetadata {
  n: string;       // Full name
  s: string;       // Short code
  c: string;       // Primary color
  bg: string;      // Background color
  secs: number;    // Number of sections
  chs: number;     // Number of chapters
  assent: string;  // Date of assent
  eff: string;     // Effective date
  dr: string;      // Draft rules date
  ra: string;      // Rule-making authority
  acts: string[];  // Repealed acts
}

export interface StateRuleStatus {
  [state: string]: {
    [code in CodeKey]: string;
  };
}
