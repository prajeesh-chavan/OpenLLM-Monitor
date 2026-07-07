const BaseEvaluator = require("./BaseEvaluator");

class RelevanceEvaluator extends BaseEvaluator {
  constructor() {
    super("relevance");
  }

  buildJudgePrompt(log) {
    return {
      system: `You are an expert LLM output evaluator. Your task is to evaluate how relevant and useful the model's response is to the user's prompt/query.

Relevance measures:
1. Whether the response directly addresses the user's question/request
2. Whether the information provided is pertinent and useful
3. Whether the response stays on-topic without unnecessary digression

Return a JSON object with:
- "score": a number between 0 and 1 where 1 = highly relevant, 0 = completely irrelevant
- "rationale": a brief explanation of your score
- "details": an array of objects, each with "dimension" (string), "score" (0-1), and "rationale" (string) for:
  - "directness": how directly the response addresses the query
  - "completeness": whether the response covers the key aspects of the query
  - "focus": whether the response stays on-topic without digression`,

      user: `Evaluate relevance for this LLM interaction:

PROMPT:
${log.prompt || "(no prompt)"}

RESPONSE:
${log.completion || "(no response)"}

${log.systemMessage ? `SYSTEM MESSAGE:\n${log.systemMessage}\n` : ""}

Return ONLY a valid JSON object with "score", "rationale", and "details" array.`,
    };
  }

  getThresholds() {
    return { pass: 0.7, warn: 0.5 };
  }
}

module.exports = RelevanceEvaluator;
