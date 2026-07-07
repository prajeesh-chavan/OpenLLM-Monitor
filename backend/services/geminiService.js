const axios = require("axios");
const config = require("../config/env");
const retryHandler = require("../utils/retryHandler");
const tokenCounter = require("../utils/tokenCounter");
const BaseProviderService = require("./BaseProviderService");

class GeminiService extends BaseProviderService {
  constructor() {
    super("gemini", {
      baseUrl: config.providers.gemini.baseUrl || "https://generativelanguage.googleapis.com/v1beta/models",
      apiKey: config.providers.gemini.apiKey,
      defaultModel: "gemini-pro",
    });
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    });
  }

  async sendPrompt(params) {
    const startTime = Date.now();
    try {
      const requestBody = {
        contents: [{ role: "user", parts: [{ text: params.prompt }] }],
        generationConfig: {
          temperature: params.temperature ?? 0.7,
          maxOutputTokens: params.maxTokens || 1024,
        },
      };
      const url = `/${params.model || this.defaultModel}:generateContent?key=${this.apiKey}`;
      const { result, retryHistory } = await retryHandler.executeWithRetry(
        async () => {
          const response = await this.client.post(url, requestBody);
          return response.data;
        },
        this.retryConfig
      );
      const latency = Date.now() - startTime;
      const completion = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const tokenUsage = {
        promptTokens: result.usageMetadata?.promptTokenCount || tokenCounter.countTokens(params.prompt, params.model),
        completionTokens: result.usageMetadata?.candidatesTokenCount || tokenCounter.countTokens(completion, params.model),
        totalTokens: result.usageMetadata?.totalTokenCount || 0,
      };
      tokenUsage.totalTokens = tokenUsage.totalTokens || tokenUsage.promptTokens + tokenUsage.completionTokens;
      return this.buildSendResult(
        params, completion, tokenUsage, null, latency, retryHistory, result,
        result.candidates?.[0]?.finishReason || "stop"
      );
    } catch (error) {
      return this.buildErrorResult(params, error, Date.now() - startTime);
    }
  }

  async listModels() {
    try {
      const url = `/list?key=${this.apiKey}`;
      const response = await this.client.get(url);
      return response.data.models?.map((model) => ({
        id: model.name,
        name: model.displayName || model.name,
      })) || [];
    } catch {
      return [];
    }
  }

  updateBaseUrl(baseUrl) {
    super.updateBaseUrl(baseUrl);
    this.client.defaults.baseURL = this.baseUrl;
  }
}

module.exports = GeminiService;
