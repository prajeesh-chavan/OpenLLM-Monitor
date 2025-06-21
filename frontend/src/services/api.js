import axios from "axios";
import errorHandler from "./errorHandler";

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Apply error handler interceptors
errorHandler.createAxiosInterceptor(api);

// Additional response interceptor for data extraction
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // The error handler has already processed this error
    // Just propagate it with clean error message
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }

    throw error.message || "An error occurred";
  }
);

/**
 * API service for OpenLLM Monitor
 */
export class ApiService {
  // Logs API
  static async getLogs(params = {}) {
    return api.get("/logs", { params });
  }

  static async getLogById(id) {
    return api.get(`/logs/${id}`);
  }

  static async deleteLog(id) {
    return api.delete(`/logs/${id}`);
  }

  static async deleteLogs(data) {
    return api.delete("/logs", { data });
  }

  static async getLogStats(params = {}) {
    return api.get("/logs/stats", { params });
  }

  static async getModelComparison(params = {}) {
    return api.get("/logs/comparison", { params });
  }

  static async getErrorAnalysis(params = {}) {
    return api.get("/logs/errors", { params });
  }

  static async exportLogs(params = {}) {
    const response = await axios({
      method: "get",
      url: `${api.defaults.baseURL}/logs/export`,
      params,
      responseType: "blob",
    });
    return response.data;
  }

  // Replay API
  static async replayPrompt(data) {
    return api.post("/replay", data);
  }

  static async replayFromLog(logId, data = {}) {
    return api.post(`/replay/log/${logId}`, data);
  }

  static async compareReplays(data) {
    return api.post("/replay/compare", data);
  }

  static async getCostEstimate(data) {
    return api.post("/replay/estimate", data);
  }

  static async getAvailableModels(provider = null) {
    const params = provider ? { provider } : {};
    return api.get("/replay/models", { params });
  }

  static async testConnection(provider) {
    return api.get(`/replay/connection/${provider}`);
  }

  // Server-Sent Events for streaming replays
  static streamReplay(data, onMessage, onError, onComplete) {
    const eventSource = new EventSource(
      `${api.defaults.baseURL}/replay/stream`
    );

    // Send the request data via POST first
    api.post("/replay/stream", data).catch(onError);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "chunk") {
          onMessage(data);
        } else if (data.type === "complete") {
          onComplete(data.result);
          eventSource.close();
        } else if (data.type === "error") {
          onError(new Error(data.error));
          eventSource.close();
        }
      } catch (error) {
        onError(error);
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      onError(error);
      eventSource.close();
    };

    return () => eventSource.close();
  }

  // Providers API
  static async getProviders(testConnections = false) {
    return api.get("/providers", {
      params: { testConnections },
    });
  }

  static async getProvider(provider) {
    return api.get(`/providers/${provider}`);
  }

  static async updateProvider(provider, data) {
    return api.put(`/providers/${provider}`, data);
  }

  static async testProviderConnection(provider, data = {}) {
    return api.post(`/providers/${provider}/test`, data);
  }

  static async getProviderModels(provider) {
    return api.get(`/providers/${provider}/models`);
  }

  static async getProviderStats(params = {}) {
    return api.get("/providers/stats", { params });
  }

  static async getProviderRecommendations(useCase = "general") {
    return api.get("/providers/recommendations", {
      params: { useCase },
    });
  }

  // Health and Info
  static async getHealth() {
    return api.get("/health");
  }

  static async getInfo() {
    return api.get("/info");
  }

  // Generic HTTP methods
  static async get(url, config = {}) {
    return api.get(url, config);
  }

  static async post(url, data = {}, config = {}) {
    return api.post(url, data, config);
  }

  static async put(url, data = {}, config = {}) {
    return api.put(url, data, config);
  }

  static async delete(url, config = {}) {
    return api.delete(url, config);
  }

  // Analytics API
  static async getAnalyticsStats(params = {}) {
    return api.get("/analytics/stats", { params });
  }

  static async getAnalyticsUsage(params = {}) {
    return api.get("/analytics/usage", { params });
  }
  static async getAnalyticsPerformance(params = {}) {
    return api.get("/analytics/performance", { params });
  }

  static async getAnalyticsCosts(params = {}) {
    return api.get("/analytics/costs", { params });
  }

  static async getAnalyticsErrors(params = {}) {
    return api.get("/analytics/errors", { params });
  }
  // Test API
  static async testPrompt(params = {}) {
    return api.post("/test/prompt", params, { timeout: 120000 }); // 2 minutes
  }

  static async compareModels(params = {}) {
    return api.post("/test/compare", params, { timeout: 180000 }); // 3 minutes for comparisons
  }

  static async getTestModels() {
    return api.get("/test/models");
  }

  static async getTestCostEstimate(params = {}) {
    return api.post("/test/estimate", params);
  }

  static async validateTestConfig(params = {}) {
    return api.post("/test/validate", params);
  }
}

export default ApiService;
