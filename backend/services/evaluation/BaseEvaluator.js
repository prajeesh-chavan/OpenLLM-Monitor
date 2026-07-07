const logger = require("../../utils/logger");

class BaseEvaluator {
  constructor(type) {
    this.type = type;
    this.judgeModel = null;
    this.temperature = 0.1;
  }

  buildJudgePrompt(log) {
    throw new Error(`buildJudgePrompt() not implemented for ${this.type}`);
  }

  parseResponse(raw) {
    try {
      if (typeof raw === "string") {
        return JSON.parse(raw);
      }
      return raw;
    } catch {
      const scoreMatch = raw.match(/"score"\s*:\s*([0-9.]+)/i);
      const rationaleMatch = raw.match(/"rationale"\s*:\s*"([^"]+)"/i);
      return {
        score: scoreMatch ? parseFloat(scoreMatch[1]) : 0.5,
        rationale: rationaleMatch ? rationaleMatch[1] : raw.slice(0, 500),
      };
    }
  }

  getThresholds() {
    return { pass: 0.7, warn: 0.5 };
  }

  getLabel() {
    return this.type.charAt(0).toUpperCase() + this.type.slice(1);
  }
}

module.exports = BaseEvaluator;
