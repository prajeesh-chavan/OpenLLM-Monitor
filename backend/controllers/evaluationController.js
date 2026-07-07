const Evaluation = require("../models/Evaluation");
const Log = require("../models/Log");
const evaluationService = require("../services/evaluation/EvaluationService");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

class EvaluationController {
  async runEvaluation(req, res) {
    try {
      const { logId, types } = req.body;

      if (!logId) {
        return ApiResponse.badRequest(res, "logId is required");
      }

      const log = await Log.findById(logId).lean();
      if (!log) {
        return ApiResponse.notFound(res, "Log not found");
      }

      const results = await evaluationService.evaluate(log, types || null);

      return ApiResponse.created(res, { evaluations: results });
    } catch (error) {
      logger.error({ err: error }, "Error running evaluation");
      return ApiResponse.error(res, "Evaluation failed", 500, error.message);
    }
  }

  async runBatchEvaluation(req, res) {
    try {
      const { logIds, types, filters } = req.body;

      let logs;
      if (logIds && logIds.length > 0) {
        logs = await Log.find({ _id: { $in: logIds } }).lean();
      } else if (filters) {
        const query = {};
        if (filters.provider) query.provider = filters.provider;
        if (filters.model) query.model = filters.model;
        if (filters.startDate || filters.endDate) {
          query.createdAt = {};
          if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
          if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
        }
        logs = await Log.find(query).limit(filters.limit || 50).lean();
      } else {
        return ApiResponse.badRequest(res, "Provide logIds or filters");
      }

      const results = await evaluationService.evaluateBatch(logs, types || null);

      return ApiResponse.success(res, {
        totalProcessed: results.length,
        results,
      });
    } catch (error) {
      logger.error({ err: error }, "Error running batch evaluation");
      return ApiResponse.error(res, "Batch evaluation failed", 500, error.message);
    }
  }

  async getEvaluations(req, res) {
    try {
      const { logId, type, minScore, maxScore, page = 1, limit = 50, sort } = req.query;

      const result = await evaluationService.getEvaluations({
        logId,
        type,
        minScore,
        maxScore,
        limit,
        skip: (parseInt(page) - 1) * parseInt(limit),
        sort,
      });

      const totalPages = Math.ceil(result.total / parseInt(limit));

      return ApiResponse.paginated(res, { evaluations: result.evaluations }, {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount: result.total,
        totalPages,
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching evaluations");
      return ApiResponse.error(res, "Failed to fetch evaluations", 500, error.message);
    }
  }

  async getEvaluationById(req, res) {
    try {
      const { id } = req.params;
      const evaluation = await evaluationService.getEvaluationById(id);

      if (!evaluation) {
        return ApiResponse.notFound(res, "Evaluation not found");
      }

      return ApiResponse.success(res, { evaluation });
    } catch (error) {
      logger.error({ err: error }, "Error fetching evaluation");
      return ApiResponse.error(res, "Failed to fetch evaluation", 500, error.message);
    }
  }

  async getEvaluationStats(req, res) {
    try {
      const { startDate, endDate, type } = req.query;
      const stats = await evaluationService.getEvaluationStats({ startDate, endDate, type });
      return ApiResponse.success(res, stats);
    } catch (error) {
      logger.error({ err: error }, "Error fetching evaluation stats");
      return ApiResponse.error(res, "Failed to fetch evaluation stats", 500, error.message);
    }
  }

  async getEvaluationTrends(req, res) {
    try {
      const { timeRange = "7d" } = req.query;
      const trends = await evaluationService.getEvaluationTrends(timeRange);
      return ApiResponse.success(res, { trends });
    } catch (error) {
      logger.error({ err: error }, "Error fetching evaluation trends");
      return ApiResponse.error(res, "Failed to fetch evaluation trends", 500, error.message);
    }
  }

  async getEvaluatorTypes(req, res) {
    try {
      const types = evaluationService.getAvailableTypes();
      return ApiResponse.success(res, { types });
    } catch (error) {
      logger.error({ err: error }, "Error fetching evaluator types");
      return ApiResponse.error(res, "Failed to fetch evaluator types", 500, error.message);
    }
  }

  async deleteEvaluation(req, res) {
    try {
      const { id } = req.params;
      const evaluation = await Evaluation.findByIdAndDelete(id);

      if (!evaluation) {
        return ApiResponse.notFound(res, "Evaluation not found");
      }

      return ApiResponse.success(res, { message: "Evaluation deleted" });
    } catch (error) {
      logger.error({ err: error }, "Error deleting evaluation");
      return ApiResponse.error(res, "Failed to delete evaluation", 500, error.message);
    }
  }
}

module.exports = new EvaluationController();
