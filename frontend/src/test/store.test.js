import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStatsStore } from "../store";

// Mock API service
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

import ApiService from "../services/api";

describe("useStatsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      data: {
        overview: { totalRequests: 100 },
        providerStats: [],
        costAnalysis: [],
      },
    };

    const mockUsageData = {
      data: {
        recentActivity: [],
        hourlyStats: [],
        requestVolume: [],
      },
    };

    const mockPerformanceData = {
      data: {
        responseTime: [],
        errorRate: [],
      },
    };

    const mockCostsData = {
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
    expect(result.current.stats).toEqual(mockStatsData.data);
    expect(result.current.overview).toEqual(mockStatsData.data.overview);
  });

  it("should handle fetch stats error", async () => {
    const errorMessage = "Network error";
    ApiService.get.mockRejectedValue(new Error(errorMessage));

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
