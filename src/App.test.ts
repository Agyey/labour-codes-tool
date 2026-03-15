import { test, expect, spyOn } from "bun:test";
import { blankProv, ST } from "./utils";

test("blankProv creates a provision with expected structure", () => {
    // Mock Date.now to have a deterministic id
    const mockNow = 1700000000000;
    spyOn(Date, "now").mockReturnValue(mockNow);

    const code = "CoW";
    const result = blankProv(code);

    expect(result.id).toBe(`${code}-${mockNow}`);
    expect(result.code).toBe(code);
    expect(result.ch).toBe("");
    expect(result.chName).toBe("");
    expect(result.sec).toBe("");
    expect(result.sub).toBe("");
    expect(result.title).toBe("");
    expect(result.ruleAuth).toBe("Appropriate Government");
    expect(result.summary).toBe("");
    expect(result.fullText).toBe("");
    expect(result.oldMappings).toEqual([]);
    expect(result.impact).toBe("Medium");
    expect(result.changeTags).toEqual([]);
    expect(result.workflowTags).toEqual([]);
    expect(result.compItems).toEqual([]);
    expect(result.draftRules).toEqual([]);
    expect(result.repealedRules).toEqual([]);
    expect(result.forms).toEqual([]);

    // Check state-wise objects
    for (const state of ST) {
        expect(result.stateNotes[state]).toBe("");
        expect(result.stateRuleText[state]).toBe("");
        expect(result.stateCompStatus[state]).toBe("Not Started");
    }

    expect(Object.keys(result.stateNotes)).toHaveLength(ST.length);
    expect(Object.keys(result.stateRuleText)).toHaveLength(ST.length);
    expect(Object.keys(result.stateCompStatus)).toHaveLength(ST.length);

    expect(result.penaltyOld).toBe("");
    expect(result.penaltyNew).toBe("");
    expect(result.timelineDates).toEqual([]);
    expect(result.notes).toBe("");
    expect(result.verified).toBe(false);
    expect(result.pinned).toBe(false);
    expect(result.assignee).toBe("");
    expect(result.dueDate).toBe("");
});
