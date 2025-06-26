const axios = require("axios");
const config = require("../config/env");
const retryHandler = require("../utils/retryHandler");

/**
 * Gemini service wrapper for Google Gemini API
 */
class GeminiService {
  constructor() {
    this.baseUrl =
      config.providers.gemini.baseUrl ||
      "https://generativelanguage.googleapis.com/v1beta/models";
    this.apiKey = config.providers.gemini.apiKey;
    this.defaultModel = "gemini-pro";
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000,
    });
    this.retryConfig = retryHandler.getProviderRetryConfig("gemini");
  }

  async sendPrompt(params) {
    const {
      prompt,
      model = this.defaultModel,
      systemMessage = "",
      temperature = 0.7,
      maxTokens = 1024,
      requestId,
    } = params;
    const startTime = Date.now();
    try {
      const requestBody = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      };
      const url = `/${model}:generateContent?key=${this.apiKey}`;
      const { result, retryHistory } = await retryHandler.executeWithRetry(
        async () => {
          const response = await this.client.post(url, requestBody);
          return response.data;
        },
        this.retryConfig
      );
      const endTime = Date.now();
      const latency = endTime - startTime;
      const completion =
        result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return {
        requestId,
        provider: "gemini",
        model,
        prompt,
        completion,
        systemMessage,
        parameters: { temperature, maxTokens },
        tokenUsage: {},
        cost: {},
        latency,
        retryHistory,
        status: "success",
        rawResponse: result,
        finishReason: result.candidates?.[0]?.finishReason || "stop",
      };
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;
      return {
        requestId,
        provider: "gemini",
        model,
        prompt,
        completion: "",
        systemMessage,
        parameters: { temperature, maxTokens },
        tokenUsage: {},
        cost: {},
        latency,
        retryHistory: error.retryHistory || [],
        status: "error",
        error: {
          message: error.message,
          code: error.code || error.response?.status,
          details: error.response?.data || {},
        },
      };
    }
  }

  async listModels() {
    try {
      const url = `/list?key=${this.apiKey}`;
      const response = await this.client.get(url);
      return (
        response.data.models?.map((model) => ({
          id: model.name,
          name: model.displayName || model.name,
        })) || []
      );
    } catch (error) {
      return [];
    }
  }

  async testConnection() {
    try {
      const models = await this.listModels();
      return models.length > 0;
    } catch {
      return false;
    }
  }

  updateApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  updateBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
    this.client.defaults.baseURL = baseUrl;
  }
}

module.exports = GeminiService;
