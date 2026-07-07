import { create } from "zustand";
import { devtools } from "zustand/middleware";
import ApiService from "../services/api";

export const useAppStore = create(
  devtools(
    (set, get) => ({
      sidebarOpen: true,
      settingsModalOpen: false,
      logDetailsModalOpen: false,
      selectedLog: null,
      theme: "light",
      loading: false,
      error: null,
      wsConnected: false,
      wsReconnecting: false,

      notificationSettings: {
        enabled: true,
        newRequestNotifications: true,
        errorNotifications: true,
        warningNotifications: true,
        soundEnabled: false,
        errorThreshold: 5,
        latencyThreshold: 5000,
        costThreshold: 1.0,
      },

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
        tokenUsage: { total: 0, prompt: 0, completion: 0 },
      },

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

      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),

      setStats: (stats) => set({ stats }),

      fetchStats: async () => {
        try {
          set({ loading: true });
          const response = await ApiService.get("/analytics/stats");

          let overview = {};
          if (response.success && response.data && response.data.overview) {
            overview = response.data.overview;
          } else if (response.overview) {
            overview = response.overview;
          } else {
            overview = response;
          }

          let mostActiveUser = "N/A";
          let mostActiveUserPercentage = 0;

          try {
            const logsResponse = await ApiService.get("/logs?limit=1000");
            if (logsResponse.success && logsResponse.data && logsResponse.data.logs) {
              const logs = logsResponse.data.logs;
              const userCounts = {};
              const totalRequests = logs.length;
              logs.forEach((log) => {
                const userId = log.userId || log.user || "Anonymous";
                userCounts[userId] = (userCounts[userId] || 0) + 1;
              });

              let maxCount = 0;
              Object.entries(userCounts).forEach(([userId, count]) => {
                if (count > maxCount) { maxCount = count; mostActiveUser = userId; }
              });

              if (totalRequests > 0 && maxCount > 0) {
                mostActiveUserPercentage = Math.round((maxCount / totalRequests) * 100);
              }
            }
          } catch (userError) {
            console.warn("Could not fetch user statistics:", userError);
          }

          set({
            stats: {
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
              retryRate: overview.retryRate || 0,
              retryRateChange: 0,
              errorCount24h: overview.errorRequests || 0,
              errorCountChange: 0,
              mostActiveUser,
              mostActiveUserPercentage,
              tokenUsage: {
                total: overview.totalTokens || 0,
                prompt: overview.promptTokens || 0,
                completion: overview.completionTokens || 0,
              },
            },
          });
        } catch (error) {
          console.error("Failed to fetch stats:", error);
          set({ error: error.message });
        } finally {
          set({ loading: false });
        }
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: "app-store" }
  )
);
