const tokenCounter = require("../utils/tokenCounter");
const costEstimator = require("../utils/costEstimator");
const retryHandler = require("../utils/retryHandler");
const logger = require("../utils/logger");

class BaseProviderService {
  constructor(providerName, config) {
    this.providerName = providerName;
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel || "default";
    this.retryConfig = retryHandler.getProviderRetryConfig(providerName);
  }

  buildSendResult(params, completion, tokenUsage, cost, latency, retryHistory, rawResponse, finishReason) {
    return {
      requestId: params.requestId,
      provider: this.providerName,
      model: params.model || this.defaultModel,
      prompt: params.prompt,
      completion: completion || "",
      systemMessage: params.systemMessage || "",
      parameters: {
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        topP: params.topP,
        frequencyPenalty: params.frequencyPenalty,
        presencePenalty: params.presencePenalty,
        stop: params.stop,
      },
      tokenUsage: tokenCounter.validateUsage(tokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 }),
      cost: cost || costEstimator.calculateCost({
        provider: this.providerName,
        model: params.model || this.defaultModel,
        promptTokens: tokenUsage?.promptTokens || 0,
        completionTokens: tokenUsage?.completionTokens || 0,
      }),
      latency,
      retryHistory: retryHistory || [],
      status: "success",
      rawResponse: rawResponse || {},
      finishReason: finishReason || "stop",
    };
  }

  buildErrorResult(params, error, latency) {
    return {
      requestId: params.requestId,
      provider: this.providerName,
      model: params.model || this.defaultModel,
      prompt: params.prompt,
      completion: "",
      systemMessage: params.systemMessage || "",
      parameters: {
        temperature: params.temperature,
        maxTokens: params.maxTokens,
      },
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      cost: { promptCost: 0, completionCost: 0, totalCost: 0, currency: "USD" },
      latency,
      retryHistory: error.retryHistory || [],
      status: "error",
      error: {
        message: error.message,
        code: error.code || error.response?.status || "UNKNOWN",
        details: error.response?.data || {},
      },
    };
  }

  getErrorStatus(error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 429) return "rate_limited";
      if (status >= 500) return "error";
      if (status === 408) return "timeout";
    }
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) return "timeout";
    return "error";
  }

  async sendPrompt(params) {
    throw new Error(`sendPrompt() not implemented for ${this.providerName}`);
  }

  async streamCompletion(params, onChunk) {
    throw new Error(`streamCompletion() not implemented for ${this.providerName}`);
  }

  async listModels() {
    return [];
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
  }

  estimateTokens(text, model) {
    return tokenCounter.countTokens(text, model || this.defaultModel);
  }
}

module.exports = BaseProviderService;
