const mongoose = require("mongoose");

/**
 * Log schema for storing LLM request/response data
 */
const logSchema = new mongoose.Schema(
  {
    // Request Information
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Provider & Model
    provider: {
      type: String,
      required: true,
      enum: ["openai", "openrouter", "mistral", "ollama"],
      index: true,
    },

    model: {
      type: String,
      required: true,
      index: true,
    },

    // Prompt & Response
    prompt: {
      type: String,
      required: true,
    },

    completion: {
      type: String,
      default: "",
    },

    // System message (if any)
    systemMessage: {
      type: String,
      default: "",
    },

    // Request Parameters
    parameters: {
      temperature: { type: Number, default: 1.0 },
      maxTokens: { type: Number, default: null },
      topP: { type: Number, default: 1.0 },
      frequencyPenalty: { type: Number, default: 0 },
      presencePenalty: { type: Number, default: 0 },
      stop: [String],
    },

    // Performance Metrics
    latency: {
      type: Number, // milliseconds
      required: true,
      index: true,
    },

    // Token Usage
    tokenUsage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },

    // Cost Estimation
    cost: {
      promptCost: { type: Number, default: 0 },
      completionCost: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },

    // Request Status
    status: {
      type: String,
      required: true,
      enum: ["success", "error", "timeout", "rate_limited"],
      index: true,
    },

    // Error Information
    error: {
      message: String,
      code: String,
      details: mongoose.Schema.Types.Mixed,
    },

    // Retry Information
    retryAttempts: {
      type: Number,
      default: 0,
    },

    retryHistory: [
      {
        attempt: Number,
        timestamp: Date,
        error: String,
        latency: Number,
      },
    ],

    // Metadata
    userAgent: String,
    ipAddress: String,
    userId: String, // For multi-user support later

    // Streaming Information
    isStreaming: {
      type: Boolean,
      default: false,
    },

    streamChunks: [
      {
        timestamp: Date,
        content: String,
        finishReason: String,
      },
    ],

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
logSchema.index({ createdAt: -1 });
logSchema.index({ provider: 1, model: 1 });
logSchema.index({ status: 1, createdAt: -1 });
logSchema.index({ "tokenUsage.totalTokens": -1 });
logSchema.index({ "cost.totalCost": -1 });

// Virtual for total request time including retries
logSchema.virtual("totalRequestTime").get(function () {
  return (
    this.latency +
    (this.retryHistory?.reduce((acc, retry) => acc + retry.latency, 0) || 0)
  );
});

// Method to calculate success rate
logSchema.statics.getSuccessRate = async function (timeframe = 24) {
  const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);

  const stats = await this.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: {
          $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
        },
      },
    },
  ]);

  if (stats.length === 0) return 0;
  return (stats[0].successful / stats[0].total) * 100;
};

// Method to get provider statistics
logSchema.statics.getProviderStats = async function (timeframe = 24) {
  const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);

  return await this.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: "$provider",
        count: { $sum: 1 },
        avgLatency: { $avg: "$latency" },
        totalCost: { $sum: "$cost.totalCost" },
        totalTokens: { $sum: "$tokenUsage.totalTokens" },
        successRate: {
          $avg: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Method to get cost analysis
logSchema.statics.getCostAnalysis = async function (timeframe = 24) {
  const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);

  return await this.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          provider: "$provider",
          model: "$model",
        },
        totalCost: { $sum: "$cost.totalCost" },
        avgCostPerRequest: { $avg: "$cost.totalCost" },
        requestCount: { $sum: 1 },
        totalTokens: { $sum: "$tokenUsage.totalTokens" },
      },
    },
    { $sort: { totalCost: -1 } },
  ]);
};

// Pre-save middleware to update timestamps
logSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware
logSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model("Log", logSchema);
