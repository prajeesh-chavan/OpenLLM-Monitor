// Example: Using the OpenLLM Monitor API from the frontend
import { ApiService } from "../services/api";

/**
 * This is an example component showing how to use the OpenLLM Monitor API
 * from your React components. All API calls are handled through the
 * ApiService which provides a clean, consistent interface.
 */
class ApiExampleComponent {
  /**
   * Fetches logs with pagination and filtering
   */
  async fetchLogs() {
    try {
      // Basic pagination
      const logsPage1 = await ApiService.getLogs({
        page: 1,
        limit: 10,
      });

      // With additional filters
      const filteredLogs = await ApiService.getLogs({
        provider: "openai",
        model: "gpt-4",
        status: "success",
        startDate: "2023-06-01",
        endDate: "2023-06-30",
        sortBy: "timestamp",
        sortOrder: "desc",
      });

      return filteredLogs;
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  }

  /**
   * Fetches detailed information about a specific log
   */
  async getLogDetails(logId) {
    try {
      const logDetails = await ApiService.getLogById(logId);
      return logDetails;
    } catch (error) {
      console.error(`Error fetching log ${logId}:`, error);
      throw error;
    }
  }

  /**
   * Gets statistical data for the dashboard
   */
  async getDashboardStats() {
    try {
      const stats = await ApiService.getLogStats({
        timeframe: "last_7_days",
      });

      const modelComparison = await ApiService.getModelComparison({
        models: ["gpt-4", "gpt-3.5-turbo", "llama2"],
        metric: "response_time",
      });

      const errorAnalysis = await ApiService.getErrorAnalysis({
        timeframe: "last_30_days",
      });

      return { stats, modelComparison, errorAnalysis };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Tests provider connections
   */
  async testProviderConnection(provider) {
    try {
      const result = await ApiService.testProviderConnection(provider);
      return result.success;
    } catch (error) {
      console.error(`Error testing ${provider} connection:`, error);
      return false;
    }
  }

  /**
   * Replays a prompt with a specific model and provider
   */
  async replayPrompt(prompt, provider, model) {
    try {
      const result = await ApiService.replayPrompt({
        prompt,
        provider,
        model,
        systemMessage: "You are a helpful assistant.",
        temperature: 0.7,
        maxTokens: 1000,
      });

      return result;
    } catch (error) {
      console.error("Error replaying prompt:", error);
      throw error;
    }
  }

  /**
   * Exports logs to CSV format
   */
  async exportLogsToCSV(filters = {}) {
    try {
      const csvBlob = await ApiService.exportLogs(filters);

      // Create a download link
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "openllm_monitor_logs.csv";

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting logs:", error);
      throw error;
    }
  }
}

export default ApiExampleComponent;
