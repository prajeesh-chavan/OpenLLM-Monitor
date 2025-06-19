const axios = require("axios");
const config = require("../config/env");
const tokenCounter = require("../utils/tokenCounter");
const costEstimator = require("../utils/costEstimator");
const retryHandler = require("../utils/retryHandler");

/**
 * OpenRouter service wrapper
 */
class OpenRouterService {
  constructor() {
    this.baseUrl = config.providers.openrouter.baseUrl;
    this.apiKey = config.providers.openrouter.apiKey;
    this.defaultModel = "openai/gpt-3.5-turbo";

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://openllm-monitor.com",
        "X-Title": "OpenLLM Monitor",
        "User-Agent": "OpenLLM-Monitor/1.0",
      },
      timeout: 60000, // 60 seconds
    });

    // Get provider-specific retry config
    this.retryConfig = retryHandler.getProviderRetryConfig("openrouter");
  }

  /**
   * Send a prompt to OpenRouter
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

      // Count prompt tokens (use OpenAI tokenizer as approximation)
      const promptTokens = tokenCounter.countChatTokens(
        messages,
        "gpt-3.5-turbo"
      );

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

      // Calculate cost using OpenRouter pricing
      const cost = costEstimator.calculateCost({
        provider: "openrouter",
        model,
        promptTokens: tokenUsage.promptTokens,
        completionTokens: tokenUsage.completionTokens,
      });

      return {
        requestId,
        provider: "openrouter",
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
        // OpenRouter specific fields
        generationId: result.id,
        modelInfo: result.model,
      };
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;

      return {
        requestId,
        provider: "openrouter",
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

    // Note: Full streaming implementation would use Server-Sent Events
    // This is a simplified version for the MVP
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
   * List available models from OpenRouter
   * @returns {Promise<Array>} List of available models
   */
  async listModels() {
    try {
      const response = await this.client.get("/models");
      return (
        response.data.data?.map((model) => ({
          id: model.id,
          name: model.name,
          description: model.description,
          pricing: model.pricing,
          contextLength: model.context_length,
          architecture: model.architecture,
          topProvider: model.top_provider,
        })) || []
      );
    } catch (error) {
      console.error("Error listing OpenRouter models:", error.message);
      return [];
    }
  }

  /**
   * Get model information
   * @param {string} modelId - Model ID
   * @returns {Promise<Object>} Model information
   */
  async getModelInfo(modelId) {
    try {
      const models = await this.listModels();
      return models.find((model) => model.id === modelId) || null;
    } catch (error) {
      console.error("Error getting model info:", error.message);
      return null;
    }
  }

  /**
   * Get account usage/credits
   * @returns {Promise<Object>} Account information
   */
  async getAccountInfo() {
    try {
      const response = await this.client.get("/auth/key");
      return {
        label: response.data.label,
        usage: response.data.usage,
        limit: response.data.limit,
        isFreeTier: response.data.is_free_tier,
        rateLimit: response.data.rate_limit,
      };
    } catch (error) {
      console.error("Error getting OpenRouter account info:", error.message);
      return null;
    }
  }

  /**
   * Get generation info for a specific generation
   * @param {string} generationId - Generation ID
   * @returns {Promise<Object>} Generation information
   */
  async getGenerationInfo(generationId) {
    try {
      const response = await this.client.get(`/generation?id=${generationId}`);
      return {
        id: response.data.id,
        model: response.data.model,
        streamed: response.data.streamed,
        generation_time: response.data.generation_time,
        created_at: response.data.created_at,
        usage: response.data.usage,
        cost: response.data.cost,
      };
    } catch (error) {
      console.error("Error getting generation info:", error.message);
      return null;
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
      console.error("OpenRouter connection test failed:", error.message);
      return false;
    }
  }

  /**
   * Get popular models
   * @returns {Promise<Array>} List of popular models
   */
  async getPopularModels() {
    try {
      const models = await this.listModels();

      // Filter and sort by popularity (based on pricing and context length)
      const popularModels = [
        "openai/gpt-4",
        "openai/gpt-4-turbo",
        "openai/gpt-3.5-turbo",
        "anthropic/claude-2",
        "meta-llama/llama-2-70b-chat",
        "mistralai/mistral-7b-instruct",
        "google/palm-2-chat-bison",
      ];

      return models
        .filter((model) =>
          popularModels.some((popular) => model.id.includes(popular))
        )
        .slice(0, 10);
    } catch (error) {
      console.error("Error getting popular models:", error.message);
      return [];
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
      if (status === 402) return "error"; // Payment required
      if (status === 401) return "error"; // Unauthorized
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
    // Use OpenAI tokenizer as approximation for most models
    return tokenCounter.countTokens(prompt, "gpt-3.5-turbo");
  }

  /**
   * Get cost estimate for a request
   * @param {Object} params - Request parameters
   * @returns {Object} Cost estimate
   */
  getCostEstimate(params) {
    const { model, promptTokens, estimatedCompletionTokens = 0 } = params;

    return costEstimator.estimateCost({
      provider: "openrouter",
      model,
      promptTokens,
      estimatedCompletionTokens,
    });
  }

  /**
   * Update API key
   * @param {string} apiKey - New API key
   */
  updateApiKey(apiKey) {
    this.apiKey = apiKey;
    this.client.defaults.headers["Authorization"] = `Bearer ${apiKey}`;
  }

  /**
   * Set custom headers for requests
   * @param {Object} headers - Headers to set
   */
  setCustomHeaders(headers) {
    Object.assign(this.client.defaults.headers, headers);
  }

  /**
   * Get supported model categories
   * @returns {Array} List of model categories
   */
  getModelCategories() {
    return ["Chat", "Completion", "Code", "Image", "Embedding", "Moderation"];
  }

  /**
   * Filter models by category
   * @param {Array} models - List of models
   * @param {string} category - Category to filter by
   * @returns {Array} Filtered models
   */
  filterModelsByCategory(models, category) {
    const categoryKeywords = {
      chat: ["chat", "instruct", "turbo"],
      code: ["code", "codex"],
      completion: ["davinci", "curie", "babbage", "ada"],
      image: ["dall-e", "midjourney", "stable-diffusion"],
      embedding: ["embedding", "similarity"],
      moderation: ["moderation"],
    };

    const keywords = categoryKeywords[category.toLowerCase()] || [];

    return models.filter((model) =>
      keywords.some(
        (keyword) =>
          model.id.toLowerCase().includes(keyword) ||
          model.name.toLowerCase().includes(keyword)
      )
    );
  }
}

module.exports = OpenRouterService;
