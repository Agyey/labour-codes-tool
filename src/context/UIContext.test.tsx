import { render, screen, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { UIProvider, useUI } from "./UIContext";

function TestComponent() {
  const ui = useUI();
  return (
    <div>
      <span data-testid="mode">{ui.mode}</span>
      <span data-testid="verified">{ui.passwordVerified ? "yes" : "no"}</span>
      <span data-testid="view">{ui.activeView}</span>
      <button onClick={() => ui.setMode("admin")}>Set Admin</button>
      <button onClick={() => ui.setPasswordVerified(true)}>Verify</button>
      <button onClick={() => ui.setActiveView("mapping")}>Set View</button>
    </div>
  );
}

describe("UIContext", () => {
  it("provides default values", () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );
    expect(screen.getByTestId("mode")).toHaveTextContent("read");
    expect(screen.getByTestId("verified")).toHaveTextContent("no");
    expect(screen.getByTestId("view")).toHaveTextContent("dashboard");
  });

  it("updates values correctly", () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );
    act(() => {
      screen.getByText("Set Admin").click();
      screen.getByText("Verify").click();
      screen.getByText("Set View").click();
    });
    expect(screen.getByTestId("mode")).toHaveTextContent("admin");
    expect(screen.getByTestId("verified")).toHaveTextContent("yes");
    expect(screen.getByTestId("view")).toHaveTextContent("mapping");
  });
});
