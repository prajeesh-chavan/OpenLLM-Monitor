const axios = require("axios");
const config = require("../config/env");
const retryHandler = require("../utils/retryHandler");
const BaseProviderService = require("./BaseProviderService");

class GrokService extends BaseProviderService {
  constructor() {
    super("grok", {
      baseUrl: config.providers.grok.baseUrl || "https://api.grok.x.ai/v1",
      apiKey: config.providers.grok.apiKey,
      defaultModel: "grok-1",
    });
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 60000,
    });
  }

  async sendPrompt(params) {
    const startTime = Date.now();
    try {
      const requestBody = {
        model: params.model || this.defaultModel,
        messages: [
          ...(params.systemMessage ? [{ role: "system", content: params.systemMessage }] : []),
          { role: "user", content: params.prompt },
        ],
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens || 1024,
      };
      const { result, retryHistory } = await retryHandler.executeWithRetry(
        async () => {
          const response = await this.client.post("/chat/completions", requestBody);
          return response.data;
        },
        this.retryConfig
      );
      const latency = Date.now() - startTime;
      const completion = result.choices?.[0]?.message?.content || "";
      const usage = result.usage || {};
      return this.buildSendResult(
        params, completion, usage, null, latency, retryHistory, result,
        result.choices?.[0]?.finish_reason || "stop"
      );
    } catch (error) {
      return this.buildErrorResult(params, error, Date.now() - startTime);
    }
  }

  async listModels() {
    try {
      const response = await this.client.get("/models");
      return response.data.data?.map((model) => ({ id: model.id, name: model.id })) || [];
    } catch {
      return [];
    }
  }

  updateApiKey(apiKey) {
    super.updateApiKey(apiKey);
    this.client.defaults.headers["Authorization"] = `Bearer ${apiKey}`;
  }

  updateBaseUrl(baseUrl) {
    super.updateBaseUrl(baseUrl);
    this.client.defaults.baseURL = this.baseUrl;
  }
}

module.exports = GrokService;
