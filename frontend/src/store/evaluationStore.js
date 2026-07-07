import { create } from "zustand";
import { devtools } from "zustand/middleware";
import EvaluationApiService from "../services/evaluationApi";

export const useEvaluationStore = create(
  devtools(
    (set, get) => ({
      evaluations: [],
      currentEvaluation: null,
      stats: null,
      trends: [],
      evaluatorTypes: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 50,
        totalCount: 0,
        totalPages: 0,
      },

      filters: {
        type: null,
        logId: null,
        minScore: null,
        maxScore: null,
      },

      setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
      clearFilters: () => set({ filters: { type: null, logId: null, minScore: null, maxScore: null } }),

      fetchEvaluations: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const response = await EvaluationApiService.getEvaluations(params);
          set({
            evaluations: response.data?.evaluations || [],
            pagination: response.pagination || get().pagination,
            loading: false,
          });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      fetchEvaluationById: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await EvaluationApiService.getEvaluationById(id);
          set({ currentEvaluation: response.data?.evaluation || null, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      fetchStats: async (params = {}) => {
        try {
          const response = await EvaluationApiService.getEvaluationStats(params);
          set({ stats: response.data });
        } catch (error) {
          console.error("Failed to fetch evaluation stats:", error);
        }
      },

      fetchTrends: async (params = {}) => {
        try {
          const response = await EvaluationApiService.getEvaluationTrends(params);
          set({ trends: response.data?.trends || [] });
        } catch (error) {
          console.error("Failed to fetch evaluation trends:", error);
        }
      },

      fetchEvaluatorTypes: async () => {
        try {
          const response = await EvaluationApiService.getEvaluatorTypes();
          set({ evaluatorTypes: response.data?.types || [] });
        } catch (error) {
          console.error("Failed to fetch evaluator types:", error);
        }
      },

      runEvaluation: async (logId, types = null) => {
        set({ loading: true, error: null });
        try {
          const response = await EvaluationApiService.runEvaluation(logId, types);
          set({ loading: false });
          return response.data?.evaluations || [];
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      runBatchEvaluation: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await EvaluationApiService.runBatchEvaluation(data);
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteEvaluation: async (id) => {
        try {
          await EvaluationApiService.deleteEvaluation(id);
          set((state) => ({
            evaluations: state.evaluations.filter((e) => e._id !== id),
          }));
        } catch (error) {
          set({ error: error.message });
        }
      },

      clearCurrent: () => set({ currentEvaluation: null }),
      clearError: () => set({ error: null }),
    }),
    { name: "evaluation-store" }
  )
);
