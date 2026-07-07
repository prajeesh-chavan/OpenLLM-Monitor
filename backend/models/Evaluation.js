const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Log",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["hallucination", "faithfulness", "relevance", "toxicity", "custom"],
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    passed: {
      type: Boolean,
      required: true,
    },

    rationale: {
      type: String,
      default: "",
    },

    details: [
      {
        dimension: { type: String, required: true },
        score: { type: Number, required: true },
        rationale: { type: String, default: "" },
      },
    ],

    evaluatorConfig: {
      judgeModel: { type: String },
      temperature: { type: Number },
      promptTemplate: { type: String },
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

evaluationSchema.index({ logId: 1, type: 1 });
evaluationSchema.index({ type: 1, score: -1 });
evaluationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Evaluation", evaluationSchema);
