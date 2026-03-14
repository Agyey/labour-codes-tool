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
  subSec?: string;
  targetSubSec?: string;
  summary: string;
  fullText: string;
  change: string;
  changeTags: string[];
  linkedProvisionId?: string; // Relational link to another provision
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

export interface SubSection {
  marker: string;    // "(1)", "(2)(a)", "Proviso", "Explanation"
  text: string;
}

export type ProvisionType = 'section' | 'rule' | 'form' | 'register';

export interface ProvisionRelation {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: 'IMPLEMENTS' | 'PRESCRIBES' | 'REPLACES' | 'REFERENCES';
  notes?: string;
}

export interface Legislation {
  id: string;
  frameworkId: string;
  name: string;
  shortName: string;
  type: string;
  isRepealed: boolean;
  year?: number | null;
  color?: string | null;
}

export interface Framework {
  id: string;
  name: string;
  shortName: string;
  description?: string | null;
  legislations?: Legislation[];
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
  frameworkId?: string;
  legislationId?: string;
  ch: string;
  chName: string;
  sec: string;
  sub: string;
  title: string;
  provisionType: ProvisionType;
  parentSection?: string;
  subSections: SubSection[];
  linkedRuleRefs: string[];
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
  stateAmendments: Record<string, string>;
  stateInsertions: Record<string, string>;
  stateCompStatus: Record<string, ComplianceStatus>;
  applicability?: string;
  penaltyOld: string;
  penaltyNew: string;
  penalties: string[];
  timelineDates: TimelineDate[];
  notes: string;
  verified: boolean;
  pinned: boolean;
  assignee: string;
  dueDate: string;
  comments?: Comment[];
  connectors?: ProvisionRelation[];
}

export interface ChapterGroup {
  name: string;
  items: Provision[];
}
