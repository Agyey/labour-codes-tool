// Change tags — types of changes between old and new provisions
export const CHANGE_TAGS = [
  "Applicability changed",
  "Definition changed",
  "Threshold changed",
  "Penalty changed",
  "New provision",
  "Provision removed",
  "Procedure changed",
  "Authority changed",
  "Timeline changed",
  "Coverage expanded",
  "Coverage narrowed",
  "Form/register changed",
] as const;

// Workflow tags — internal tracking labels
export const WORKFLOW_TAGS = [
  "Verified",
  "State variation exists",
  "Rules pending",
  "Financially material",
  "Urgent action needed",
  "For discussion",
] as const;

// Impact severity levels
export const IMPACT_LEVELS = ["Critical", "High", "Medium", "Low"] as const;

// Compliance statuses
export const COMPLIANCE_STATUSES = [
  "Not Started",
  "In Progress",
  "Compliant",
  "N/A",
] as const;

// Rule-making authorities
export const RULE_AUTHORITIES = [
  "Central Government",
  "State Government",
  "Appropriate Government",
  "Central & State Government",
  "Not Applicable",
] as const;

// Color maps
export const IMPACT_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#ca8a04",
  Low: "#16a34a",
};

export const CHANGE_TAG_COLORS: Record<string, string> = {
  "Applicability changed": "#3b82f6",
  "Definition changed": "#8b5cf6",
  "Threshold changed": "#f59e0b",
  "Penalty changed": "#ef4444",
  "New provision": "#10b981",
  "Provision removed": "#6b7280",
  "Procedure changed": "#06b6d4",
  "Authority changed": "#ec4899",
  "Timeline changed": "#f97316",
  "Coverage expanded": "#22c55e",
  "Coverage narrowed": "#dc2626",
  "Form/register changed": "#a855f7",
};

export const WORKFLOW_TAG_COLORS: Record<string, string> = {
  Verified: "#059669",
  "State variation exists": "#7c3aed",
  "Rules pending": "#f59e0b",
  "Financially material": "#dc2626",
  "Urgent action needed": "#ef4444",
  "For discussion": "#3b82f6",
};
