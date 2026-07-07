const config = {
  defaultJudgeModel: "gemini/gemini-2.0-flash",
  fallbackJudgeModel: "openai/gpt-4o-mini",
  defaultTemperature: 0.1,
  enabledEvaluators: ["hallucination", "faithfulness", "relevance", "toxicity"],
  thresholds: {
    hallucination: { pass: 0.8, warn: 0.6 },
    faithfulness: { pass: 0.8, warn: 0.6 },
    relevance: { pass: 0.7, warn: 0.5 },
    toxicity: { pass: 0.9, warn: 0.7 },
  },
  autoEvaluate: true,
  maxPromptLength: 8000,
  maxResponseLength: 8000,
  timeout: 30000,
};

module.exports = config;
