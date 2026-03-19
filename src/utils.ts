/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
export const ST = ["Centre", "Delhi", "Karnataka", "Maharashtra", "Tamil Nadu", "Telangana"];

/* ========== BLANK PROVISION ========== */
export function blankProv(code) {
    return {
        id: code + "-" + Date.now(), code: code, ch: "", chName: "", sec: "", sub: "", title: "",
        ruleAuth: "Appropriate Government", summary: "", fullText: "",
        oldMappings: [],
        impact: "Medium", changeTags: [], workflowTags: [],
        compItems: [],
        draftRules: [], repealedRules: [], forms: [],
        stateNotes: Object.fromEntries(ST.map(function (s) { return [s, ""]; })),
        stateRuleText: Object.fromEntries(ST.map(function (s) { return [s, ""]; })),
        stateCompStatus: Object.fromEntries(ST.map(function (s) { return [s, "Not Started"]; })),
        penaltyOld: "", penaltyNew: "",
        timelineDates: [],
        notes: "", verified: false, pinned: false, assignee: "", dueDate: ""
    };
}
