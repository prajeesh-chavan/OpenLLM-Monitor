import { create } from "zustand";
import { devtools } from "zustand/middleware";
import ApiService from "../services/api";

export const useLogsStore = create(
  devtools(
    (set, get) => ({
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
      selectedLogs: new Set(),

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
          currentPage: 1,
        })),

      clearFilters: () =>
        set({
          filters: { provider: "", model: "", status: "", search: "", startDate: "", endDate: "" },
          currentPage: 1,
        }),

      setSorting: (sortBy, sortOrder) =>
        set({ sortBy, sortOrder, currentPage: 1 }),
      setPage: (page) => set({ currentPage: page }),
      setLimit: (limit) => set({ limit, currentPage: 1 }),

      selectLog: (logId) =>
        set((state) => ({ selectedLogs: new Set([...state.selectedLogs, logId]) })),

      deselectLog: (logId) =>
        set((state) => {
          const newSelection = new Set(state.selectedLogs);
          newSelection.delete(logId);
          return { selectedLogs: newSelection };
        }),

      selectAllLogs: () =>
        set((state) => ({ selectedLogs: new Set(state.logs.map((log) => log._id)) })),

      clearSelection: () => set({ selectedLogs: new Set() }),

      toggleLogSelection: (logId) => {
        const { selectedLogs } = get();
        if (selectedLogs.has(logId)) {
          get().deselectLog(logId);
        } else {
          get().selectLog(logId);
        }
      },

      fetchLogs: async () => {
        const { filters, sortBy, sortOrder, currentPage, limit } = get();
        set({ loading: true, error: null });

        try {
          const params = { ...filters, sortBy, sortOrder, page: currentPage, limit };
          Object.keys(params).forEach((key) => {
            if (params[key] === "" || params[key] === null || params[key] === undefined) {
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
      },

      fetchLogById: async (logId) => {
        try {
          set({ loading: true, error: null });
          const response = await ApiService.getLogById(logId);
          set({ loading: false });
          return response.data.log;
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
          await get().fetchLogs();
          set({ selectedLogs: new Set() });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      addNewLog: (log) =>
        set((state) => ({
          logs: [log, ...state.logs].slice(0, state.limit),
          totalCount: state.totalCount + 1,
        })),
    }),
    { name: "logs-store" }
  )
);
