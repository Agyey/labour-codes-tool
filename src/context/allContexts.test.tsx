import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DataProvider } from "./DataContext";
import { UIProvider } from "./UIContext";
import { AppProvider } from "./AppContext";
import { FilterProvider } from "./FilterContext";
import { LegalOSProvider } from "./LegalOSContext";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn().mockReturnValue({ data: { user: { id: "test", role: "admin" } } }),
}));

vi.mock("@/app/actions/provisions", () => ({
  getProvisions: vi.fn().mockResolvedValue([]),
  getFrameworks: vi.fn().mockResolvedValue([]),
  getLegislations: vi.fn().mockResolvedValue([]),
  updateProvision: vi.fn().mockResolvedValue({ success: true }),
  deleteProvision: vi.fn().mockResolvedValue({ success: true }),
  deleteProvisions: vi.fn().mockResolvedValue({ success: true }),
  togglePin: vi.fn().mockResolvedValue({ success: true }),
  toggleVerify: vi.fn().mockResolvedValue({ success: true }),
  createFramework: vi.fn().mockResolvedValue({ success: true }),
  updateFramework: vi.fn().mockResolvedValue({ success: true }),
  deleteFramework: vi.fn().mockResolvedValue({ success: true }),
  createLegislation: vi.fn().mockResolvedValue({ success: true }),
  deleteLegislation: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/app/actions/users", () => ({
  getUsers: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return { ...actual, loadStorage: vi.fn(), saveStorage: vi.fn() };
});

describe("Mounts all contexts", () => {
  it("renders DataProvider", async () => {
    await act(async () => {
      render(
        <UIProvider>
          <DataProvider>
            <div data-testid="child">Loaded</div>
          </DataProvider>
        </UIProvider>
      );
    });
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders FilterProvider", async () => {
    await act(async () => {
      render(
        <UIProvider>
          <DataProvider>
            <FilterProvider>
              <div data-testid="child">Loaded</div>
            </FilterProvider>
          </DataProvider>
        </UIProvider>
      );
    });
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
  
  it("renders LegalOSProvider", async () => {
    await act(async () => {
      render(
        <UIProvider>
          <DataProvider>
            <LegalOSProvider>
              <div data-testid="child">Loaded</div>
            </LegalOSProvider>
          </DataProvider>
        </UIProvider>
      );
    });
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders AppProvider", async () => {
    render(
      <AppProvider>
        <div data-testid="child">Loaded</div>
      </AppProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
