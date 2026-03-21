import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { DocumentStructureTab } from "./DocumentStructureTab";

describe("DocumentStructureTab", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("handles empty analysis gracefully without rendering crashes", () => {
    render(<DocumentStructureTab analysis={null} />);
    expect(screen.getByText(/Structure data not available/i)).toBeDefined();
  });

  it("handles properly structured chapters correctly", () => {
    const mockAnalysis = {
      structured_data: {
        chapters: [
          {
            chapter_number: "I",
            chapter_name: "Preliminary",
            summary: "Test summary",
            sections: [
              { section_number: "1", title: "Short Title", summary: "Title sum" }
            ]
          }
        ]
      }
    };
    render(<DocumentStructureTab analysis={mockAnalysis} />);
    expect(screen.getByText("Preliminary")).toBeDefined();
    expect(screen.getByText("§1")).toBeDefined();
  });

  it("handles missing sections gracefully without breaking iteration", () => {
    const mockAnalysis = {
      structured_data: {
        chapters: [
          {
            chapter_number: "II",
            chapter_name: "Empty Chapter",
            summary: "Test summary",
            // Notice: sections intentionally omitted to enforce ? chaining safety
          }
        ]
      }
    };
    render(<DocumentStructureTab analysis={mockAnalysis} />);
    expect(screen.getByText("Empty Chapter")).toBeDefined();
    expect(screen.getByText("0 sections")).toBeDefined();
  });

  // Adding tests specifically for future prop-injection boundaries ensuring components 
  // don't drop undefined elements unexpectedly according to TDD constraints.
});
