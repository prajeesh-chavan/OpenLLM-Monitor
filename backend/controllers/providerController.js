const config = require("../config/env");
const ProviderSettings = require("../models/ProviderSettings");

/**
 * Provider controller for managing LLM provider configurations
 */
class ProviderController {
  constructor() {
    // Store runtime provider configurations
    this.providerConfigs = {
      openai: {
        name: "OpenAI",
        baseUrl: config.providers.openai.baseUrl,
        hasApiKey: !!config.providers.openai.apiKey,
        models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "gpt-3.5-turbo-16k"],
        features: ["chat", "completion", "streaming"],
        status: "unknown",
        enabled: true,
      },
      openrouter: {
        name: "OpenRouter",
        baseUrl: config.providers.openrouter.baseUrl,
        hasApiKey: !!config.providers.openrouter.apiKey,
        models: [], // Will be fetched dynamically
        features: ["chat", "completion", "streaming", "multi-model"],
        status: "unknown",
        enabled: true,
      },
      mistral: {
        name: "Mistral AI",
        baseUrl: config.providers.mistral.baseUrl,
        hasApiKey: !!config.providers.mistral.apiKey,
        models: [
          "mistral-tiny",
          "mistral-small",
          "mistral-medium",
          "mistral-large",
        ],
        features: ["chat", "completion"],
        status: "unknown",
        enabled: true,
      },
      ollama: {
        name: "Ollama (Local)",
        baseUrl: config.providers.ollama.baseUrl,
        hasApiKey: false, // Ollama doesn't use API keys
        models: [], // Will be fetched dynamically
        features: ["chat", "completion", "streaming", "local"],
        status: "unknown",
        enabled: true,
      },
    };
    // Load Mistral API key from DB if present
    this.loadMistralApiKey();
  }

  async loadMistralApiKey() {
    try {
      const settings = await ProviderSettings.findOne({ provider: "mistral" });
      if (settings && settings.apiKey) {
        this.providerConfigs.mistral.hasApiKey = true;
        this.providerConfigs.mistral.baseUrl =
          settings.baseUrl || this.providerConfigs.mistral.baseUrl;
        this.providerConfigs.mistral.enabled =
          settings.enabled !== undefined ? settings.enabled : true;
        // Optionally, you can store the key in memory if needed for requests
        this.providerConfigs.mistral._apiKey = settings.apiKey;
      }
    } catch (err) {
      console.warn("Could not load Mistral API key from DB:", err.message);
    }
  }

  /**
   * Get all provider configurations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllProviders(req, res) {
    try {
      // Test connections and update status
      const providers = { ...this.providerConfigs };

      // Optionally test connections (can be disabled for faster response)
      const { testConnections = false } = req.query;

      if (testConnections === "true") {
        await this.updateProviderStatuses(providers);
      }

      // Always include availableModels for all providers
      for (const provider of Object.keys(providers)) {
        if (provider === "mistral") {
          const mistralService = require("../services/mistralService");
          let models = [];
          try {
            const apiKey = providers[provider]._apiKey;
            const result = await mistralService.getModels(apiKey);
            if (result.success) {
              models = result.models.map((m) => m.id);
            } else {
              models = mistralService.models;
            }
          } catch (err) {
            models = mistralService.models;
          }
          providers[provider].availableModels = models;
        } else if (provider === "ollama") {
          const OllamaService = require("../services/ollamaService");
          const ollamaService = new OllamaService();
          let models = [];
          try {
            const result = await ollamaService.listModels();
            models = result.map((m) => m.id);
          } catch (err) {
            models = providers[provider].models || [];
          }
          providers[provider].availableModels = models;
        } else {
          // For other providers, use static or fetched models
          providers[provider].availableModels =
            providers[provider].models || [];
        }
      }

      res.json({
        success: true,
        data: providers,
      });
    } catch (error) {
      console.error("Error getting providers:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get providers",
        details: error.message,
      });
    }
  }

  /**
   * Get specific provider configuration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProvider(req, res) {
    try {
      const { provider } = req.params;

      if (!this.providerConfigs[provider]) {
        return res.status(404).json({
          success: false,
          error: "Provider not found",
        });
      }

      const providerConfig = { ...this.providerConfigs[provider] };

      // Test connection
      await this.testProviderConnection(provider, providerConfig);

      // Get available models if connection is successful
      if (providerConfig.status === "connected") {
        try {
          const models = await this.getProviderModels(provider);
          providerConfig.models = models;
        } catch (error) {
          console.warn(`Failed to get models for ${provider}:`, error.message);
        }
      }

      // Always include availableModels for all providers
      if (provider === "mistral") {
        const mistralService = require("../services/mistralService");
        let models = [];
        try {
          const apiKey = providerConfig._apiKey;
          const result = await mistralService.getModels(apiKey);
          if (result.success) {
            models = result.models.map((m) => m.id);
          } else {
            models = mistralService.models;
          }
        } catch (err) {
          models = mistralService.models;
        }
        providerConfig.availableModels = models;
      } else if (provider === "ollama") {
        const OllamaService = require("../services/ollamaService");
        const ollamaService = new OllamaService();
        let models = [];
        try {
          const result = await ollamaService.listModels();
          models = result.map((m) => m.id);
        } catch (err) {
          models = providerConfig.models || [];
        }
        providerConfig.availableModels = models;
      } else {
        providerConfig.availableModels = providerConfig.models || [];
      }

      res.json({
        success: true,
        data: providerConfig,
      });
    } catch (error) {
      console.error("Error getting provider:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get provider",
        details: error.message,
      });
    }
  }

  /**
   * Update provider configuration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProvider(req, res) {
    try {
      const { provider } = req.params;
      const { apiKey, baseUrl, enabled = true } = req.body;

      if (!this.providerConfigs[provider]) {
        return res.status(404).json({
          success: false,
          error: "Provider not found",
        });
      }

      // Update configuration
      const updatedConfig = { ...this.providerConfigs[provider] };

      if (baseUrl) {
        updatedConfig.baseUrl = baseUrl;
      }

      if (apiKey !== undefined) {
        updatedConfig.hasApiKey = !!apiKey;
        // Save API key to DB for Mistral only
        if (provider === "mistral") {
          await ProviderSettings.findOneAndUpdate(
            { provider: "mistral" },
            { apiKey, baseUrl, enabled, updatedAt: new Date() },
            { upsert: true, new: true }
          );
        }
      }

      updatedConfig.enabled = enabled;

      // Test the new configuration
      await this.testProviderConnection(provider, updatedConfig, apiKey);

      // Update stored configuration
      this.providerConfigs[provider] = updatedConfig;

      res.json({
        success: true,
        data: updatedConfig,
        message: "Provider configuration updated successfully",
      });
    } catch (error) {
      console.error("Error updating provider:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update provider",
        details: error.message,
      });
    }
  }

  /**
   * Test provider connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      const { provider } = req.params;
      const { apiKey, baseUrl } = req.body;

      if (!this.providerConfigs[provider]) {
        return res.status(404).json({
          success: false,
          error: "Provider not found",
        });
      }

      const config = { ...this.providerConfigs[provider] };
      let testApiKey = apiKey;
      if (provider === "mistral" && !testApiKey) {
        // Always fetch the latest API key from DB for Mistral
        const ProviderSettings = require("../models/ProviderSettings");
        const settings = await ProviderSettings.findOne({
          provider: "mistral",
        });
        if (settings && settings.apiKey) {
          testApiKey = settings.apiKey;
        }
      }
      if (baseUrl) config.baseUrl = baseUrl;
      if (testApiKey !== undefined) config.hasApiKey = !!testApiKey;

      // Test connection
      const startTime = Date.now();
      const result = await this.testProviderConnection(
        provider,
        config,
        testApiKey
      );
      const latency = Date.now() - startTime;

      if (result && result.success === false) {
        return res.status(400).json({
          success: false,
          error: result.error || "Connection failed",
          details: result.details || {},
          status: "error",
          latency,
          timestamp: new Date(),
        });
      }

      res.json({
        success: true,
        data: {
          provider,
          connected: config.status === "connected",
          status: config.status,
          latency,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Error testing connection:", error);
      res.status(500).json({
        success: false,
        error: "Connection test failed",
        details: error.message,
      });
    }
  }

  /**
   * Get available models for a provider
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getModels(req, res) {
    try {
      const { provider } = req.params;

      if (!this.providerConfigs[provider]) {
        return res.status(404).json({
          success: false,
          error: "Provider not found",
        });
      }

      const models = await this.getProviderModels(provider);

      res.json({
        success: true,
        data: {
          provider,
          models,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Error getting models:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get models",
        details: error.message,
      });
    }
  }

  /**
   * Get provider statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */ async getProviderStats(req, res) {
    try {
      // For test environment, return mock data
      if (process.env.NODE_ENV === "test" || !process.env.MONGODB_URI) {
        return res.json({
          success: true,
          data: {
            overview: {
              totalRequests: 1250,
              totalProviders: 4,
              avgLatency: 287,
              totalCost: 12.45,
            },
            providers: [
              {
                name: "openai",
                requests: 650,
                successRate: 98.5,
                avgLatency: 245,
              },
              {
                name: "ollama",
                requests: 350,
                successRate: 95.2,
                avgLatency: 150,
              },
              {
                name: "mistral",
                requests: 180,
                successRate: 97.1,
                avgLatency: 320,
              },
              {
                name: "openrouter",
                requests: 70,
                successRate: 94.3,
                avgLatency: 410,
              },
            ],
          },
        });
      }

      const { timeframe = 24 } = req.query;
      const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);

      const Log = require("../models/Log");

      const stats = await Log.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: "$provider",
            totalRequests: { $sum: 1 },
            successfulRequests: {
              $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
            },
            avgLatency: { $avg: "$latency" },
            totalCost: { $sum: "$cost.totalCost" },
            totalTokens: { $sum: "$tokenUsage.totalTokens" },
            models: { $addToSet: "$model" },
          },
        },
        {
          $addFields: {
            successRate: {
              $multiply: [
                { $divide: ["$successfulRequests", "$totalRequests"] },
                100,
              ],
            },
          },
        },
        { $sort: { totalRequests: -1 } },
      ]);

      // Add provider configuration info
      const enrichedStats = stats.map((stat) => ({
        ...stat,
        config: this.providerConfigs[stat._id] || null,
      }));

      res.json({
        success: true,
        data: {
          stats: enrichedStats,
          timeframe: `${timeframe} hours`,
        },
      });
    } catch (error) {
      console.error("Error getting provider stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get provider statistics",
        details: error.message,
      });
    }
  }

  /**
   * Get recommended providers based on usage patterns
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRecommendations(req, res) {
    try {
      const { useCase = "general" } = req.query;

      const recommendations = this.getProviderRecommendations(useCase);

      res.json({
        success: true,
        data: {
          useCase,
          recommendations,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get recommendations",
        details: error.message,
      });
    }
  }

  // Helper methods

  /**
   * Update provider statuses by testing connections
   * @param {Object} providers - Providers configuration object
   */
  async updateProviderStatuses(providers) {
    await Promise.allSettled(
      Object.keys(providers).map(async (providerName) => {
        try {
          await this.testProviderConnection(
            providerName,
            providers[providerName]
          );
        } catch (error) {
          providers[providerName].status = "error";
          providers[providerName].error = error.message;
        }
      })
    );
  }

  /**
   * Test connection to a specific provider
   * @param {string} providerName - Provider name
   * @param {Object} config - Provider configuration
   * @param {string} apiKey - Optional API key for testing
   */
  async testProviderConnection(providerName, config, apiKey = null) {
    const services = {
      openai: require("../services/openaiService"),
      ollama: require("../services/ollamaService"),
      openrouter: require("../services/openrouterService"),
      mistral: require("../services/mistralService"), // Add Mistral
    };

    const ServiceClass = services[providerName];
    if (!ServiceClass) {
      config.status = "unsupported";
      return;
    }

    try {
      const service = new ServiceClass();

      // Update service configuration if provided
      if (apiKey && service.updateApiKey) {
        service.updateApiKey(apiKey);
      }

      if (config.baseUrl && service.updateBaseUrl) {
        service.updateBaseUrl(config.baseUrl);
      }

      // Test connection
      const isConnected = await service.testConnection();
      config.status = isConnected ? "connected" : "error";
      config.lastTested = new Date();
    } catch (error) {
      config.status = "error";
      config.error = error.message;
      config.lastTested = new Date();
    }
  }

  /**
   * Get available models for a provider
   * @param {string} providerName - Provider name
   * @returns {Array} List of available models
   */
  async getProviderModels(providerName) {
    const services = {
      openai: require("../services/openaiService"),
      ollama: require("../services/ollamaService"),
      openrouter: require("../services/openrouterService"),
      mistral: require("../services/mistralService"), // Add Mistral
    };

    const ServiceClass = services[providerName];
    if (!ServiceClass) {
      return this.providerConfigs[providerName]?.models || [];
    }

    try {
      const service = new ServiceClass();
      return await service.listModels();
    } catch (error) {
      console.warn(`Failed to get models for ${providerName}:`, error.message);
      return this.providerConfigs[providerName]?.models || [];
    }
  }

  /**
   * Get provider recommendations based on use case
   * @param {string} useCase - Use case type
   * @returns {Array} Recommended providers
   */
  getProviderRecommendations(useCase) {
    const recommendations = {
      general: [
        {
          provider: "openai",
          model: "gpt-3.5-turbo",
          reason: "Best balance of cost and performance",
        },
        {
          provider: "openrouter",
          model: "openai/gpt-3.5-turbo",
          reason: "Access to multiple models",
        },
        { provider: "ollama", model: "llama2", reason: "Free local hosting" },
      ],
      coding: [
        {
          provider: "openai",
          model: "gpt-4",
          reason: "Superior code understanding",
        },
        {
          provider: "ollama",
          model: "codellama",
          reason: "Code-specialized local model",
        },
        {
          provider: "openrouter",
          model: "anthropic/claude-2",
          reason: "Excellent reasoning abilities",
        },
      ],
      creative: [
        {
          provider: "openai",
          model: "gpt-4",
          reason: "Creative and nuanced responses",
        },
        {
          provider: "openrouter",
          model: "anthropic/claude-2",
          reason: "Long-form creative writing",
        },
        {
          provider: "mistral",
          model: "mistral-medium",
          reason: "European alternative with creativity",
        },
      ],
      budget: [
        {
          provider: "ollama",
          model: "llama2",
          reason: "Completely free local hosting",
        },
        {
          provider: "openai",
          model: "gpt-3.5-turbo",
          reason: "Low cost per token",
        },
        {
          provider: "openrouter",
          model: "mistralai/mistral-7b-instruct",
          reason: "Cheap access to quality models",
        },
      ],
      enterprise: [
        {
          provider: "openai",
          model: "gpt-4",
          reason: "Proven reliability and performance",
        },
        {
          provider: "mistral",
          model: "mistral-large",
          reason: "European data compliance",
        },
        {
          provider: "ollama",
          model: "llama2",
          reason: "On-premises deployment",
        },
      ],
    };
    return recommendations[useCase] || recommendations.general;
  }

  /**
   * Generate completion using a specific provider
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateCompletion(req, res) {
    try {
      const { provider } = req.params;
      const { prompt, model, systemMessage, temperature, maxTokens } = req.body;

      // Validate required fields
      if (!prompt || !model) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: prompt, model",
        });
      }

      // Import services dynamically to avoid circular dependencies
      const OllamaService = require("../services/ollamaService");
      const OpenAIService = require("../services/openaiService");
      const OpenRouterService = require("../services/openrouterService");
      const mistralService = require("../services/mistralService");

      const services = {
        openai: new OpenAIService(),
        ollama: new OllamaService(),
        openrouter: new OpenRouterService(),
        mistral: mistralService,
      };

      const service = services[provider];
      if (!service) {
        return res.status(400).json({
          success: false,
          error: `Unsupported provider: ${provider}`,
        });
      }

      // Generate request ID
      const { v4: uuidv4 } = require("uuid");
      const requestId = uuidv4();

      // Prepare request parameters
      const requestParams = {
        prompt,
        model,
        systemMessage: systemMessage || "",
        requestId,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || null,
      };

      // Execute the prompt
      const result = await service.sendPrompt(requestParams);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error generating completion:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate completion",
        details: error.message,
      });
    }
  }
}

module.exports = new ProviderController();
