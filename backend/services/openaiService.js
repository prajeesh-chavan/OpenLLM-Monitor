const axios = require("axios");
const config = require("../config/env");
const tokenCounter = require("../utils/tokenCounter");
const retryHandler = require("../utils/retryHandler");
const logger = require("../utils/logger");
const BaseProviderService = require("./BaseProviderService");

class OpenAIService extends BaseProviderService {
  constructor() {
    super("openai", {
      baseUrl: config.providers.openai.baseUrl,
      apiKey: config.providers.openai.apiKey,
      defaultModel: "gpt-3.5-turbo",
    });
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "OpenLLM-Monitor/1.0",
      },
      timeout: 60000,
    });
  }

  async sendPrompt(params) {
    const startTime = Date.now();
    try {
      const messages = [];
      if (params.systemMessage) messages.push({ role: "system", content: params.systemMessage });
      messages.push({ role: "user", content: params.prompt });

      const requestBody = {
        model: params.model || this.defaultModel,
        messages,
        temperature: params.temperature ?? 1.0,
        top_p: params.topP ?? 1.0,
        frequency_penalty: params.frequencyPenalty ?? 0,
        presence_penalty: params.presencePenalty ?? 0,
        stream: false,
      };
      if (params.maxTokens) requestBody.max_tokens = params.maxTokens;
      if (params.stop) requestBody.stop = Array.isArray(params.stop) ? params.stop : [params.stop];

      let actualApiLatency = 0;
      const { result, retryHistory } = await retryHandler.executeWithRetry(async () => {
        const apiStart = Date.now();
        const response = await this.client.post("/chat/completions", requestBody);
        actualApiLatency = Date.now() - apiStart;
        return response.data;
      }, this.retryConfig);

      const latency = actualApiLatency || (Date.now() - startTime);
      const completion = result.choices?.[0]?.message?.content || "";
      const usage = result.usage || {};

      return this.buildSendResult(
        params, completion,
        {
          promptTokens: usage.prompt_tokens || tokenCounter.countChatTokens(messages, params.model),
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
        },
        null, latency, retryHistory, result,
        result.choices?.[0]?.finish_reason
      );
    } catch (error) {
      return this.buildErrorResult(params, error, Date.now() - startTime);
    }
  }

  async streamCompletion(params, onChunk) {
    const response = await this.sendPrompt({ ...params, stream: true });
    if (onChunk && response.completion) {
      onChunk({ content: response.completion, finishReason: response.finishReason, timestamp: new Date() });
    }
    return response;
  }

  async listModels() {
    try {
      const response = await this.client.get("/models");
      return response.data.data
        .filter((m) => m.id.includes("gpt") || m.id.includes("text-"))
        .map((m) => ({ id: m.id, object: m.object, created: m.created, ownedBy: m.owned_by }));
    } catch (error) {
      logger.error({ err: error }, "Error listing OpenAI models");
      return [];
    }
  }

  updateApiKey(apiKey) {
    super.updateApiKey(apiKey);
    this.client.defaults.headers["Authorization"] = `Bearer ${apiKey}`;
  }

  getModelInfo(model) {
    const models = {
      "gpt-4": { maxTokens: 8192, contextWindow: 8192, type: "chat", description: "Most capable GPT-4 model" },
      "gpt-4-32k": { maxTokens: 32768, contextWindow: 32768, type: "chat", description: "GPT-4 with extended context" },
      "gpt-4-turbo": { maxTokens: 4096, contextWindow: 128000, type: "chat", description: "Latest GPT-4 Turbo model" },
      "gpt-3.5-turbo": { maxTokens: 4096, contextWindow: 4096, type: "chat", description: "Fast and efficient chat model" },
      "gpt-3.5-turbo-16k": { maxTokens: 16384, contextWindow: 16384, type: "chat", description: "GPT-3.5 with extended context" },
    };
    return models[model] || { maxTokens: 4096, contextWindow: 4096, type: "unknown", description: "Unknown model" };
  }
}

module.exports = OpenAIService;
