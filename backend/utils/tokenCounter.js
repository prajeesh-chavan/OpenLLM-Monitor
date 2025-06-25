const { encoding_for_model, get_encoding } = require("tiktoken");

/**
 * Token counter utility for different LLM providers
 */
class TokenCounter {
  constructor() {
    this.encodings = new Map();
    this.llamaTokenizer = null; // Cache for llama-tokenizer-js instance
    this.llamaTokenizerLoading = null; // Promise for loading
  }

  /**
   * Get encoding for a specific model
   * @param {string} model - Model name
   * @returns {Object} Encoding object
   */
  getEncoding(model) {
    if (this.encodings.has(model)) {
      return this.encodings.get(model);
    }

    let encoding;
    try {
      // Try to get model-specific encoding
      encoding = encoding_for_model(model);
    } catch (error) {
      // Fallback to cl100k_base for unknown models
      console.warn(`Unknown model ${model}, using cl100k_base encoding`);
      encoding = get_encoding("cl100k_base");
    }

    this.encodings.set(model, encoding);
    return encoding;
  }

  /**
   * Count tokens in text for a specific model
   * @param {string} text - Text to count tokens for
   * @param {string} model - Model name
   * @returns {number} Token count
   */
  countTokens(text, model = "gpt-3.5-turbo") {
    if (!text || typeof text !== "string") {
      return 0;
    }

    try {
      const encoding = this.getEncoding(model);
      const tokens = encoding.encode(text);
      return tokens.length;
    } catch (error) {
      console.error("Error counting tokens:", error);
      // Fallback: rough estimation (1 token ≈ 4 characters)
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * Count tokens for chat messages (includes message formatting overhead)
   * @param {Array} messages - Array of message objects
   * @param {string} model - Model name
   * @returns {number} Token count
   */
  countChatTokens(messages, model = "gpt-3.5-turbo") {
    if (!Array.isArray(messages)) {
      return 0;
    }

    let totalTokens = 0;

    // Add tokens for each message
    messages.forEach((message) => {
      if (message.content) {
        totalTokens += this.countTokens(message.content, model);
      }

      // Add overhead for message formatting
      // Each message has role, content, and formatting tokens
      totalTokens += 4; // <|start|>assistant<|message|>content<|end|>

      if (message.role) {
        totalTokens += this.countTokens(message.role, model);
      }

      if (message.name) {
        totalTokens += this.countTokens(message.name, model);
      }
    });

    // Add conversation-level overhead
    totalTokens += 3; // conversation priming tokens

    return totalTokens;
  }

  /**
   * Estimate token count for Ollama models using llama-tokenizer-js (dynamic import for ESM)
   * @param {string} text - Text to estimate
   * @returns {Promise<number>} Accurate token count
   */
  async estimateOllamaTokens(text) {
    if (!text || typeof text !== "string") {
      return 0;
    }
    try {
      if (!this.llamaTokenizer) {
        if (!this.llamaTokenizerLoading) {
          this.llamaTokenizerLoading = import("llama-tokenizer-js").then(
            (mod) => {
              this.llamaTokenizer = new mod.LlamaTokenizer();
              return this.llamaTokenizer;
            }
          );
        }
        await this.llamaTokenizerLoading;
      }
      const tokens = this.llamaTokenizer.encode(text);
      return tokens.length;
    } catch (error) {
      console.error(
        "Error in llama-tokenizer-js for Ollama token count:",
        error
      );
      // Fallback: rough estimation (1 token ≈ 3.5 characters)
      return Math.ceil(text.length / 3.5);
    }
  }

  /**
   * Get token count based on provider
   * @param {string} text - Text to count
   * @param {string} provider - Provider name
   * @param {string} model - Model name
   * @returns {number|Promise<number>} Token count
   */
  async getTokenCount(text, provider, model) {
    switch (provider) {
      case "openai":
      case "openrouter":
        return this.countTokens(text, model);

      case "mistral":
        // Mistral uses similar tokenization to OpenAI
        return this.countTokens(text, "gpt-3.5-turbo");

      case "ollama":
        return await this.estimateOllamaTokens(text); // Now uses llama-tokenizer-js

      default:
        return this.countTokens(text, "gpt-3.5-turbo");
    }
  }

  /**
   * Calculate completion tokens from total and prompt tokens
   * @param {number} promptTokens - Prompt token count
   * @param {number} totalTokens - Total token count
   * @returns {number} Completion tokens
   */
  calculateCompletionTokens(promptTokens, totalTokens) {
    return Math.max(0, totalTokens - promptTokens);
  }

  /**
   * Validate token usage object
   * @param {Object} usage - Token usage object
   * @returns {Object} Validated usage object
   */
  validateUsage(usage) {
    const validated = {
      promptTokens: parseInt(usage.promptTokens) || 0,
      completionTokens: parseInt(usage.completionTokens) || 0,
      totalTokens: parseInt(usage.totalTokens) || 0,
    };

    // Ensure total is sum of prompt and completion
    if (
      validated.totalTokens === 0 &&
      (validated.promptTokens > 0 || validated.completionTokens > 0)
    ) {
      validated.totalTokens =
        validated.promptTokens + validated.completionTokens;
    }

    return validated;
  }

  /**
   * Clean up encodings to free memory
   */
  cleanup() {
    this.encodings.forEach((encoding) => {
      try {
        encoding.free();
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    this.encodings.clear();
  }
}

module.exports = new TokenCounter();
