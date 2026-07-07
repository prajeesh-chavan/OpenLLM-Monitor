const Log = require("../models/Log");
const { v4: uuidv4 } = require("uuid");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

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
      logger.error({ err: error }, "Error getting logs");
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
      logger.error({ err: error }, "Error getting log");
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
      logger.error({ err: error }, "Error creating log");
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
      logger.error({ err: error }, "Error updating log");
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
      logger.error({ err: error }, "Error deleting log");
      return ApiResponse.error(res, "Failed to delete log", 500, error.message);
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
      logger.error({ err: error }, "Error exporting logs");
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
      logger.error({ err: error }, "Error deleting logs");
      return ApiResponse.error(res, "Failed to delete logs", 500, error.message);
    }
  }
}

module.exports = new LogController();
