import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { StreamingProgress, StreamEvent } from "./StreamingProgress";

describe("StreamingProgress", () => {
  beforeAll(() => {
    // jsdom doesn't implement scrollTo
    window.HTMLElement.prototype.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  const mockEvents: StreamEvent[] = [
    { phase: "init", status: "done", message: "Initialization complete", elapsed: "1s" },
    { phase: "extraction", status: "running", message: "Extracting sections", detail: "Processing page 1..." }
  ];

  it("renders basic connection state when array is empty", () => {
    render(
      <StreamingProgress 
        events={[]} 
        treeData={null} 
        isComplete={false} 
        error={null} 
      />
    );
    expect(screen.getByText(/Connecting to analysis pipeline/i)).toBeDefined();
    expect(screen.getByText("LIVE")).toBeDefined();
  });

  it("renders provided streaming events with boundary checks", () => {
    render(
      <StreamingProgress 
        events={mockEvents} 
        treeData={null} 
        isComplete={false} 
        error={null} 
      />
    );
    expect(screen.getByText("Initialization complete")).toBeDefined();
    expect(screen.getByText("Extracting sections")).toBeDefined();
    expect(screen.getByText("Processing page 1...")).toBeDefined();
  });

  it("renders COMPLETE headers accurately when isComplete overrides LIVE", () => {
    render(
      <StreamingProgress 
        events={mockEvents} 
        treeData={null} 
        isComplete={true} 
        error={null} 
      />
    );
    expect(screen.queryByText("LIVE")).toBeNull();
    expect(screen.getByText("COMPLETE")).toBeDefined();
  });

  it("renders FAILED overlay dynamically bounding errors", () => {
    render(
      <StreamingProgress 
        events={mockEvents} 
        treeData={null} 
        isComplete={false} 
        error="LLM Connection Terminated Unexpectedly" 
      />
    );
    expect(screen.queryByText("LIVE")).toBeNull();
    expect(screen.getByText("FAILED")).toBeDefined();
    expect(screen.getByText("LLM Connection Terminated Unexpectedly")).toBeDefined();
  });
});
