import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, loadStorage, saveStorage, createBlankProvision, createBlankOldMapping, formatSection, calculateStats } from "./utils";

describe("utils", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("cn merges class names", () => {
    expect(cn("bg-red-500", "px-2", { "text-white": true })).toBe("bg-red-500 px-2 text-white");
  });

  it("loadStorage returns parsed JSON", () => {
    vi.mocked(localStorage.getItem).mockReturnValue('{"key": "value"}');
    expect(loadStorage("test")).toEqual({ key: "value" });
  });

  it("loadStorage returns null on invalid JSON", () => {
    vi.mocked(localStorage.getItem).mockReturnValue("invalid JSON");
    expect(loadStorage("test")).toBeNull();
  });
  
  it("loadStorage returns null on exception", () => {
    vi.mocked(localStorage.getItem).mockImplementation(() => { throw new Error("Storage error") });
    expect(loadStorage("test")).toBeNull();
  });

  it("saveStorage calls setItem", () => {
    saveStorage("test", { key: "value" });
    expect(localStorage.setItem).toHaveBeenCalledWith("test", '{"key":"value"}');
  });

  it("saveStorage handles exception", () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error("Storage error") });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    saveStorage("test", { key: "value" });
    expect(spy).toHaveBeenCalled();
  });

  it("createBlankProvision initializes correctly", () => {
    const p = createBlankProvision("CODE");
    expect(p.code).toBe("CODE");
    expect(p.verified).toBe(false);
  });

  it("createBlankOldMapping initializes correctly", () => {
    const m = createBlankOldMapping();
    expect(m.act).toBe("");
  });

  it("formatSection computes correctly", () => {
    const p = createBlankProvision("CODE");
    p.sec = "10";
    p.sub = "b";
    expect(formatSection(p)).toBe("S.10b");
  });

  it("calculateStats aggregates correctly", () => {
    const p1 = createBlankProvision("CODE");
    p1.id = "p1";
    p1.compItems = [{ id: "1" } as any, { id: "2" } as any];
    p1.verified = true;
    
    const p2 = createBlankProvision("CODE");
    p2.id = "p2";
    p2.compItems = [{ id: "3" } as any];
    p2.pinned = true;

    const statuses = {
      [`${p1.id}-0`]: "Compliant",
      [`${p1.id}-1`]: "In Progress",
      [`${p2.id}-0`]: "N/A",
    };

    const stats = calculateStats([p1, p2], statuses);
    expect(stats.totalProvisions).toBe(2);
    expect(stats.totalCompItems).toBe(3);
    expect(stats.compliant).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.notApplicable).toBe(1);
    expect(stats.notStarted).toBe(0);
    expect(stats.verified).toBe(1);
    expect(stats.pinned).toBe(1);
  });
});
