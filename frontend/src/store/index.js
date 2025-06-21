import { create } from "zustand";
import { devtools } from "zustand/middleware";
import ApiService from "../services/api";

/**
 * Main application store
 */
export const useAppStore = create(
  devtools(
    (set, get) => ({
      // UI State
      sidebarOpen: true,
      settingsModalOpen: false,
      logDetailsModalOpen: false,
      selectedLog: null,
      theme: "light",
      loading: false,
      error: null, // WebSocket State
      wsConnected: false,
      wsReconnecting: false,

      // Notification Settings
      notificationSettings: {
        enabled: true,
        newRequestNotifications: true,
        errorNotifications: true,
        warningNotifications: true,
        soundEnabled: false,
        errorThreshold: 5, // Show notification after X consecutive errors
        latencyThreshold: 5000, // Show notification if latency > X ms
        costThreshold: 1.0, // Show notification if cost > $X
      }, // Stats State
      stats: {
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
        retryRate: 0,
        retryRateChange: 0,
        errorCount24h: 0,
        errorCountChange: 0,
        mostActiveUser: null,
        mostActiveUserPercentage: 0,
        tokenUsage: {
          total: 0,
          prompt: 0,
          completion: 0,
        },
      }, // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
      setLogDetailsModalOpen: (open) => set({ logDetailsModalOpen: open }),
      setSelectedLog: (log) => set({ selectedLog: log }),
      openLogDetailsModal: (log) =>
        set({ selectedLog: log, logDetailsModalOpen: true }),
      closeLogDetailsModal: () =>
        set({ selectedLog: null, logDetailsModalOpen: false }),
      setTheme: (theme) => set({ theme }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setWsConnected: (connected) => set({ wsConnected: connected }),
      setWsReconnecting: (reconnecting) =>
        set({ wsReconnecting: reconnecting }),

      // Notification Actions
      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),

      setStats: (stats) => set({ stats }), // Fetch stats
      fetchStats: async () => {
        try {
          set({ loading: true });
          const response = await ApiService.get("/analytics/stats");

          // The API service already extracts response.data, so we get the full response object
          // Check if the response has the expected structure
          let overview = {};

          if (response.success && response.data && response.data.overview) {
            overview = response.data.overview;
          } else if (response.overview) {
            overview = response.overview;
          } else {
            console.warn("Unexpected API response structure:", response);
            overview = response; // fallback to treating the whole response as overview
          }

          // Try to get most active user from logs
          let mostActiveUser = "N/A";
          let mostActiveUserPercentage = 0;

          try {
            const logsResponse = await ApiService.get("/logs?limit=1000"); // Get recent logs
            if (
              logsResponse.success &&
              logsResponse.data &&
              logsResponse.data.logs
            ) {
              const logs = logsResponse.data.logs;
              const userCounts = {};
              let totalRequests = logs.length;

              // Count requests per user
              logs.forEach((log) => {
                const userId = log.userId || log.user || "Anonymous";
                userCounts[userId] = (userCounts[userId] || 0) + 1;
              });

              // Find most active user
              let maxCount = 0;
              Object.entries(userCounts).forEach(([userId, count]) => {
                if (count > maxCount) {
                  maxCount = count;
                  mostActiveUser = userId;
                }
              });

              if (totalRequests > 0 && maxCount > 0) {
                mostActiveUserPercentage = Math.round(
                  (maxCount / totalRequests) * 100
                );
              }
            }
          } catch (userError) {
            console.warn("Could not fetch user statistics:", userError);
          }

          const transformedStats = {
            totalRequests: overview.totalRequests || 0,
            requestsChange: 0,
            avgResponseTime: overview.avgDuration || 0,
            responseTimeChange: 0,
            totalCost: overview.totalCost || 0,
            costChange: 0,
            activeProviders: overview.activeProviders || 0,
            successRate: overview.successRate || 0,
            successRateChange: 0,
            errorRate: overview.errorRate || 0,
            errorRateChange: 0,
            // Add missing fields for SummaryStatsPanel
            retryRate: overview.retryRate || 0,
            retryRateChange: 0,
            errorCount24h: overview.errorRequests || 0,
            errorCountChange: 0,
            mostActiveUser,
            mostActiveUserPercentage,
            // Add token usage data
            tokenUsage: {
              total: overview.totalTokens || 0,
              prompt: overview.promptTokens || 0,
              completion: overview.completionTokens || 0,
            },
          };

          set({ stats: transformedStats });
        } catch (error) {
          console.error("Failed to fetch stats:", error);
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      // Toggle sidebar
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: "app-store" }
  )
);

/**
 * Logs store
 */
export const useLogsStore = create(
  devtools(
    (set, get) => ({
      // State
      logs: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      loading: false,
      error: null,
      filters: {
        provider: "",
        model: "",
        status: "",
        search: "",
        startDate: "",
        endDate: "",
      },
      sortBy: "createdAt",
      sortOrder: "desc",
      limit: 50,

      // Selected logs for bulk operations
      selectedLogs: new Set(), // Actions
      setLogs: (logs) => set({ logs }),
      addLog: (newLog) =>
        set((state) => ({
          logs: [newLog, ...state.logs],
          totalCount: state.totalCount + 1,
        })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
          currentPage: 1, // Reset to first page when filters change
        })),

      clearFilters: () =>
        set({
          filters: {
            provider: "",
            model: "",
            status: "",
            search: "",
            startDate: "",
            endDate: "",
          },
          currentPage: 1,
        }),

      setSorting: (sortBy, sortOrder) =>
        set({ sortBy, sortOrder, currentPage: 1 }),
      setPage: (page) => set({ currentPage: page }),
      setLimit: (limit) => set({ limit, currentPage: 1 }),

      // Selection
      selectLog: (logId) =>
        set((state) => ({
          selectedLogs: new Set([...state.selectedLogs, logId]),
        })),

      deselectLog: (logId) =>
        set((state) => {
          const newSelection = new Set(state.selectedLogs);
          newSelection.delete(logId);
          return { selectedLogs: newSelection };
        }),

      selectAllLogs: () =>
        set((state) => ({
          selectedLogs: new Set(state.logs.map((log) => log._id)),
        })),

      clearSelection: () => set({ selectedLogs: new Set() }),

      toggleLogSelection: (logId) => {
        const { selectedLogs } = get();
        if (selectedLogs.has(logId)) {
          get().deselectLog(logId);
        } else {
          get().selectLog(logId);
        }
      },

      // API Actions
      fetchLogs: async () => {
        const { filters, sortBy, sortOrder, currentPage, limit } = get();

        set({ loading: true, error: null });

        try {
          const params = {
            ...filters,
            sortBy,
            sortOrder,
            page: currentPage,
            limit,
          };

          // Remove empty filter values
          Object.keys(params).forEach((key) => {
            if (
              params[key] === "" ||
              params[key] === null ||
              params[key] === undefined
            ) {
              delete params[key];
            }
          });

          const response = await ApiService.getLogs(params);

          set({
            logs: response.data.logs,
            totalCount: response.data.pagination.totalCount,
            totalPages: response.data.pagination.totalPages,
            currentPage: response.data.pagination.currentPage,
            loading: false,
          });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      }, // Fetch single log by ID
      fetchLogById: async (logId) => {
        try {
          set({ loading: true, error: null });
          const response = await ApiService.getLogById(logId);
          set({ loading: false });
          return response.data.log; // Backend returns { success: true, data: { log: {...} } }
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteSelectedLogs: async () => {
        const { selectedLogs } = get();

        if (selectedLogs.size === 0) return;

        set({ loading: true, error: null });

        try {
          await ApiService.deleteLogs({ ids: Array.from(selectedLogs) });

          // Refresh logs and clear selection
          await get().fetchLogs();
          set({ selectedLogs: new Set() });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Add new log (from WebSocket)
      addNewLog: (log) =>
        set((state) => ({
          logs: [log, ...state.logs].slice(0, state.limit),
          totalCount: state.totalCount + 1,
        })),
    }),
    { name: "logs-store" }
  )
);

/**
 * Statistics store
 */
export const useStatsStore = create(
  devtools(
    (set, get) => ({
      // State
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

      // Actions
      setTimeframe: (timeframe) => set({ timeframe }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Fetch statistics
      fetchStats: async (timeframe) => {
        const currentTimeframe = timeframe || get().timeframe;
        set({ loading: true, error: null });

        try {
          // Fetch stats
          const statsResponse = await ApiService.get("/analytics/stats");

          // Fetch usage data
          let usageResponse = null;
          try {
            usageResponse = await ApiService.get("/analytics/usage", {
              params: { timeframe: currentTimeframe },
            });
          } catch (err) {
            console.warn("Usage endpoint failed:", err.message);
          }

          // Fetch performance data
          let performanceResponse = null;
          try {
            performanceResponse = await ApiService.get(
              "/analytics/performance",
              {
                params: { timeframe: currentTimeframe },
              }
            );
          } catch (err) {
            console.warn("Performance endpoint failed:", err.message);
          }

          // Transform data with null checks
          const transformedRequestVolume = (
            usageResponse?.data?.hourlyStats || []
          ).map((item) => ({
            timestamp: item.createdAt || new Date().toISOString(),
            requests: item.requests || 0,
            errors: item.errors || 0,
          }));

          const transformedResponseTime = (
            performanceResponse?.data?.latencyDistribution || []
          ).map((item) => ({
            timestamp: item.model || "Unknown",
            duration: item.avgDuration || 0,
            model: item.model || "Unknown",
          }));

          const transformedProviderDistribution = (
            statsResponse.data?.providerStats || []
          ).map((provider) => ({
            name: provider || "Unknown",
            value: 1,
          }));

          const transformedStatusDistribution = [
            {
              status: "success",
              count: statsResponse.data?.overview?.successfulRequests || 0,
            },
            {
              status: "error",
              count: statsResponse.data?.overview?.errorRequests || 0,
            },
          ];

          const transformedTokenUsage = (
            usageResponse?.data?.hourlyStats || []
          ).map((item) => ({
            timestamp: item.createdAt || new Date().toISOString(),
            inputTokens: item.promptTokens || 0,
            outputTokens: item.completionTokens || 0,
          }));

          const transformedCostAnalysis = (
            usageResponse?.data?.hourlyStats || []
          ).map((item) => ({
            timestamp: item.createdAt || new Date().toISOString(),
            cost: item.totalCost || 0,
          }));

          const transformedModelPerformance = (
            performanceResponse?.data?.latencyDistribution || []
          ).map((item) => ({
            model: item.model || "Unknown",
            avgDuration: item.avgDuration || 0,
            successRate: item.successRate || 0,
            requestCount: item.requestCount || 0,
          }));

          let overview = {};
          if (
            statsResponse.success &&
            statsResponse.data &&
            statsResponse.data.overview
          ) {
            overview = statsResponse.data.overview;
          } else if (statsResponse.overview) {
            overview = statsResponse.overview;
          }

          // Set the data with all proper transformations and null checks
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
            overview: overview,
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
      }, // Fetch model comparison
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

      // Fetch error analysis
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

/**
 * Providers store
 */
export const useProvidersStore = create(
  devtools(
    (set, get) => ({
      // State
      providers: {},
      availableModels: {},
      loading: false,
      error: null,
      testingConnection: null,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setTestingConnection: (provider) => set({ testingConnection: provider }), // Fetch providers
      fetchProviders: async (testConnections = false) => {
        set({ loading: true, error: null });

        try {
          const response = await ApiService.getProviders(testConnections);
          set({ providers: response.data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Update provider
      updateProvider: async (provider, data) => {
        set({ loading: true, error: null });

        try {
          const response = await ApiService.updateProvider(provider, data);

          set((state) => ({
            providers: {
              ...state.providers,
              [provider]: response.data,
            },
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Test connection
      testConnection: async (provider, data = {}) => {
        set({ testingConnection: provider, error: null });

        try {
          const response = await ApiService.testProviderConnection(
            provider,
            data
          );

          // Update provider status
          set((state) => ({
            providers: {
              ...state.providers,
              [provider]: {
                ...state.providers[provider],
                status: response.data.status,
                lastTested: response.data.timestamp,
              },
            },
            testingConnection: null,
          }));

          return response.data;
        } catch (error) {
          set({ error: error.message, testingConnection: null });
          throw error;
        }
      },

      // Fetch available models
      fetchAvailableModels: async (provider = null) => {
        try {
          const response = await ApiService.getAvailableModels(provider);

          if (provider) {
            set((state) => ({
              availableModels: {
                ...state.availableModels,
                [provider]: response.data[provider] || [],
              },
            }));
          } else {
            set({ availableModels: response.data });
          }
        } catch (error) {
          console.error("Error fetching available models:", error);
        }
      },
    }),
    { name: "providers-store" }
  )
);

/**
 * Replay store
 */
export const useReplayStore = create(
  devtools(
    (set, get) => ({
      // State
      replayResults: [],
      currentReplay: null,
      streaming: false,
      streamContent: "",
      loading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setStreaming: (streaming) => set({ streaming }),
      setStreamContent: (content) => set({ streamContent: content }),
      clearStreamContent: () => set({ streamContent: "" }), // Replay prompt
      replayPrompt: async (data) => {
        set({ loading: true, error: null });

        try {
          const response = await ApiService.replayPrompt(data);

          set((state) => ({
            replayResults: [response.data, ...state.replayResults].slice(0, 10), // Keep last 10 results
            currentReplay: response.data,
            loading: false,
          }));

          return response.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Replay request from log
      replayRequest: async (logId, options = {}) => {
        set({ loading: true, error: null });

        try {
          const response = await ApiService.replayFromLog(logId, options);

          set((state) => ({
            replayResults: [response.data, ...state.replayResults].slice(0, 10),
            currentReplay: response.data,
            loading: false,
          }));

          return response.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Compare replays
      compareReplays: async (data) => {
        set({ loading: true, error: null });

        try {
          const response = await ApiService.compareReplays(data);
          set({ currentReplay: response.data, loading: false });
          return response.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Clear results
      clearResults: () =>
        set({
          replayResults: [],
          currentReplay: null,
          streamContent: "",
        }),
    }),
    { name: "replay-store" }
  )
);
