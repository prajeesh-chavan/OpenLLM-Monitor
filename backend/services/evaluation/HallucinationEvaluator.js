const BaseEvaluator = require("./BaseEvaluator");

class HallucinationEvaluator extends BaseEvaluator {
  constructor() {
    super("hallucination");
  }

  buildJudgePrompt(log) {
    return {
      system: `You are an expert LLM output evaluator. Your task is to detect hallucination in the model's response.

A hallucination is when the model generates information that is not supported by or contradicts the provided context, or makes up facts, figures, names, or events.

Evaluate the response and return a JSON object with:
- "score": a number between 0 and 1 where 1 = completely factually accurate (no hallucination), 0 = completely hallucinated
- "rationale": a brief explanation of your score
- "details": an array of objects, each with "dimension" (string), "score" (0-1), and "rationale" (string) for these dimensions:
  - "factual_accuracy": whether claims match known facts
  - "context_consistency": whether the response stays consistent with provided context
  - "invented_information": whether the model invented any information not present in the input`,

      user: `Evaluate the following LLM interaction for hallucination:

PROMPT:
${log.prompt || "(no prompt)"}

RESPONSE:
${log.completion || "(no response)"}

${log.systemMessage ? `SYSTEM MESSAGE:\n${log.systemMessage}\n` : ""}

Return ONLY a valid JSON object with "score", "rationale", and "details" array.`,
    };
  }

  getThresholds() {
    return { pass: 0.8, warn: 0.6 };
  }
}

module.exports = HallucinationEvaluator;
