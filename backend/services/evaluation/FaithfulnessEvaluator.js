const BaseEvaluator = require("./BaseEvaluator");

class FaithfulnessEvaluator extends BaseEvaluator {
  constructor() {
    super("faithfulness");
  }

  buildJudgePrompt(log) {
    return {
      system: `You are an expert LLM output evaluator. Your task is to evaluate how faithful the model's response is to the provided context or instructions.

Faithfulness measures whether the response stays true to:
1. The system instructions/prompt constraints
2. The factual information provided in the prompt
3. The intended task and requirements

A faithful response follows instructions accurately and doesn't add unsupported claims.

Return a JSON object with:
- "score": a number between 0 and 1 where 1 = completely faithful, 0 = completely unfaithful
- "rationale": a brief explanation of your score
- "details": an array of objects, each with "dimension" (string), "score" (0-1), and "rationale" (string) for:
  - "instruction_adherence": whether the response follows the given instructions
  - "factual_support": whether claims are supported by the provided context
  - "output_format": whether the response matches the requested format`,

      user: `Evaluate faithfulness for this LLM interaction:

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

module.exports = FaithfulnessEvaluator;
