const axios = require("axios");
const { estimateCost } = require("../utils/costEstimator");
const { countTokens } = require("../utils/tokenCounter");

/**
 * Mistral AI Service
 * Handles interactions with Mistral AI API
 */
class MistralService {
  constructor() {
    this.baseURL = "https://api.mistral.ai/v1";
    this.models = [
      "mistral-tiny",
      "mistral-small",
      "mistral-medium",
      "mistral-large-latest",
      "open-mistral-7b",
      "open-mixtral-8x7b",
      "open-mixtral-8x22b",
    ];
  }

  /**
   * Test connection to Mistral AI
   */
  async testConnection(apiKey) {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      return {
        success: true,
        models: response.data.data?.map((model) => model.id) || this.models,
        message: "Connected successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        message: "Connection failed",
      };
    }
  }

  /**
   * Make a chat completion request
   */
  async chatCompletion(params, apiKey) {
    const startTime = Date.now();

    try {
      // Prepare request
      const requestBody = {
        model: params.model || "mistral-small",
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.max_tokens,
        top_p: params.top_p,
        stream: params.stream || false,
        safe_prompt: params.safe_prompt ?? false,
      };

      // Remove undefined values
      Object.keys(requestBody).forEach((key) => {
        if (requestBody[key] === undefined) {
          delete requestBody[key];
        }
      });

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 120000, // 2 minutes timeout
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Calculate token usage
      const promptText = params.messages.map((m) => m.content).join(" ");
      const completionText = response.data.choices?.[0]?.message?.content || "";

      const promptTokens = countTokens(promptText, params.model);
      const completionTokens = countTokens(completionText, params.model);
      const totalTokens = promptTokens + completionTokens;

      // Calculate cost
      const cost = estimateCost(
        promptTokens,
        completionTokens,
        params.model,
        "mistral"
      );

      return {
        success: true,
        response: response.data,
        metadata: {
          duration,
          tokenUsage: {
            prompt: promptTokens,
            completion: completionTokens,
            total: totalTokens,
          },
          cost,
          model: params.model,
          provider: "mistral",
        },
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message,
          type: error.response?.data?.type || "api_error",
          code: error.response?.status || 500,
        },
        metadata: {
          duration,
          model: params.model,
          provider: "mistral",
        },
      };
    }
  }

  /**
   * Get available models
   */
  async getModels(apiKey) {
    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return {
        success: true,
        models:
          response.data.data?.map((model) => ({
            id: model.id,
            name: model.id,
            description: model.description || "",
            contextLength: model.max_context_length || 32000,
          })) || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        models: this.models.map((id) => ({
          id,
          name: id,
          description: "Default model",
        })),
      };
    }
  }

  /**
   * Stream chat completion (for future implementation)
   */
  async streamChatCompletion(params, apiKey, onChunk) {
    // Implementation for streaming responses
    // This would use Server-Sent Events or WebSocket
    throw new Error("Streaming not yet implemented for Mistral");
  }
}

module.exports = new MistralService();
