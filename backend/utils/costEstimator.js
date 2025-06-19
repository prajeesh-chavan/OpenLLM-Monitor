/**
 * Cost estimation utility for different LLM providers
 */
class CostEstimator {
  constructor() {
    // Pricing data (USD per 1K tokens) - Updated as of 2024
    this.pricing = {
      openai: {
        "gpt-4": {
          prompt: 0.03,
          completion: 0.06,
        },
        "gpt-4-32k": {
          prompt: 0.06,
          completion: 0.12,
        },
        "gpt-4-turbo": {
          prompt: 0.01,
          completion: 0.03,
        },
        "gpt-4-turbo-preview": {
          prompt: 0.01,
          completion: 0.03,
        },
        "gpt-3.5-turbo": {
          prompt: 0.0015,
          completion: 0.002,
        },
        "gpt-3.5-turbo-16k": {
          prompt: 0.003,
          completion: 0.004,
        },
        "text-davinci-003": {
          prompt: 0.02,
          completion: 0.02,
        },
        "text-curie-001": {
          prompt: 0.002,
          completion: 0.002,
        },
        "text-babbage-001": {
          prompt: 0.0005,
          completion: 0.0005,
        },
        "text-ada-001": {
          prompt: 0.0004,
          completion: 0.0004,
        },
      },

      openrouter: {
        // OpenRouter pricing varies by model - these are examples
        "openai/gpt-4": {
          prompt: 0.03,
          completion: 0.06,
        },
        "openai/gpt-3.5-turbo": {
          prompt: 0.0015,
          completion: 0.002,
        },
        "anthropic/claude-2": {
          prompt: 0.008,
          completion: 0.024,
        },
        "meta-llama/llama-2-70b-chat": {
          prompt: 0.0007,
          completion: 0.0009,
        },
        "mistralai/mistral-7b-instruct": {
          prompt: 0.0002,
          completion: 0.0002,
        },
      },

      mistral: {
        "mistral-tiny": {
          prompt: 0.00025,
          completion: 0.00025,
        },
        "mistral-small": {
          prompt: 0.002,
          completion: 0.006,
        },
        "mistral-medium": {
          prompt: 0.0027,
          completion: 0.0081,
        },
        "mistral-large": {
          prompt: 0.008,
          completion: 0.024,
        },
      },

      // Ollama is free (local hosting), but we can estimate compute costs
      ollama: {
        default: {
          prompt: 0.0,
          completion: 0.0,
        },
      },
    };
  }

  /**
   * Get pricing for a specific model and provider
   * @param {string} provider - Provider name
   * @param {string} model - Model name
   * @returns {Object} Pricing object with prompt and completion rates
   */
  getPricing(provider, model) {
    const providerPricing = this.pricing[provider];
    if (!providerPricing) {
      console.warn(`Unknown provider: ${provider}`);
      return { prompt: 0, completion: 0 };
    }

    // Try exact model match first
    if (providerPricing[model]) {
      return providerPricing[model];
    }

    // Try to find similar model (partial match)
    const modelKeys = Object.keys(providerPricing);
    const similarModel = modelKeys.find(
      (key) =>
        model.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(model.toLowerCase())
    );

    if (similarModel) {
      return providerPricing[similarModel];
    }

    // Default fallback
    if (provider === "ollama") {
      return { prompt: 0, completion: 0 };
    }

    console.warn(`Unknown model: ${model} for provider: ${provider}`);
    return { prompt: 0, completion: 0 };
  }

  /**
   * Calculate cost for a request
   * @param {Object} params - Parameters object
   * @param {string} params.provider - Provider name
   * @param {string} params.model - Model name
   * @param {number} params.promptTokens - Number of prompt tokens
   * @param {number} params.completionTokens - Number of completion tokens
   * @returns {Object} Cost breakdown
   */
  calculateCost({ provider, model, promptTokens = 0, completionTokens = 0 }) {
    const pricing = this.getPricing(provider, model);

    // Calculate costs (pricing is per 1K tokens)
    const promptCost = (promptTokens / 1000) * pricing.prompt;
    const completionCost = (completionTokens / 1000) * pricing.completion;
    const totalCost = promptCost + completionCost;

    return {
      promptCost: parseFloat(promptCost.toFixed(6)),
      completionCost: parseFloat(completionCost.toFixed(6)),
      totalCost: parseFloat(totalCost.toFixed(6)),
      currency: "USD",
      pricing: {
        promptRate: pricing.prompt,
        completionRate: pricing.completion,
        unit: "per 1K tokens",
      },
    };
  }

  /**
   * Estimate cost for a prompt before sending
   * @param {Object} params - Parameters object
   * @param {string} params.provider - Provider name
   * @param {string} params.model - Model name
   * @param {number} params.promptTokens - Number of prompt tokens
   * @param {number} params.estimatedCompletionTokens - Estimated completion tokens
   * @returns {Object} Estimated cost
   */
  estimateCost({
    provider,
    model,
    promptTokens,
    estimatedCompletionTokens = 0,
  }) {
    return this.calculateCost({
      provider,
      model,
      promptTokens,
      completionTokens: estimatedCompletionTokens,
    });
  }

  /**
   * Get cost summary for multiple requests
   * @param {Array} requests - Array of request objects
   * @returns {Object} Cost summary
   */
  getCostSummary(requests) {
    const summary = {
      totalCost: 0,
      totalPromptCost: 0,
      totalCompletionCost: 0,
      requestCount: requests.length,
      byProvider: {},
      byModel: {},
      currency: "USD",
    };

    requests.forEach((request) => {
      const cost = request.cost || this.calculateCost(request);

      summary.totalCost += cost.totalCost;
      summary.totalPromptCost += cost.promptCost;
      summary.totalCompletionCost += cost.completionCost;

      // Group by provider
      if (!summary.byProvider[request.provider]) {
        summary.byProvider[request.provider] = {
          cost: 0,
          requests: 0,
        };
      }
      summary.byProvider[request.provider].cost += cost.totalCost;
      summary.byProvider[request.provider].requests += 1;

      // Group by model
      const modelKey = `${request.provider}/${request.model}`;
      if (!summary.byModel[modelKey]) {
        summary.byModel[modelKey] = {
          cost: 0,
          requests: 0,
        };
      }
      summary.byModel[modelKey].cost += cost.totalCost;
      summary.byModel[modelKey].requests += 1;
    });

    // Round final values
    summary.totalCost = parseFloat(summary.totalCost.toFixed(6));
    summary.totalPromptCost = parseFloat(summary.totalPromptCost.toFixed(6));
    summary.totalCompletionCost = parseFloat(
      summary.totalCompletionCost.toFixed(6)
    );

    return summary;
  }

  /**
   * Update pricing for a model (useful for dynamic pricing)
   * @param {string} provider - Provider name
   * @param {string} model - Model name
   * @param {Object} pricing - Pricing object
   */
  updatePricing(provider, model, pricing) {
    if (!this.pricing[provider]) {
      this.pricing[provider] = {};
    }
    this.pricing[provider][model] = pricing;
  }

  /**
   * Get all available pricing data
   * @returns {Object} Complete pricing data
   */
  getAllPricing() {
    return JSON.parse(JSON.stringify(this.pricing));
  }

  /**
   * Calculate cost per token ratio
   * @param {string} provider - Provider name
   * @param {string} model - Model name
   * @returns {number} Average cost per token
   */
  getAverageCostPerToken(provider, model) {
    const pricing = this.getPricing(provider, model);
    return (pricing.prompt + pricing.completion) / 2000; // Average per token (not per 1K)
  }

  /**
   * Compare costs between different models
   * @param {Array} models - Array of {provider, model} objects
   * @param {number} tokenCount - Number of tokens to compare
   * @returns {Array} Sorted comparison results
   */
  compareModelCosts(models, tokenCount = 1000) {
    const comparisons = models.map(({ provider, model }) => {
      const cost = this.calculateCost({
        provider,
        model,
        promptTokens: tokenCount / 2,
        completionTokens: tokenCount / 2,
      });

      return {
        provider,
        model,
        costPer1KTokens: cost.totalCost,
        costFor: tokenCount,
      };
    });

    return comparisons.sort((a, b) => a.costPer1KTokens - b.costPer1KTokens);
  }
}

module.exports = new CostEstimator();
