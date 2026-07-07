const ApiResponse = require("../utils/apiResponse");
const AnalyticsService = require("../services/analyticsService");

const getStats = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "24h";
    const data = await AnalyticsService.getStats(timeRange);
    return ApiResponse.success(res, data);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return ApiResponse.error(res, "Failed to fetch statistics", 500, error.message);
  }
};

const getRequestVolume = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "24h";
    const data = await AnalyticsService.getRequestVolume(timeRange);
    return ApiResponse.success(res, data);
  } catch (error) {
    console.error("Error fetching request volume:", error);
    return ApiResponse.error(res, "Failed to fetch request volume", 500, error.message);
  }
};

const getProviderDistribution = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "24h";
    const data = await AnalyticsService.getProviderDistribution(timeRange);
    return ApiResponse.success(res, data);
  } catch (error) {
    console.error("Error fetching provider distribution:", error);
    return ApiResponse.error(res, "Failed to fetch provider distribution", 500, error.message);
  }
};

const getModelPerformance = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "24h";
    const data = await AnalyticsService.getModelPerformance(timeRange);
    return ApiResponse.success(res, data);
  } catch (error) {
    console.error("Error fetching model performance:", error);
    return ApiResponse.error(res, "Failed to fetch model performance", 500, error.message);
  }
};

const getCostAnalysis = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "24h";
    const data = await AnalyticsService.getCostAnalysis(timeRange);
    return ApiResponse.success(res, data);
  } catch (error) {
    console.error("Error fetching cost analysis:", error);
    return ApiResponse.error(res, "Failed to fetch cost analysis", 500, error.message);
  }
};

const getErrorAnalytics = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "24h";
    const data = await AnalyticsService.getErrorAnalytics(timeRange);
    return ApiResponse.success(res, data);
  } catch (error) {
    console.error("Error fetching error analytics:", error);
    return ApiResponse.error(res, "Failed to fetch error analytics", 500, error.message);
  }
};

const getTrends = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "7d";
    const data = await AnalyticsService.getTrends(timeRange);
    return ApiResponse.success(res, data);
  } catch (error) {
    console.error("Error fetching trends:", error);
    return ApiResponse.error(res, "Failed to fetch trends", 500, error.message);
  }
};

const exportAnalytics = async (req, res) => {
  try {
    const format = req.query.format || "json";
    const timeRange = req.query.timeRange || "24h";
    const logs = await AnalyticsService.exportAnalytics(timeRange);

    if (format === "csv") {
      const csvData = logs.map((log) => ({
        requestId: log.requestId,
        provider: log.provider,
        model: log.model,
        prompt: (log.prompt || "").substring(0, 100) + "...",
        latency: log.latency,
        cost: log.cost?.totalCost || 0,
        status: log.status,
        createdAt: log.createdAt.toISOString(),
      }));

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="analytics.csv"');
      return res.send(
        "requestId,provider,model,prompt,latency,cost,status,createdAt\n" +
          csvData.map((row) => Object.values(row).join(",")).join("\n")
      );
    }

    return ApiResponse.success(res, { analytics: logs, format, timeRange, exportedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Error exporting analytics:", error);
    return ApiResponse.error(res, "Failed to export analytics", 500, error.message);
  }
};

module.exports = {
  getStats,
  getRequestVolume,
  getProviderDistribution,
  getModelPerformance,
  getCostAnalysis,
  getErrorAnalytics,
  getTrends,
  exportAnalytics,
};
