import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStatsStore } from "../store";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("../services/api", () => ({
  default: {
    get: mockGet,
  },
}));

import ApiService from "../services/api";

describe("useStatsStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should have initial state", () => {
    const { result } = renderHook(() => useStatsStore());

    expect(result.current.stats).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.timeframe).toBe(24);
  });

  it("should fetch stats successfully", async () => {
    const mockStatsData = {
      success: true,
      data: {
        overview: { totalRequests: 100 },
        providerStats: [],
        costAnalysis: [],
      },
    };

    const mockUsageData = {
      success: true,
      data: {
        recentActivity: [],
        hourlyStats: [],
        requestVolume: [],
      },
    };

    const mockPerformanceData = {
      success: true,
      data: {
        responseTime: [],
        errorRate: [],
      },
    };

    const mockCostsData = {
      success: true,
      data: {
        costAnalysis: [],
      },
    };

    ApiService.get
      .mockResolvedValueOnce(mockStatsData)
      .mockResolvedValueOnce(mockUsageData)
      .mockResolvedValueOnce(mockPerformanceData)
      .mockResolvedValueOnce(mockCostsData);

    const { result } = renderHook(() => useStatsStore());

    await act(async () => {
      await result.current.fetchStats();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.stats).toEqual({
      ...mockStatsData.data,
      requestVolume: [],
      responseTime: [],
      providerDistribution: [],
      statusDistribution: [
        { status: "success", count: 0 },
        { status: "error", count: 0 },
      ],
      tokenUsage: [],
      costAnalysis: [],
      modelPerformance: [],
      errorRate: [],
    });
    expect(result.current.overview).toEqual(mockStatsData.data.overview);
  });

  it("should handle fetch stats error", async () => {
    const errorMessage = "Network error";
    ApiService.get.mockReturnValue(Promise.reject(new Error(errorMessage)));

    const { result } = renderHook(() => useStatsStore());

    await act(async () => {
      await result.current.fetchStats();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it("should set timeframe", () => {
    const { result } = renderHook(() => useStatsStore());

    act(() => {
      result.current.setTimeframe(48);
    });

    expect(result.current.timeframe).toBe(48);
  });

  it("should clear error", () => {
    const { result } = renderHook(() => useStatsStore());

    // Set an error first
    act(() => {
      result.current.setError("Test error");
    });

    expect(result.current.error).toBe("Test error");

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });
});
