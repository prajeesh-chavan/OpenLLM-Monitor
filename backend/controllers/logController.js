const Log = require("../models/Log");
const { v4: uuidv4 } = require("uuid");
const ApiResponse = require("../utils/apiResponse");

/**
 * Log controller for handling LLM request logs
 */
class LogController {
  /**
   * Get all logs with filtering and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        provider,
        model,
        status,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
      } = req.query;

      // Build filter object
      const filter = {};

      if (provider) {
        filter.provider = {
          $in: Array.isArray(provider) ? provider : [provider],
        };
      }

      if (model) {
        filter.model = { $in: Array.isArray(model) ? model : [model] };
      }

      if (status) {
        filter.status = { $in: Array.isArray(status) ? status : [status] };
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
          filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          filter.createdAt.$lte = new Date(endDate);
        }
      }

      if (search) {
        filter.$or = [
          { prompt: { $regex: search, $options: "i" } },
          { completion: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
        ];
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Execute query
      const [logs, totalCount] = await Promise.all([
        Log.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Log.countDocuments(filter),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      return ApiResponse.paginated(res, { logs }, {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages,
      });
    } catch (error) {
      console.error("Error getting logs:", error);
      return ApiResponse.error(res, "Failed to fetch logs", 500, error.message);
    }
  }

  async getLogById(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return ApiResponse.badRequest(res, "Invalid log ID format");
      }

      const log = await Log.findById(id).lean();

      if (!log) {
        return ApiResponse.notFound(res, "Log not found");
      }

      return ApiResponse.success(res, { log });
    } catch (error) {
      console.error("Error getting log:", error);
      return ApiResponse.error(res, "Failed to fetch log", 500, error.message);
    }
  }

  /**
   * Create a new log entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createLog(req, res) {
    try {
      const logData = {
        requestId: req.body.requestId || uuidv4(),
        ...req.body,
      };

      const log = new Log(logData);
      await log.save();

      return ApiResponse.created(res, log);
    } catch (error) {
      console.error("Error creating log:", error);
      return ApiResponse.error(res, "Failed to create log", 500, error.message);
    }
  }

  async updateLog(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const log = await Log.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!log) {
        return ApiResponse.notFound(res, "Log not found");
      }

      return ApiResponse.success(res, log);
    } catch (error) {
      console.error("Error updating log:", error);
      return ApiResponse.error(res, "Failed to update log", 500, error.message);
    }
  }

  async deleteLog(req, res) {
    try {
      const { id } = req.params;

      const log = await Log.findByIdAndDelete(id);

      if (!log) {
        return ApiResponse.notFound(res, "Log not found");
      }

      return ApiResponse.success(res, { message: "Log deleted successfully" });
    } catch (error) {
      console.error("Error deleting log:", error);
      return ApiResponse.error(res, "Failed to delete log", 500, error.message);
    }
  }

  /**
   * Get statistics for the dashboard
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStats(req, res) {
    try {
      const { timeframe = 24 } = req.query; // hours
      const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);

      // Get basic stats
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

      // Calculate success rate
      const successRate =
        totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

      // Get recent activity (last 50 requests)
      const recentActivity = await Log.find({ createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("provider model status latency cost.totalCost createdAt")
        .lean();

      // Get hourly distribution
      const hourlyStats = await Log.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              hour: { $hour: "$createdAt" },
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
            requests: { $sum: 1 },
            successful: {
              $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
            },
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
      console.error("Error getting stats:", error);
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
            _id: {
              provider: "$provider",
              model: "$model",
            },
            requestCount: { $sum: 1 },
            successCount: {
              $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
            },
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
      console.error("Error getting model comparison:", error);
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
            _id: {
              status: "$status",
              errorCode: "$error.code",
              provider: "$provider",
            },
            count: { $sum: 1 },
            examples: {
              $push: { message: "$error.message", timestamp: "$createdAt" },
            },
          },
        },
        {
          $addFields: {
            latestExample: { $arrayElemAt: ["$examples", -1] },
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Get retry analysis
      const retryStats = await Log.aggregate([
        {
          $match: {
            createdAt: { $gte: since },
            retryAttempts: { $gt: 0 },
          },
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
      console.error("Error getting error analysis:", error);
      return ApiResponse.error(res, "Failed to fetch error analysis", 500, error.message);
    }
  }

  async exportLogs(req, res) {
    try {
      const { startDate, endDate, provider, model, status } = req.query;

      // Build filter
      const filter = {};
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }
      if (provider) filter.provider = provider;
      if (model) filter.model = model;
      if (status) filter.status = status;

      const logs = await Log.find(filter).sort({ createdAt: -1 }).lean();

      // Convert to CSV format (simplified)
      const csvHeaders = [
        "Timestamp",
        "Provider",
        "Model",
        "Status",
        "Latency (ms)",
        "Prompt Tokens",
        "Completion Tokens",
        "Total Cost ($)",
        "Error Message",
      ];

      const csvRows = logs.map((log) => [
        log.createdAt.toISOString(),
        log.provider,
        log.model,
        log.status,
        log.latency,
        log.tokenUsage.promptTokens,
        log.tokenUsage.completionTokens,
        log.cost.totalCost,
        log.error?.message || "",
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=llm-logs.csv");
      return res.send(csvContent);
    } catch (error) {
      console.error("Error exporting logs:", error);
      return ApiResponse.error(res, "Failed to export logs", 500, error.message);
    }
  }

  async deleteLogs(req, res) {
    try {
      const { ids, olderThan } = req.body;

      let deleteQuery = {};

      if (ids && Array.isArray(ids)) {
        deleteQuery._id = { $in: ids };
      } else if (olderThan) {
        deleteQuery.createdAt = { $lt: new Date(olderThan) };
      } else {
        return ApiResponse.badRequest(res, "Must provide either ids array or olderThan date");
      }

      const result = await Log.deleteMany(deleteQuery);
      return ApiResponse.success(res, {
        deletedCount: result.deletedCount,
        message: `Deleted ${result.deletedCount} logs`,
      });
    } catch (error) {
      console.error("Error deleting logs:", error);
      return ApiResponse.error(res, "Failed to delete logs", 500, error.message);
    }
  }
}

module.exports = new LogController();
