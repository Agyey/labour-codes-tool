import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import ReadingViewClient from "./ReadingViewClient";
import { LegalDocument } from "@prisma/client";

// Mock child components that rely on heavy logic or external context
vi.mock("@/components/reading-view/ProvisionTree", () => ({
  default: () => <div data-testid="provision-tree">Mock ProvisionTree</div>,
}));

vi.mock("@/components/reading-view/ProvisionContent", () => ({
  default: () => <div data-testid="provision-content">Mock ProvisionContent</div>,
}));

vi.mock("@/components/reading-view/PointInTimeSlider", () => ({
  default: () => <div data-testid="pit-slider">Mock Slider</div>,
}));

vi.mock("@/components/reading-view/JurisdictionSelector", () => ({
  JurisdictionSelector: () => <div data-testid="jurisdiction-selector">Mock Selector</div>,
}));

vi.mock("@/components/reading-view/StateOverlayBanner", () => ({
  StateOverlayBanner: () => null,
}));

// Mock action
vi.mock("@/app/actions/reading", () => ({
  getUnitDetails: vi.fn(),
}));

describe("ReadingViewClient", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockDocument: LegalDocument = {
    id: "doc-123",
    title: "Test Labor Act",
    short_title: "TLA",
    year: 2024,
    jurisdiction: "Central",
    primary_state: null,
    appropriate_govt: "Central Government",
    doc_type: "Act",
    is_connector_act: false,
    auto_apply_amendments: true,
    full_text: "Full text payload...",
    summary: "Summary payload...",
    source_url: null,
    source_doc_id: null,
    processing_job_id: null,
    status: "active",
    uploaded_at: new Date(),
    analyzed_at: new Date(),
  };

  it("renders the document title and jurisdiction correctly", () => {
    render(<ReadingViewClient document={mockDocument} initialTreeNodes={[]} />);

    expect(screen.getByText("Test Labor Act")).toBeDefined();
    expect(screen.getByText("Central • Act")).toBeDefined();
  });

  it("falls back to primary_state when jurisdiction is missing but state is provided", () => {
    const stateDoc = {
      ...mockDocument,
      jurisdiction: "", // Simulating empty string for fallback test
      primary_state: "Maharashtra",
    };

    render(<ReadingViewClient document={stateDoc} initialTreeNodes={[]} />);
    expect(screen.getByText("Maharashtra • Act")).toBeDefined();
  });

  it("handles missing title gracefully without crashing", () => {
    // Explicit null/empty check test for robustness
    const missingTitleDoc = {
      ...mockDocument,
      title: "", // It's required in Prisma but could be empty string
      jurisdiction: "",
      primary_state: null,
      doc_type: "",
    };

    render(<ReadingViewClient document={missingTitleDoc} initialTreeNodes={[]} />);
    // Should fallback to Central • Act via hardcoded || operators
    expect(screen.getByText("Central • Act")).toBeDefined();
  });
});
