const axios = require("axios");
const config = require("../config/env");
const tokenCounter = require("../utils/tokenCounter");
const costEstimator = require("../utils/costEstimator");
const retryHandler = require("../utils/retryHandler");

/**
 * OpenAI service wrapper
 */
class OpenAIService {
  constructor() {
    this.baseUrl = config.providers.openai.baseUrl;
    this.apiKey = config.providers.openai.apiKey;
    this.defaultModel = "gpt-3.5-turbo";

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "OpenLLM-Monitor/1.0",
      },
      timeout: 60000, // 60 seconds
    });

    // Get provider-specific retry config
    this.retryConfig = retryHandler.getProviderRetryConfig("openai");
  }

  /**
   * Send a prompt to OpenAI
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response with metadata
   */
  async sendPrompt(params) {
    const {
      prompt,
      model = this.defaultModel,
      systemMessage = "",
      temperature = 1.0,
      maxTokens = null,
      topP = 1.0,
      frequencyPenalty = 0,
      presencePenalty = 0,
      stop = null,
      stream = false,
      requestId,
    } = params;

    const startTime = Date.now();

    try {
      // Prepare messages
      const messages = [];

      if (systemMessage) {
        messages.push({ role: "system", content: systemMessage });
      }

      messages.push({ role: "user", content: prompt });

      // Count prompt tokens
      const promptTokens = tokenCounter.countChatTokens(messages, model);

      // Prepare request body
      const requestBody = {
        model,
        messages,
        temperature,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        stream,
      };

      if (maxTokens) {
        requestBody.max_tokens = maxTokens;
      }

      if (stop) {
        requestBody.stop = Array.isArray(stop) ? stop : [stop];
      }

      // Execute with retry logic
      const { result, retryHistory } = await retryHandler.executeWithRetry(
        async () => {
          const response = await this.client.post(
            "/chat/completions",
            requestBody
          );
          return response.data;
        },
        this.retryConfig
      );

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Extract response data
      const completion = result.choices[0]?.message?.content || "";
      const usage = result.usage || {};

      // Validate and normalize token usage
      const tokenUsage = tokenCounter.validateUsage({
        promptTokens: usage.prompt_tokens || promptTokens,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      });

      // Calculate cost
      const cost = costEstimator.calculateCost({
        provider: "openai",
        model,
        promptTokens: tokenUsage.promptTokens,
        completionTokens: tokenUsage.completionTokens,
      });

      return {
        requestId,
        provider: "openai",
        model,
        prompt,
        completion,
        systemMessage,
        parameters: {
          temperature,
          maxTokens,
          topP,
          frequencyPenalty,
          presencePenalty,
          stop,
        },
        tokenUsage,
        cost,
        latency,
        retryHistory,
        status: "success",
        rawResponse: result,
        finishReason: result.choices[0]?.finish_reason,
      };
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;

      return {
        requestId,
        provider: "openai",
        model,
        prompt,
        completion: "",
        systemMessage,
        parameters: {
          temperature,
          maxTokens,
          topP,
          frequencyPenalty,
          presencePenalty,
          stop,
        },
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        cost: {
          promptCost: 0,
          completionCost: 0,
          totalCost: 0,
          currency: "USD",
        },
        latency,
        retryHistory: error.retryHistory || [],
        status: this.getErrorStatus(error),
        error: {
          message: error.message,
          code: error.code || error.response?.status,
          details: error.response?.data || {},
        },
      };
    }
  }

  /**
   * Stream chat completion
   * @param {Object} params - Request parameters
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<Object>} Final response
   */
  async streamCompletion(params, onChunk) {
    const streamParams = { ...params, stream: true };

    // For streaming, we'll use a different approach
    // This is a simplified version - full implementation would use Server-Sent Events
    const response = await this.sendPrompt(streamParams);

    // Simulate streaming by calling onChunk with the full response
    if (onChunk && response.completion) {
      onChunk({
        content: response.completion,
        finishReason: response.finishReason,
        timestamp: new Date(),
      });
    }

    return response;
  }

  /**
   * List available models
   * @returns {Promise<Array>} List of available models
   */
  async listModels() {
    try {
      const response = await this.client.get("/models");
      return response.data.data
        .filter(
          (model) => model.id.includes("gpt") || model.id.includes("text-")
        )
        .map((model) => ({
          id: model.id,
          object: model.object,
          created: model.created,
          ownedBy: model.owned_by,
        }));
    } catch (error) {
      console.error("Error listing OpenAI models:", error.message);
      return [];
    }
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      await this.client.get("/models");
      return true;
    } catch (error) {
      console.error("OpenAI connection test failed:", error.message);
      return false;
    }
  }

  /**
   * Get error status from error object
   * @param {Error} error - Error object
   * @returns {string} Status string
   */
  getErrorStatus(error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 429) return "rate_limited";
      if (status >= 500) return "error";
      if (status === 408) return "timeout";
    }

    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return "timeout";
    }

    return "error";
  }

  /**
   * Estimate tokens for a prompt
   * @param {string} prompt - Prompt text
   * @param {string} model - Model name
   * @returns {number} Estimated token count
   */
  estimateTokens(prompt, model = this.defaultModel) {
    return tokenCounter.countTokens(prompt, model);
  }

  /**
   * Get model information
   * @param {string} model - Model name
   * @returns {Object} Model information
   */
  getModelInfo(model) {
    const modelInfo = {
      "gpt-4": {
        maxTokens: 8192,
        contextWindow: 8192,
        type: "chat",
        description: "Most capable GPT-4 model",
      },
      "gpt-4-32k": {
        maxTokens: 32768,
        contextWindow: 32768,
        type: "chat",
        description: "GPT-4 with extended context",
      },
      "gpt-4-turbo": {
        maxTokens: 4096,
        contextWindow: 128000,
        type: "chat",
        description: "Latest GPT-4 Turbo model",
      },
      "gpt-3.5-turbo": {
        maxTokens: 4096,
        contextWindow: 4096,
        type: "chat",
        description: "Fast and efficient chat model",
      },
      "gpt-3.5-turbo-16k": {
        maxTokens: 16384,
        contextWindow: 16384,
        type: "chat",
        description: "GPT-3.5 with extended context",
      },
    };

    return (
      modelInfo[model] || {
        maxTokens: 4096,
        contextWindow: 4096,
        type: "unknown",
        description: "Unknown model",
      }
    );
  }

  /**
   * Update API key
   * @param {string} apiKey - New API key
   */
  updateApiKey(apiKey) {
    this.apiKey = apiKey;
    this.client.defaults.headers["Authorization"] = `Bearer ${apiKey}`;
  }
}

module.exports = OpenAIService;
