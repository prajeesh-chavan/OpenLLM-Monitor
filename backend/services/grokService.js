const axios = require("axios");
const config = require("../config/env");
const retryHandler = require("../utils/retryHandler");

/**
 * Grok service wrapper for xAI Grok API
 */
class GrokService {
  constructor() {
    this.baseUrl = config.providers.grok.baseUrl || "https://api.grok.x.ai/v1";
    this.apiKey = config.providers.grok.apiKey;
    this.defaultModel = "grok-1";
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 60000,
    });
    this.retryConfig = retryHandler.getProviderRetryConfig("grok");
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
        model,
        messages: [
          ...(systemMessage
            ? [{ role: "system", content: systemMessage }]
            : []),
          { role: "user", content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      };
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
      const completion = result.choices?.[0]?.message?.content || "";
      return {
        requestId,
        provider: "grok",
        model,
        prompt,
        completion,
        systemMessage,
        parameters: { temperature, maxTokens },
        tokenUsage: result.usage || {},
        cost: {},
        latency,
        retryHistory,
        status: "success",
        rawResponse: result,
        finishReason: result.choices?.[0]?.finish_reason || "stop",
      };
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;
      return {
        requestId,
        provider: "grok",
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
      const response = await this.client.get("/models");
      return (
        response.data.data?.map((model) => ({
          id: model.id,
          name: model.id,
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
    this.client.defaults.headers["Authorization"] = `Bearer ${apiKey}`;
  }

  updateBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
    this.client.defaults.baseURL = baseUrl;
  }
}

module.exports = GrokService;
