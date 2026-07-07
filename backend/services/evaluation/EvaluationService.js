const Evaluation = require("../../models/Evaluation");
const evalConfig = require("../../config/evaluation");
const logger = require("../../utils/logger");
const {
  HallucinationEvaluator,
  FaithfulnessEvaluator,
  RelevanceEvaluator,
  ToxicityEvaluator,
} = require("./index");

const providerServices = {
  openai: () => new (require("../openaiService"))(),
  openrouter: () => new (require("../openrouterService"))(),
  mistral: () => new (require("../mistralService"))(),
  gemini: () => new (require("../geminiService"))(),
};

class EvaluationService {
  constructor() {
    this.evaluators = {
      hallucination: new HallucinationEvaluator(),
      faithfulness: new FaithfulnessEvaluator(),
      relevance: new RelevanceEvaluator(),
      toxicity: new ToxicityEvaluator(),
    };
  }

  getAvailableTypes() {
    return Object.keys(this.evaluators);
  }

  getEvaluator(type) {
    return this.evaluators[type];
  }

  async evaluate(log, types = null) {
    const typesToRun = types || evalConfig.enabledEvaluators;
    const results = [];

    for (const type of typesToRun) {
      try {
        const result = await this.evaluateSingle(log, type);
        results.push(result);
      } catch (error) {
        logger.error({ err: error, type, logId: log._id }, "Evaluation failed");
      }
    }

    return results;
  }

  async evaluateSingle(log, type) {
    const evaluator = this.evaluators[type];
    if (!evaluator) {
      throw new Error(`Unknown evaluator type: ${type}`);
    }

    const judgePrompt = evaluator.buildJudgePrompt(log);
    const judgeModel = evalConfig.defaultJudgeModel;
    const [providerName, modelName] = judgeModel.split("/");

    let providerService;
    try {
      const factory = providerServices[providerName];
      if (!factory) {
        throw new Error(`No provider service for judge model: ${judgeModel}`);
      }
      providerService = factory();
    } catch (error) {
      logger.warn({ judgeModel, error: error.message }, "Judge model unavailable, using fallback");
      const [fallbackProvider, fallbackModel] = evalConfig.fallbackJudgeModel.split("/");
      const factory = providerServices[fallbackProvider];
      if (!factory) {
        throw new Error(`No fallback provider available for ${evalConfig.fallbackJudgeModel}`);
      }
      providerService = factory();
    }

    const response = await providerService.sendPrompt({
      prompt: judgePrompt.user,
      systemMessage: judgePrompt.system,
      model: modelName,
      temperature: evalConfig.defaultTemperature,
      maxTokens: 1024,
    });

    if (response.status === "error") {
      throw new Error(`Judge model call failed: ${response.error?.message || "Unknown error"}`);
    }

    const parsed = evaluator.parseResponse(response.completion);
    const thresholds = evaluator.getThresholds();
    const score = typeof parsed.score === "number" ? parsed.score : 0.5;
    const passed = score >= thresholds.pass;

    const evaluation = await Evaluation.create({
      logId: log._id || log.id,
      type,
      score,
      passed,
      rationale: parsed.rationale || "",
      details: parsed.details || [],
      evaluatorConfig: {
        judgeModel,
        temperature: evalConfig.defaultTemperature,
      },
    });

    return evaluation;
  }

  async evaluateBatch(logs, types = null) {
    const results = [];

    for (const log of logs) {
      try {
        const evals = await this.evaluate(log, types);
        results.push({ logId: log._id || log.id, evaluations: evals });
      } catch (error) {
        logger.error({ err: error, logId: log._id }, "Batch evaluation failed for log");
      }
    }

    return results;
  }

  async getEvaluations(query = {}) {
    const { logId, type, minScore, maxScore, limit = 50, skip = 0, sort = "-createdAt" } = query;

    const filter = {};
    if (logId) filter.logId = logId;
    if (type) filter.type = type;
    if (minScore !== undefined || maxScore !== undefined) {
      filter.score = {};
      if (minScore !== undefined) filter.score.$gte = parseFloat(minScore);
      if (maxScore !== undefined) filter.score.$lte = parseFloat(maxScore);
    }

    const sortObj = {};
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    sortObj[sortField] = sort.startsWith("-") ? -1 : 1;

    const [evaluations, total] = await Promise.all([
      Evaluation.find(filter).sort(sortObj).skip(parseInt(skip)).limit(parseInt(limit)).lean(),
      Evaluation.countDocuments(filter),
    ]);

    return { evaluations, total };
  }

  async getEvaluationById(id) {
    return Evaluation.findById(id).lean();
  }

  async getEvaluationStats(query = {}) {
    const { startDate, endDate, type } = query;
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (type) filter.type = type;

    const stats = await Evaluation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          avgScore: { $avg: "$score" },
          minScore: { $min: "$score" },
          maxScore: { $max: "$score" },
          passCount: { $sum: { $cond: ["$passed", 1, 0] } },
          failCount: { $sum: { $cond: [{ $not: "$passed" }, 1, 0] } },
        },
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          avgScore: { $round: ["$avgScore", 4] },
          minScore: { $round: ["$minScore", 4] },
          maxScore: { $round: ["$maxScore", 4] },
          passCount: 1,
          failCount: 1,
          passRate: {
            $round: [{ $multiply: [{ $divide: ["$passCount", { $max: ["$count", 1] }] }, 100] }, 2],
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totals = stats.reduce(
      (acc, s) => ({
        totalEvaluations: acc.totalEvaluations + s.count,
        avgScore: acc.avgScore + s.avgScore * s.count,
        totalPassed: acc.totalPassed + s.passCount,
      }),
      { totalEvaluations: 0, avgScore: 0, totalPassed: 0 }
    );

    return {
      byType: stats,
      summary: {
        totalEvaluations: totals.totalEvaluations,
        overallAvgScore: totals.totalEvaluations > 0 ? Math.round((totals.avgScore / totals.totalEvaluations) * 10000) / 10000 : 0,
        overallPassRate: totals.totalEvaluations > 0 ? Math.round((totals.totalPassed / totals.totalEvaluations) * 10000) / 100 : 0,
      },
    };
  }

  async getEvaluationTrends(timeRange = "7d") {
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case "24h": startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case "7d": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "30d": startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const format = timeRange === "30d" ? "%Y-%m-%d" : "%Y-%m-%d";

    const trends = await Evaluation.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format, date: "$createdAt" } },
            type: "$type",
          },
          avgScore: { $avg: "$score" },
          count: { $sum: 1 },
          passCount: { $sum: { $cond: ["$passed", 1, 0] } },
        },
      },
      { $sort: { "_id.date": 1 } },
      {
        $group: {
          _id: "$_id.date",
          types: {
            $push: {
              type: "$_id.type",
              avgScore: { $round: ["$avgScore", 4] },
              count: "$count",
              passRate: {
                $round: [{ $multiply: [{ $divide: ["$passCount", { $max: ["$count", 1] }] }, 100] }, 2],
              },
            },
          },
          totalEvaluations: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          types: 1,
          totalEvaluations: 1,
          _id: 0,
        },
      },
    ]);

    return trends;
  }
}

module.exports = new EvaluationService();
