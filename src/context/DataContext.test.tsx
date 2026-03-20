/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataProvider, useData } from "./DataContext";
import { useSession } from "next-auth/react";
import { useUI } from "@/context/UIContext";
import * as readActions from "@/app/actions/provisions/read";
import * as writeActions from "@/app/actions/provisions/write";
import * as toggleActions from "@/app/actions/provisions/toggle";
import * as frameworkActions from "@/app/actions/frameworks";
import * as userActions from "@/app/actions/users";


// Mock dependencies
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("@/context/UIContext", () => ({
  useUI: vi.fn(),
}));

vi.mock("@/app/actions/provisions/read", () => ({
  getProvisions: vi.fn(),
}));

vi.mock("@/app/actions/provisions/write", () => ({
  updateProvision: vi.fn(),
  injectSampleData: vi.fn(),
}));

vi.mock("@/app/actions/provisions/toggle", () => ({
  deleteProvision: vi.fn(),
  deleteProvisions: vi.fn(),
  togglePin: vi.fn(),
  toggleVerify: vi.fn(),
}));

vi.mock("@/app/actions/frameworks", () => ({
  getFrameworks: vi.fn(),
  getLegislations: vi.fn(),
  createFramework: vi.fn(),
  updateFramework: vi.fn(),
  deleteFramework: vi.fn(),
  createLegislation: vi.fn(),
  deleteLegislation: vi.fn(),
}));

vi.mock("@/app/actions/users", () => ({
  getUsers: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    promise: vi.fn((p) => p),
  },
}));

// Test component to consume context
const TestComponent = () => {
  const { provisions, loading, saveProvision } = useData();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="count">{provisions.length}</div>
      <button onClick={() => saveProvision({ id: "1" } as any)}>Save</button>
    </div>
  );
};

describe("DataContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSession as any).mockReturnValue({ data: { user: { id: "user1" } } });
    (useUI as any).mockReturnValue({ activeCode: "CoW", mode: "admin", passwordVerified: true });
    (readActions.getProvisions as any).mockResolvedValue([]);
    (frameworkActions.getFrameworks as any).mockResolvedValue([]);
    (frameworkActions.getLegislations as any).mockResolvedValue([]);
    (userActions.getUsers as any).mockResolvedValue([]);
  });

  it("should load data on mount", async () => {
    const mockProvs = [{ id: "p1", code: "CoW" }];
    (readActions.getProvisions as any).mockResolvedValue(mockProvs);

    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    expect(readActions.getProvisions).toHaveBeenCalled();
  });

  it("should handle saveProvision", async () => {
    (readActions.getProvisions as any).mockResolvedValue([]);
    (writeActions.updateProvision as any).mockResolvedValue({ success: true });

    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());

    const saveButton = screen.getByText("Save");
    saveButton.click();

    await waitFor(() => {
      expect(writeActions.updateProvision).toHaveBeenCalled();
    });
  });
});
