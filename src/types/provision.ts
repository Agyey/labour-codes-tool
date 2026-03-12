export interface User {
  id: string;
  name: string | null;
  email?: string | null;
  image: string | null;
  role: string | null;
}

export interface Comment {
  id: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  user: User;
}

export interface OldMapping {
  act: string;
  sec: string;
  summary: string;
  fullText: string;
  change: string;
  changeTags: string[];
}

export interface ComplianceItem {
  task: string;
  assignee: string;
  due: string;
}

export interface DraftRule {
  ref: string;
  summary: string;
}

export interface FormRegister {
  ref: string;
  summary: string;
}

export interface TimelineDate {
  date: string;
  label: string;
}

export type Impact = "Critical" | "High" | "Medium" | "Low";
export type ComplianceStatus = "Not Started" | "In Progress" | "Compliant" | "N/A";
export type RuleAuthority =
  | "Central Government"
  | "State Government"
  | "Appropriate Government"
  | "Central & State Government"
  | "Not Applicable";

export interface Provision {
  id: string;
  code: string;
  ch: string;
  chName: string;
  sec: string;
  sub: string;
  title: string;
  ruleAuth: RuleAuthority;
  summary: string;
  fullText: string;
  oldMappings: OldMapping[];
  impact: Impact;
  changeTags: string[];
  workflowTags: string[];
  compItems: ComplianceItem[];
  draftRules: DraftRule[];
  repealedRules: DraftRule[];
  forms: FormRegister[];
  stateNotes: Record<string, string>;
  stateRuleText: Record<string, string>;
  stateCompStatus: Record<string, ComplianceStatus>;
  penaltyOld: string;
  penaltyNew: string;
  timelineDates: TimelineDate[];
  notes: string;
  verified: boolean;
  pinned: boolean;
  assignee: string;
  dueDate: string;
  comments?: Comment[];
}

export interface ChapterGroup {
  name: string;
  items: Provision[];
}
