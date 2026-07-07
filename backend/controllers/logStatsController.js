const Log = require("../models/Log");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

class LogStatsController {
  async getStats(req, res) {
    try {
      const { timeframe = 24 } = req.query;
      const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);

      const [
        totalRequests,
        successfulRequests,
        totalCost,
        avgLatency,
        providerStats,
        costAnalysis,
      ] = await Promise.all([
        Log.countDocuments({ createdAt: { $gte: since } }),
        Log.countDocuments({ createdAt: { $gte: since }, status: "success" }),
        Log.aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: null, total: { $sum: "$cost.totalCost" } } },
        ]),
        Log.aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: null, avg: { $avg: "$latency" } } },
        ]),
        Log.getProviderStats(timeframe),
        Log.getCostAnalysis(timeframe),
      ]);

      const successRate =
        totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

      const recentActivity = await Log.find({ createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("provider model status latency cost.totalCost createdAt")
        .lean();

      const hourlyStats = await Log.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              hour: { $hour: "$createdAt" },
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            },
            requests: { $sum: 1 },
            successful: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
            totalCost: { $sum: "$cost.totalCost" },
            avgLatency: { $avg: "$latency" },
          },
        },
        { $sort: { "_id.date": 1, "_id.hour": 1 } },
      ]);

      return ApiResponse.success(res, {
        overview: {
          totalRequests,
          successfulRequests,
          successRate: Math.round(successRate * 100) / 100,
          totalCost: totalCost[0]?.total || 0,
          avgLatency: Math.round(avgLatency[0]?.avg || 0),
        },
        providerStats,
        costAnalysis,
        recentActivity,
        hourlyStats,
        timeframe: `${timeframe} hours`,
      });
    } catch (error) {
      logger.error({ err: error }, "Error getting stats");
      return ApiResponse.error(res, "Failed to fetch statistics", 500, error.message);
    }
  }

  async getModelComparison(req, res) {
    try {
      const { timeframe = 24 } = req.query;
      const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);

      const modelStats = await Log.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { provider: "$provider", model: "$model" },
            requestCount: { $sum: 1 },
            successCount: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
            avgLatency: { $avg: "$latency" },
            minLatency: { $min: "$latency" },
            maxLatency: { $max: "$latency" },
            totalCost: { $sum: "$cost.totalCost" },
            avgCost: { $avg: "$cost.totalCost" },
            totalTokens: { $sum: "$tokenUsage.totalTokens" },
            avgTokens: { $avg: "$tokenUsage.totalTokens" },
          },
        },
        {
          $addFields: {
            successRate: {
              $multiply: [{ $divide: ["$successCount", "$requestCount"] }, 100],
            },
            costPerToken: { $divide: ["$totalCost", "$totalTokens"] },
          },
        },
        { $sort: { requestCount: -1 } },
      ]);

      return ApiResponse.success(res, {
        models: modelStats,
        timeframe: `${timeframe} hours`,
      });
    } catch (error) {
      logger.error({ err: error }, "Error getting model comparison");
      return ApiResponse.error(res, "Failed to fetch model comparison", 500, error.message);
    }
  }

  async getErrorAnalysis(req, res) {
    try {
      const { timeframe = 24 } = req.query;
      const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);

      const errorStats = await Log.aggregate([
        {
          $match: {
            createdAt: { $gte: since },
            status: { $ne: "success" },
          },
        },
        {
          $group: {
            _id: { status: "$status", errorCode: "$error.code", provider: "$provider" },
            count: { $sum: 1 },
            examples: { $push: { message: "$error.message", timestamp: "$createdAt" } },
          },
        },
        {
          $addFields: {
            latestExample: { $arrayElemAt: ["$examples", -1] },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const retryStats = await Log.aggregate([
        {
          $match: { createdAt: { $gte: since }, retryAttempts: { $gt: 0 } },
        },
        {
          $group: {
            _id: "$provider",
            totalRetries: { $sum: "$retryAttempts" },
            requestsWithRetries: { $sum: 1 },
            avgRetries: { $avg: "$retryAttempts" },
            maxRetries: { $max: "$retryAttempts" },
          },
        },
      ]);

      return ApiResponse.success(res, {
        errorBreakdown: errorStats,
        retryAnalysis: retryStats,
        timeframe: `${timeframe} hours`,
      });
    } catch (error) {
      logger.error({ err: error }, "Error getting error analysis");
      return ApiResponse.error(res, "Failed to fetch error analysis", 500, error.message);
    }
  }
}

module.exports = new LogStatsController();
