import { create } from "zustand";
import { devtools } from "zustand/middleware";
import ApiService from "../services/api";

export const useReplayStore = create(
  devtools(
    (set, get) => ({
      replayResults: [],
      currentReplay: null,
      streaming: false,
      streamContent: "",
      loading: false,
      error: null,

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setStreaming: (streaming) => set({ streaming }),
      setStreamContent: (content) => set({ streamContent: content }),
      clearStreamContent: () => set({ streamContent: "" }),

      replayPrompt: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await ApiService.replayPrompt(data);
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

      clearResults: () =>
        set({ replayResults: [], currentReplay: null, streamContent: "" }),
    }),
    { name: "replay-store" }
  )
);
