import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StatCards from "../components/StatCards";

const mockStats = {
  totalRequests: 1250,
  requestsChange: 15.3,
  avgResponseTime: 1847,
  responseTimeChange: -8.2,
  totalCost: 45.67,
  costChange: 12.5,
  activeProviders: 4,
  successRate: 96.8,
  successRateChange: 2.1,
  errorRate: 3.2,
  errorRateChange: -1.5,
};

describe("StatCards", () => {
  it("should render all stat cards", () => {
    render(<StatCards stats={mockStats} />);

    expect(screen.getByText("Total Requests")).toBeInTheDocument();
    expect(screen.getByText("Avg Response Time")).toBeInTheDocument();
    expect(screen.getByText("Total Cost")).toBeInTheDocument();
    expect(screen.getByText("Active Providers")).toBeInTheDocument();
  });

  it("should display correct values", () => {
    render(<StatCards stats={mockStats} />);

    expect(screen.getByText("1,250")).toBeInTheDocument();
    expect(screen.getByText("1,847ms")).toBeInTheDocument();
    expect(screen.getByText("$45.67")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("should show positive change indicators", () => {
    render(<StatCards stats={mockStats} />);

    // Should show positive change for total requests
    expect(screen.getByText("+15.3%")).toBeInTheDocument();
    // Should show positive change for total cost
    expect(screen.getByText("+12.5%")).toBeInTheDocument();
  });

  it("should show negative change indicators", () => {
    render(<StatCards stats={mockStats} />);

    // Should show negative change for response time (improvement)
    expect(screen.getByText("-8.2%")).toBeInTheDocument();
  });
  it("should handle zero stats gracefully", () => {
    const zeroStats = {
      totalRequests: 0,
      requestsChange: 0,
      avgResponseTime: 0,
      responseTimeChange: 0,
      totalCost: 0,
      costChange: 0,
      activeProviders: 0,
      successRate: 0,
      successRateChange: 0,
      errorRate: 0,
      errorRateChange: 0,
    };

    render(<StatCards stats={zeroStats} />);

    // Use getAllByText for multiple "0" values
    const zeroElements = screen.getAllByText("0");
    expect(zeroElements.length).toBeGreaterThan(0);
    expect(screen.getByText("0ms")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();

    // Use getAllByText for multiple "0%" values
    const zeroPercentElements = screen.getAllByText("0%");
    expect(zeroPercentElements.length).toBeGreaterThan(0);
  });

  it("should handle undefined stats", () => {
    render(<StatCards stats={{}} />);

    // Should not crash and should show some default values
    expect(screen.getByText("Total Requests")).toBeInTheDocument();
    expect(screen.getByText("Avg Response Time")).toBeInTheDocument();
  });
});
