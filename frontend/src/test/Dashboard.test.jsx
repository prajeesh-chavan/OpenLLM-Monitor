import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import { useAppStore, useLogsStore } from "../store";

// Mock the store
vi.mock("../store", () => ({
  useAppStore: vi.fn(),
  useLogsStore: vi.fn(),
}));

// Mock the components
vi.mock("../components/StatCards", () => ({
  default: () => <div data-testid="stat-cards">StatCards Component</div>,
}));

vi.mock("../components/DashboardCharts", () => ({
  default: () => (
    <div data-testid="dashboard-charts">DashboardCharts Component</div>
  ),
}));

vi.mock("../components/LogTable", () => ({
  default: () => <div data-testid="log-table">LogTable Component</div>,
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe("Dashboard", () => {
  const mockStore = {
    stats: {
      totalRequests: 100,
      avgResponseTime: 1500,
      totalCost: 2.5,
      activeProviders: 3,
      successRate: 95.5,
      errorRate: 4.5,
    },
    loading: false,
    error: null,
    fetchStats: vi.fn(),
  };

  const mockLogsStore = {
    logs: [
      {
        _id: "1",
        provider: "openai",
        model: "gpt-3.5-turbo",
        status: "success",
        createdAt: new Date().toISOString(),
      },
    ],
    loading: false,
    error: null,
    fetchLogs: vi.fn(),
  };

  beforeEach(() => {
    useAppStore.mockReturnValue(mockStore);
    useLogsStore.mockReturnValue(mockLogsStore);
  });
  it("should render dashboard title", () => {
    renderDashboard();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Monitor your LLM API usage and performance in real-time"
      )
    ).toBeInTheDocument();
  });
  it("should render all dashboard components", () => {
    renderDashboard();
    expect(screen.getByTestId("stat-cards")).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });

  it("should fetch stats on mount", () => {
    renderDashboard();
    expect(mockStore.fetchStats).toHaveBeenCalled();
  });
  it("should show no activity message when no logs", () => {
    useLogsStore.mockReturnValue({
      logs: [], // Explicitly set empty logs array
    });

    renderDashboard();
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    expect(
      screen.getByText("Start making LLM requests to see activity here")
    ).toBeInTheDocument();
  });

  it("should show logs when available", () => {
    useLogsStore.mockReturnValue({
      logs: [
        {
          id: "1",
          provider: "openai",
          model: "gpt-3.5-turbo",
          timestamp: "2023-01-01T00:00:00Z",
          status: "success",
          duration: 1000,
          tokenUsage: { total: 100 },
        },
      ],
    });

    renderDashboard();
    expect(screen.getByText("openai • gpt-3.5-turbo")).toBeInTheDocument();
  });
});
