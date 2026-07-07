const Log = require("../models/Log");
const TimeRangeUtil = require("../utils/timeRange");

class AnalyticsService {
  static async getStats(timeRange = "24h") {
    const { startDate } = TimeRangeUtil.getDateRange(timeRange);

    const stats = await Log.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successfulRequests: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
          errorRequests: { $sum: { $cond: [{ $ne: ["$status", "success"] }, 1, 0] } },
          rateLimitedRequests: { $sum: { $cond: [{ $eq: ["$status", "rate_limited"] }, 1, 0] } },
          timeoutRequests: { $sum: { $cond: [{ $eq: ["$status", "timeout"] }, 1, 0] } },
          generalErrorRequests: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } },
          totalRetryAttempts: { $sum: "$retryAttempts" },
          requestsWithRetries: { $sum: { $cond: [{ $gt: ["$retryAttempts", 0] }, 1, 0] } },
          avgResponseTime: { $avg: "$latency" },
          totalCost: { $sum: "$cost.totalCost" },
          totalTokens: { $sum: "$tokenUsage.totalTokens" },
          promptTokens: { $sum: "$tokenUsage.promptTokens" },
          completionTokens: { $sum: "$tokenUsage.completionTokens" },
          providers: { $addToSet: "$provider" },
        },
      },
    ]);

    const result = stats[0] || {
      totalRequests: 0, successfulRequests: 0, errorRequests: 0,
      rateLimitedRequests: 0, timeoutRequests: 0, generalErrorRequests: 0,
      totalRetryAttempts: 0, requestsWithRetries: 0, avgResponseTime: 0,
      totalCost: 0, totalTokens: 0, promptTokens: 0, completionTokens: 0, providers: [],
    };

    const successRate = result.totalRequests > 0 ? (result.successfulRequests / result.totalRequests) * 100 : 0;
    const errorRate = result.totalRequests > 0 ? (result.errorRequests / result.totalRequests) * 100 : 0;
    const retryRate = result.totalRequests > 0 ? (result.requestsWithRetries / result.totalRequests) * 100 : 0;

    return {
      overview: {
        totalRequests: result.totalRequests,
        successfulRequests: result.successfulRequests,
        errorRequests: result.errorRequests,
        successRate: Math.round(successRate * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
        retryRate: Math.round(retryRate * 100) / 100,
        avgDuration: Math.round(result.avgResponseTime || 0),
        totalCost: Math.round(result.totalCost * 10000) / 10000,
        totalTokens: result.totalTokens,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        activeProviders: result.providers.length,
        rateLimitedRequests: result.rateLimitedRequests,
        timeoutRequests: result.timeoutRequests,
        generalErrorRequests: result.generalErrorRequests,
        totalRetryAttempts: result.totalRetryAttempts,
        requestsWithRetries: result.requestsWithRetries,
        avgRetriesPerFailedRequest:
          result.requestsWithRetries > 0
            ? Math.round((result.totalRetryAttempts / result.requestsWithRetries) * 100) / 100
            : 0,
      },
      providerStats: result.providers,
      modelStats: [],
      timeRangeStats: { timeRange, generatedAt: new Date().toISOString() },
    };
  }

  static async getRequestVolume(timeRange = "24h") {
    const { startDate } = TimeRangeUtil.getDateRange(timeRange);
    const groupBy = TimeRangeUtil.getGroupByFormat(timeRange);

    const volume = await Log.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          requests: { $sum: 1 },
          errors: { $sum: { $cond: [{ $ne: ["$status", "success"] }, 1, 0] } },
          totalTokens: { $sum: "$tokenUsage.totalTokens" },
          promptTokens: { $sum: "$tokenUsage.promptTokens" },
          completionTokens: { $sum: "$tokenUsage.completionTokens" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          createdAt: "$_id", requests: 1, errors: 1,
          totalTokens: 1, promptTokens: 1, completionTokens: 1, _id: 0,
        },
      },
    ]);

    return {
      hourlyStats: volume,
      requestVolume: volume.length,
      tokenUsage: {
        total: volume.reduce((acc, curr) => acc + (curr.totalTokens || 0), 0),
        prompt: volume.reduce((acc, curr) => acc + (curr.promptTokens || 0), 0),
        completion: volume.reduce((acc, curr) => acc + (curr.completionTokens || 0), 0),
      },
      timeRange,
      generatedAt: new Date().toISOString(),
    };
  }

  static async getProviderDistribution(timeRange = "24h") {
    const { startDate } = TimeRangeUtil.getDateRange(timeRange);

    const distribution = await Log.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$provider",
          count: { $sum: 1 },
          avgResponseTime: { $avg: "$latency" },
          totalCost: { $sum: "$cost.totalCost" },
          successRate: { $avg: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
        },
      },
      {
        $project: {
          name: "$_id", value: "$count", count: 1,
          avgResponseTime: { $round: ["$avgResponseTime", 2] },
          totalCost: { $round: ["$totalCost", 4] },
          successRate: { $round: [{ $multiply: ["$successRate", 100] }, 2] },
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      providerComparison: distribution,
      timeRange,
      generatedAt: new Date().toISOString(),
    };
  }

  static async getModelPerformance(timeRange = "24h") {
    const { startDate } = TimeRangeUtil.getDateRange(timeRange);

    const performance = await Log.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$model",
          provider: { $first: "$provider" },
          requestCount: { $sum: 1 },
          avgDuration: { $avg: "$latency" },
          successRate: { $avg: { $cond: [{ $eq: ["$status", "success"] }, 100, 0] } },
          avgCost: { $avg: "$cost.totalCost" },
          totalTokens: { $sum: "$tokenUsage.total" },
        },
      },
      {
        $project: {
          model: "$_id", provider: 1, requestCount: 1,
          avgDuration: { $round: ["$avgDuration", 2] },
          successRate: { $round: ["$successRate", 2] },
          avgCost: { $round: ["$avgCost", 6] },
          totalTokens: 1, _id: 0,
        },
      },
      { $sort: { requestCount: -1 } },
      { $limit: 20 },
    ]);

    return {
      latencyDistribution: performance,
      timeRange,
      generatedAt: new Date().toISOString(),
    };
  }

  static async getCostAnalysis(timeRange = "24h") {
    const { startDate } = TimeRangeUtil.getDateRange(timeRange);
    const groupBy = TimeRangeUtil.getGroupByFormat(timeRange);

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
      { $sort: { _id: 1 } },
      {
        $project: {
          createdAt: "$_id", cost: { $round: ["$cost", 6] },
          requests: 1, inputTokens: 1, outputTokens: 1, _id: 0,
        },
      },
    ]);

    return {
      totalCost: costAnalysis.reduce((acc, curr) => acc + (curr.cost || 0), 0),
      costTrend: costAnalysis,
      costBreakdown: costAnalysis,
      timeRange,
      generatedAt: new Date().toISOString(),
    };
  }

  static async getErrorAnalytics(timeRange = "24h") {
    const { startDate } = TimeRangeUtil.getDateRange(timeRange);

    const errorStats = await Log.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: "error" } },
      {
        $group: {
          _id: "$error.code",
          count: { $sum: 1 },
          errorMessages: { $addToSet: "$error.message" },
        },
      },
    ]);

    const totalRequests = await Log.countDocuments({ createdAt: { $gte: startDate } });
    const totalErrors = await Log.countDocuments({ createdAt: { $gte: startDate }, status: "error" });
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    return {
      errorRate: Math.round(errorRate * 100) / 100,
      totalErrors,
      errorsByType: errorStats,
      errorBreakdown: errorStats,
      timeRange,
      generatedAt: new Date().toISOString(),
    };
  }

  static async getTrends(timeRange = "7d") {
    const { startDate } = TimeRangeUtil.getDateRange(timeRange);

    const trends = await Log.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          requests: { $sum: 1 },
          avgLatency: { $avg: "$latency" },
          totalCost: { $sum: "$cost.totalCost" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      insights: "Request volume and performance trends over time",
      patterns: trends,
      predictions: "Based on current data, trends are stable",
      trends,
      timeRange,
      generatedAt: new Date().toISOString(),
    };
  }

  static async exportAnalytics(timeRange = "24h") {
    const { startDate } = TimeRangeUtil.getDateRange(timeRange);

    return Log.find({ createdAt: { $gte: startDate } }).select(
      "requestId provider model prompt completion latency cost status createdAt"
    );
  }
}

module.exports = AnalyticsService;
