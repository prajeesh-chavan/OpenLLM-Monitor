import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import { useAppStore, useLogsStore } from "../store";

vi.mock("../store", () => ({
  useAppStore: vi.fn(),
  useLogsStore: vi.fn(),
}));

vi.mock("../components/SummaryStatsPanel", () => ({
  default: () => <div data-testid="summary-stats">SummaryStatsPanel</div>,
}));

vi.mock("../components/VisualizationSection", () => ({
  default: () => <div data-testid="visualization-section">VisualizationSection</div>,
}));

vi.mock("../components/LogTable", () => ({
  default: () => <div data-testid="log-table">LogTable Component</div>,
}));

vi.mock("../components/PromptReplayZone", () => ({
  default: () => null,
}));

vi.mock("../components/KeyboardShortcuts", () => ({
  default: () => null,
}));

vi.mock("../components/LiveFeedMode", () => ({
  default: () => null,
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

const mockAppStore = {
  fetchStats: vi.fn(),
  openLogDetailsModal: vi.fn(),
  loading: false,
};
const mockLogsStore = {
  logs: [],
  fetchLogs: vi.fn(),
};

const mockSetTimeout = () => vi.spyOn(globalThis, "setTimeout").mockImplementation((cb) => cb());

describe("Dashboard", () => {
  beforeEach(() => {
    useAppStore.mockReturnValue(mockAppStore);
    useLogsStore.mockReturnValue(mockLogsStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show loading screen initially", () => {
    renderDashboard();
    expect(
      screen.getByText("Initializing your AI monitoring dashboard...")
    ).toBeInTheDocument();
  });

  it("should render dashboard content after loading", async () => {
    mockSetTimeout();
    renderDashboard();
    await act(async () => {});
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByTestId("summary-stats")).toBeInTheDocument();
    expect(screen.getByTestId("log-table")).toBeInTheDocument();
    expect(screen.getByTestId("visualization-section")).toBeInTheDocument();
  });

  it("should fetch stats on mount", () => {
    renderDashboard();
    expect(mockAppStore.fetchStats).toHaveBeenCalled();
  });

  it("should show quick action links", async () => {
    mockSetTimeout();
    renderDashboard();
    await act(async () => {});
    expect(screen.getByText("Test Models")).toBeInTheDocument();
    expect(screen.getAllByText("Replay").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Analytics").length).toBeGreaterThan(0);
    expect(screen.getByText("Providers")).toBeInTheDocument();
  });
});
