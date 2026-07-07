import { create } from "zustand";
import { devtools } from "zustand/middleware";
import ApiService from "../services/api";

export const useStatsStore = create(
  devtools(
    (set, get) => ({
      stats: {},
      overview: null,
      providerStats: [],
      costAnalysis: [],
      recentActivity: [],
      hourlyStats: [],
      requestVolume: [],
      responseTime: [],
      errorRate: [],
      modelComparison: [],
      errorAnalysis: null,
      timeframe: 24,
      loading: false,
      error: null,

      setTimeframe: (timeframe) => set({ timeframe }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      fetchStats: async (timeframe) => {
        const currentTimeframe = timeframe || get().timeframe;
        set({ loading: true, error: null });

        try {
          const statsResponse = await ApiService.get("/analytics/stats");

          let usageResponse = null;
          try {
            usageResponse = await ApiService.get("/analytics/usage", {
              params: { timeframe: currentTimeframe },
            });
          } catch (err) {
            console.warn("Usage endpoint failed:", err.message);
          }

          let performanceResponse = null;
          try {
            performanceResponse = await ApiService.get("/analytics/performance", {
              params: { timeframe: currentTimeframe },
            });
          } catch (err) {
            console.warn("Performance endpoint failed:", err.message);
          }

          const transformedRequestVolume = (usageResponse?.data?.hourlyStats || []).map((item) => ({
            timestamp: item.createdAt || new Date().toISOString(),
            requests: item.requests || 0,
            errors: item.errors || 0,
          }));

          const transformedResponseTime = (performanceResponse?.data?.latencyDistribution || []).map((item) => ({
            timestamp: item.model || "Unknown",
            duration: item.avgDuration || 0,
            model: item.model || "Unknown",
          }));

          const transformedProviderDistribution = (statsResponse.data?.providerStats || []).map((provider) => ({
            name: provider || "Unknown",
            value: 1,
          }));

          const transformedStatusDistribution = [
            { status: "success", count: statsResponse.data?.overview?.successfulRequests || 0 },
            { status: "error", count: statsResponse.data?.overview?.errorRequests || 0 },
          ];

          const transformedTokenUsage = (usageResponse?.data?.hourlyStats || []).map((item) => ({
            timestamp: item.createdAt || new Date().toISOString(),
            inputTokens: item.promptTokens || 0,
            outputTokens: item.completionTokens || 0,
          }));

          const transformedCostAnalysis = (usageResponse?.data?.hourlyStats || []).map((item) => ({
            timestamp: item.createdAt || new Date().toISOString(),
            cost: item.totalCost || 0,
          }));

          const transformedModelPerformance = (performanceResponse?.data?.latencyDistribution || []).map((item) => ({
            model: item.model || "Unknown",
            avgDuration: item.avgDuration || 0,
            successRate: item.successRate || 0,
            requestCount: item.requestCount || 0,
          }));

          let overview = {};
          if (statsResponse.success && statsResponse.data && statsResponse.data.overview) {
            overview = statsResponse.data.overview;
          } else if (statsResponse.overview) {
            overview = statsResponse.overview;
          }

          set({
            stats: {
              ...statsResponse.data,
              requestVolume: transformedRequestVolume,
              responseTime: transformedResponseTime,
              providerDistribution: transformedProviderDistribution,
              statusDistribution: transformedStatusDistribution,
              tokenUsage: transformedTokenUsage,
              costAnalysis: transformedCostAnalysis,
              modelPerformance: transformedModelPerformance,
              errorRate: [],
            },
            overview,
            providerStats: statsResponse.data?.providerStats || [],
            costAnalysis: transformedCostAnalysis,
            recentActivity: [],
            hourlyStats: usageResponse?.data?.hourlyStats || [],
            requestVolume: transformedRequestVolume,
            responseTime: transformedResponseTime,
            errorRate: [],
            modelComparison: transformedModelPerformance,
            timeframe: currentTimeframe,
            loading: false,
          });
        } catch (error) {
          console.error("Failed to fetch stats:", error);
          set({ error: error.message, loading: false });
        }
      },

      fetchModelComparison: async (timeframe) => {
        const currentTimeframe = timeframe || get().timeframe;
        try {
          const response = await ApiService.get("/analytics/providers", {
            params: { timeframe: currentTimeframe },
          });
          set({ modelComparison: response.data.models || [] });
        } catch (error) {
          console.error("Error fetching model comparison:", error);
        }
      },

      fetchErrorAnalysis: async (timeframe) => {
        const currentTimeframe = timeframe || get().timeframe;
        try {
          const response = await ApiService.get("/analytics/errors", {
            params: { timeframe: currentTimeframe },
          });
          set({ errorAnalysis: response.data });
        } catch (error) {
          console.error("Error fetching error analysis:", error);
        }
      },
    }),
    { name: "stats-store" }
  )
);
