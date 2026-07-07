import { create } from "zustand";
import { devtools } from "zustand/middleware";
import ApiService from "../services/api";

export const useProvidersStore = create(
  devtools(
    (set, get) => ({
      providers: {},
      availableModels: {},
      loading: false,
      error: null,
      testingConnection: null,

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setTestingConnection: (provider) => set({ testingConnection: provider }),

      fetchProviders: async (testConnections = false) => {
        set({ loading: true, error: null });
        try {
          const response = await ApiService.getProviders(testConnections);
          set({ providers: response.data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      updateProvider: async (provider, data) => {
        set({ loading: true, error: null });
        try {
          const response = await ApiService.updateProvider(provider, data);
          set((state) => ({
            providers: { ...state.providers, [provider]: response.data },
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      testConnection: async (provider, data = {}) => {
        set({ testingConnection: provider, error: null });
        try {
          const response = await ApiService.testProviderConnection(provider, data);
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
