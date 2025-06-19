const Log = require("../models/Log");

/**
 * Analytics Controller
 * Handles analytics and statistics endpoints
 */

/**
 * Get overall statistics
 */
const getStats = async (req, res) => {
  try {
    const { timeRange = "24h" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "6h":
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } // Aggregate statistics
    const stats = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
          errorRequests: {
            $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] },
          },
          avgResponseTime: { $avg: "$latency" },
          totalCost: { $sum: "$cost.totalCost" },
          totalTokens: { $sum: "$tokenUsage.totalTokens" },
          providers: { $addToSet: "$provider" },
        },
      },
    ]);

    const result = stats[0] || {
      totalRequests: 0,
      successfulRequests: 0,
      errorRequests: 0,
      avgResponseTime: 0,
      totalCost: 0,
      totalTokens: 0,
      providers: [],
    };

    // Calculate rates
    const successRate =
      result.totalRequests > 0
        ? (result.successfulRequests / result.totalRequests) * 100
        : 0;

    const errorRate =
      result.totalRequests > 0
        ? (result.errorRequests / result.totalRequests) * 100
        : 0;
    res.json({
      success: true,
      data: {
        overview: {
          totalRequests: result.totalRequests,
          successfulRequests: result.successfulRequests,
          errorRequests: result.errorRequests,
          successRate: Math.round(successRate * 100) / 100,
          errorRate: Math.round(errorRate * 100) / 100,
          avgDuration: Math.round(result.avgResponseTime || 0),
          totalCost: Math.round(result.totalCost * 10000) / 10000,
          totalTokens: result.totalTokens,
          activeProviders: result.providers.length,
        },
        providerStats: result.providers,
        modelStats: [],
        timeRangeStats: {
          timeRange,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
      message: error.message,
    });
  }
};

/**
 * Get request volume over time
 */
const getRequestVolume = async (req, res) => {
  try {
    const { timeRange = "24h", interval = "1h" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate, groupBy;

    switch (timeRange) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m-%d %H:%M", date: "$createdAt" },
        };
        break;
      case "6h":
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" },
        };
        break;
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" },
        };
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" },
        };
    }

    const volume = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          requests: { $sum: 1 },
          errors: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          createdAt: "$_id",
          requests: 1,
          errors: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        hourlyStats: volume,
        requestVolume: volume.length,
        tokenUsage: volume.reduce(
          (acc, curr) => acc + (curr.totalTokens || 0),
          0
        ),
        timeRange,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching request volume:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch request volume",
      message: error.message,
    });
  }
};

/**
 * Get provider distribution
 */
const getProviderDistribution = async (req, res) => {
  try {
    const { timeRange = "24h" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "6h":
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const distribution = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$provider",
          count: { $sum: 1 },
          avgResponseTime: { $avg: "$latency" },
          totalCost: { $sum: "$cost.totalCost" },
          successRate: {
            $avg: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
          count: 1,
          avgResponseTime: { $round: ["$avgResponseTime", 2] },
          totalCost: { $round: ["$totalCost", 4] },
          successRate: { $round: [{ $multiply: ["$successRate", 100] }, 2] },
          _id: 0,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        providerComparison: distribution,
        modelComparison: distribution.map((p) => ({
          provider: p._id,
          models: p.models || [],
        })),
        timeRange,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching provider distribution:", error);
    res.status(500).json({
      error: "Failed to fetch provider distribution",
      message: error.message,
    });
  }
};

/**
 * Get model performance comparison
 */
const getModelPerformance = async (req, res) => {
  try {
    const { timeRange = "24h" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const performance = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$model",
          provider: { $first: "$provider" },
          requestCount: { $sum: 1 },
          avgDuration: { $avg: "$latency" },
          successRate: {
            $avg: { $cond: [{ $eq: ["$status", "success"] }, 100, 0] },
          },
          avgCost: { $avg: "$cost.totalCost" },
          totalTokens: { $sum: "$tokenUsage.total" },
        },
      },
      {
        $project: {
          model: "$_id",
          provider: 1,
          requestCount: 1,
          avgDuration: { $round: ["$avgDuration", 2] },
          successRate: { $round: ["$successRate", 2] },
          avgCost: { $round: ["$avgCost", 6] },
          totalTokens: 1,
          _id: 0,
        },
      },
      {
        $sort: { requestCount: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    res.json({
      success: true,
      data: {
        responseTime:
          performance.reduce(
            (acc, curr) => acc + (curr.avgResponseTime || 0),
            0
          ) / performance.length || 0,
        errorRate:
          performance.reduce((acc, curr) => acc + (curr.errorRate || 0), 0) /
            performance.length || 0,
        latencyDistribution: performance,
        timeRange,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching model performance:", error);
    res.status(500).json({
      error: "Failed to fetch model performance",
      message: error.message,
    });
  }
};

/**
 * Get cost analysis over time
 */
const getCostAnalysis = async (req, res) => {
  try {
    const { timeRange = "24h" } = req.query;

    // Calculate date range and grouping
    const now = new Date();
    let startDate, groupBy;

    switch (timeRange) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m-%d %H:%M", date: "$createdAt" },
        };
        break;
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" },
        };
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" },
        };
    }

    const costAnalysis = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          "cost.totalCost": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: groupBy,
          cost: { $sum: "$cost.totalCost" },
          requests: { $sum: 1 },
          inputTokens: { $sum: "$tokenUsage.prompt" },
          outputTokens: { $sum: "$tokenUsage.completion" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          createdAt: "$_id",
          cost: { $round: ["$cost", 6] },
          requests: 1,
          inputTokens: 1,
          outputTokens: 1,
          _id: 0,
        },
      },
    ]);
    res.json({
      success: true,
      data: {
        totalCost: costAnalysis.reduce(
          (acc, curr) => acc + (curr.cost || 0),
          0
        ),
        costByProvider: costAnalysis,
        costByModel: costAnalysis,
        costTrend: costAnalysis,
        costBreakdown: costAnalysis,
        timeRange,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching cost analysis:", error);
    res.status(500).json({
      error: "Failed to fetch cost analysis",
      message: error.message,
    });
  }
};

/**
 * Get error analytics
 */
const getErrorAnalytics = async (req, res) => {
  try {
    const { timeRange = "24h" } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const errorStats = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "error",
        },
      },
      {
        $group: {
          _id: "$error.code",
          count: { $sum: 1 },
          errorMessages: { $addToSet: "$error.message" },
        },
      },
    ]);

    const totalRequests = await Log.countDocuments({
      createdAt: { $gte: startDate },
    });

    const totalErrors = await Log.countDocuments({
      createdAt: { $gte: startDate },
      status: "error",
    });

    const errorRate =
      totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    res.json({
      success: true,
      data: {
        errorRate: Math.round(errorRate * 100) / 100,
        totalErrors,
        errorsByType: errorStats,
        errorsByProvider: errorStats,
        errorBreakdown: errorStats,
        timeRange,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching error analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch error analytics",
      message: error.message,
    });
  }
};

/**
 * Get trend analysis
 */
const getTrends = async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Simplified trend analysis - can be expanded
    const trends = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          requests: { $sum: 1 },
          avgLatency: { $avg: "$latency" },
          totalCost: { $sum: "$cost.totalCost" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    res.json({
      success: true,
      data: {
        insights: "Request volume and performance trends over time",
        patterns: trends,
        predictions: "Based on current data, trends are stable",
        trends,
        timeRange,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching trends:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trends",
      message: error.message,
    });
  }
};

/**
 * Export analytics data
 */
const exportAnalytics = async (req, res) => {
  try {
    const { format = "json", timeRange = "24h" } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const logs = await Log.find({
      createdAt: { $gte: startDate },
    }).select(
      "requestId provider model prompt completion latency cost status createdAt"
    );

    if (format === "csv") {
      const csvData = logs.map((log) => ({
        requestId: log.requestId,
        provider: log.provider,
        model: log.model,
        prompt: log.prompt.substring(0, 100) + "...",
        latency: log.latency,
        cost: log.cost.totalCost,
        status: log.status,
        createdAt: log.createdAt.toISOString(),
      }));

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="analytics.csv"'
      );
      res.send(
        "requestId,provider,model,prompt,latency,cost,status,createdAt\n" +
          csvData.map((row) => Object.values(row).join(",")).join("\n")
      );
    } else {
      res.json({
        success: true,
        data: {
          analytics: logs,
          exportedAt: new Date().toISOString(),
          format,
          timeRange,
        },
      });
    }
  } catch (error) {
    console.error("Error exporting analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export analytics",
      message: error.message,
    });
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
