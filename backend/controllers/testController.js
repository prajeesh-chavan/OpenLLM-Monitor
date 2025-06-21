const OpenAIService = require("../services/openaiService");
const OllamaService = require("../services/ollamaService");
const mistralService = require("../services/mistralService");
const OpenRouterService = require("../services/openrouterService");
const costEstimator = require("../utils/costEstimator");
const tokenCounter = require("../utils/tokenCounter");
const retryHandler = require("../utils/retryHandler");
const Log = require("../models/Log");

/**
 * Test Controller
 * Handles direct model testing functionality
 */
class TestController {
  constructor() {
    // Initialize service instances
    this.services = {
      openai: new OpenAIService(),
      ollama: new OllamaService(),
      mistral: mistralService, // Use the already instantiated service
      openrouter: new OpenRouterService(),
    };
  }
  /**
   * Test a prompt directly with specified provider and model
   */ async testPrompt(req, res) {
    try {
      const {
        prompt,
        provider,
        model,
        systemMessage = "You are a helpful assistant.",
        temperature = 0.7,
        maxTokens = 1000,
        stream = false,
      } = req.body;

      // Validate required fields
      if (!prompt || !provider || !model) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: prompt, provider, model",
        });
      }

      const startTime = Date.now();
      const requestId = `test-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Prepare the request parameters
      const requestParams = {
        prompt,
        model,
        systemMessage,
        temperature,
        maxTokens,
        stream,
      };

      let service; // Select appropriate service based on provider
      switch (provider.toLowerCase()) {
        case "openai":
          service = this.services.openai;
          break;
        case "ollama":
          service = this.services.ollama;
          break;
        case "mistral":
          service = this.services.mistral;
          break;
        case "openrouter":
          service = this.services.openrouter;
          break;
        default:
          return res.status(400).json({
            success: false,
            error: `Unsupported provider: ${provider}`,
          });
      } // Execute the request with retry logic
      const { result } = await retryHandler.executeWithRetry(
        () => service.sendPrompt(requestParams),
        { maxRetries: 3, baseDelay: 1000 }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Calculate token usage and costs
      const tokenUsage = result.tokenUsage || {
        promptTokens: tokenCounter.countTokens(prompt),
        completionTokens: tokenCounter.countTokens(
          result.completion || result.response || ""
        ),
        totalTokens: 0,
      };
      tokenUsage.totalTokens =
        tokenUsage.promptTokens + tokenUsage.completionTokens;

      const cost = costEstimator.calculateCost(provider, model, tokenUsage);

      // Log the test request for monitoring
      const logEntry = new Log({
        requestId,
        provider,
        model,
        prompt,
        systemMessage,
        completion: result.completion || result.response,
        tokenUsage,
        cost,
        latency: duration,
        status: "success",
        parameters: {
          temperature,
          maxTokens,
          stream,
        },
        metadata: {
          isTest: true,
          userAgent: req.headers["user-agent"],
          timestamp: new Date(),
        },
      });

      await logEntry.save();

      res.json({
        success: true,
        data: {
          requestId,
          provider,
          model,
          response: result.completion || result.response,
          tokenUsage,
          cost,
          duration,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Test prompt error:", error);

      // Log the failed test
      try {
        const logEntry = new Log({
          requestId: `test-failed-${Date.now()}`,
          provider: req.body.provider || "unknown",
          model: req.body.model || "unknown",
          prompt: req.body.prompt || "",
          status: "error",
          error: error.message,
          latency: Date.now() - (req.startTime || Date.now()),
          metadata: {
            isTest: true,
            userAgent: req.headers["user-agent"],
            timestamp: new Date(),
          },
        });
        await logEntry.save();
      } catch (logError) {
        console.error("Failed to log test error:", logError);
      }

      res.status(500).json({
        success: false,
        error: error.message || "Failed to test prompt",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }

  /**
   * Test the same prompt with multiple models and compare results
   */
  async compareModels(req, res) {
    try {
      const {
        prompt,
        models,
        systemMessage = "You are a helpful assistant.",
      } = req.body;

      if (!prompt || !models || !Array.isArray(models) || models.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: prompt, models (array)",
        });
      }

      const results = [];
      const startTime = Date.now();

      // Test each model configuration
      for (const modelConfig of models) {
        const {
          provider,
          model,
          temperature = 0.7,
          maxTokens = 1000,
        } = modelConfig;

        try {
          const modelStartTime = Date.now();
          const requestId = `compare-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          let service;
          switch (provider.toLowerCase()) {
            case "openai":
              service = this.services.openai;
              break;
            case "ollama":
              service = this.services.ollama;
              break;
            case "mistral":
              service = this.services.mistral;
              break;
            case "openrouter":
              service = this.services.openrouter;
              break;
            default:
              throw new Error(`Unsupported provider: ${provider}`);
          }
          const { result } = await retryHandler.executeWithRetry(
            () =>
              service.sendPrompt({
                prompt,
                model,
                systemMessage,
                temperature,
                maxTokens,
              }),
            { maxRetries: 3, baseDelay: 1000 }
          );

          const modelEndTime = Date.now();
          const duration = modelEndTime - modelStartTime; // Calculate token usage and costs
          const tokenUsage = result.tokenUsage || {
            promptTokens: tokenCounter.countTokens(prompt),
            completionTokens: tokenCounter.countTokens(
              result.completion || result.response || ""
            ),
            totalTokens: 0,
          };
          tokenUsage.totalTokens =
            tokenUsage.promptTokens + tokenUsage.completionTokens;

          const cost = costEstimator.calculateCost(provider, model, tokenUsage);

          results.push({
            provider,
            model,
            response: result.completion || result.response,
            tokenUsage,
            cost,
            duration,
            status: "success",
            requestId,
          });

          // Log the comparison test
          const logEntry = new Log({
            requestId,
            provider,
            model,
            prompt,
            systemMessage,
            completion: result.completion || result.response,
            tokenUsage,
            cost,
            latency: duration,
            status: "success",
            parameters: { temperature, maxTokens },
            metadata: {
              isTest: true,
              isComparison: true,
              userAgent: req.headers["user-agent"],
              timestamp: new Date(),
            },
          });

          await logEntry.save();
        } catch (error) {
          console.error(`Model ${provider}/${model} failed:`, error);
          results.push({
            provider,
            model,
            error: error.message,
            status: "error",
            duration: Date.now() - modelStartTime,
          });
        }
      }

      const totalDuration = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          prompt,
          results,
          totalDuration,
          timestamp: new Date().toISOString(),
          summary: {
            total: models.length,
            successful: results.filter((r) => r.status === "success").length,
            failed: results.filter((r) => r.status === "error").length,
          },
        },
      });
    } catch (error) {
      console.error("Compare models error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to compare models",
      });
    }
  }

  /**
   * Get available models for all configured providers
   */
  async getAvailableModels(req, res) {
    try {
      const models = {
        openai: [
          "gpt-4",
          "gpt-4-turbo",
          "gpt-4-turbo-preview",
          "gpt-3.5-turbo",
          "gpt-3.5-turbo-16k",
        ],
        ollama: [
          "llama2",
          "llama2:13b",
          "llama2:70b",
          "mistral",
          "mistral:7b",
          "phi3:mini",
          "phi3:medium",
          "gemma:2b",
          "gemma:7b",
        ],
        mistral: [
          "mistral-tiny",
          "mistral-small",
          "mistral-medium",
          "mistral-large-latest",
        ],
        openrouter: [
          "openai/gpt-4",
          "openai/gpt-3.5-turbo",
          "anthropic/claude-3-haiku",
          "meta-llama/llama-2-70b-chat",
          "mistralai/mistral-7b-instruct",
        ],
      }; // Try to get real-time model lists from providers
      try {
        // For Ollama, try to get actual running models
        const ollamaModels = await this.services.ollama.listModels?.();
        if (ollamaModels && ollamaModels.length > 0) {
          models.ollama = ollamaModels.map((model) => model.name || model);
        }
      } catch (error) {
        console.warn("Could not fetch Ollama models:", error.message);
      }

      res.json({
        success: true,
        data: models,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get available models error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get available models",
      });
    }
  }

  /**
   * Get cost estimate for a test prompt
   */
  async getCostEstimate(req, res) {
    try {
      const { prompt, provider, model, maxTokens = 1000 } = req.body;

      if (!prompt || !provider || !model) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: prompt, provider, model",
        });
      }
      const promptTokens = tokenCounter.countTokens(prompt);
      const estimatedCompletionTokens = Math.min(maxTokens, promptTokens * 0.5); // Rough estimate

      const tokenUsage = {
        promptTokens,
        completionTokens: estimatedCompletionTokens,
        totalTokens: promptTokens + estimatedCompletionTokens,
      };

      const cost = costEstimator.calculateCost(provider, model, tokenUsage);

      res.json({
        success: true,
        data: {
          prompt,
          provider,
          model,
          tokenUsage,
          estimatedCost: cost,
          breakdown: costEstimator.getCostBreakdown?.(
            provider,
            model,
            tokenUsage
          ),
        },
      });
    } catch (error) {
      console.error("Cost estimate error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to estimate cost",
      });
    }
  }

  /**
   * Validate test configuration before running
   */
  async validateConfig(req, res) {
    try {
      const { prompt, provider, model, temperature, maxTokens } = req.body;
      const errors = [];
      const warnings = [];

      // Validate prompt
      if (!prompt || prompt.trim().length === 0) {
        errors.push("Prompt is required");
      } else if (prompt.length > 50000) {
        errors.push("Prompt is too long (max 50,000 characters)");
      } else if (prompt.length < 10) {
        warnings.push("Prompt is very short, consider adding more context");
      }

      // Validate provider
      const supportedProviders = ["openai", "ollama", "mistral", "openrouter"];
      if (!provider) {
        errors.push("Provider is required");
      } else if (!supportedProviders.includes(provider.toLowerCase())) {
        errors.push(`Unsupported provider: ${provider}`);
      }

      // Validate model
      if (!model || model.trim().length === 0) {
        errors.push("Model is required");
      }

      // Validate temperature
      if (temperature !== undefined) {
        if (
          typeof temperature !== "number" ||
          temperature < 0 ||
          temperature > 2
        ) {
          errors.push("Temperature must be a number between 0 and 2");
        } else if (temperature > 1.5) {
          warnings.push(
            "High temperature may produce very creative but less coherent responses"
          );
        }
      }

      // Validate maxTokens
      if (maxTokens !== undefined) {
        if (
          typeof maxTokens !== "number" ||
          maxTokens < 1 ||
          maxTokens > 4096
        ) {
          errors.push("Max tokens must be a number between 1 and 4096");
        } else if (maxTokens > 2000) {
          warnings.push("High token limit may increase cost and response time");
        }
      }

      // Estimate cost and warn if high
      try {
        const promptTokens = tokenCounter.countTokens(prompt || "");
        const estimatedCost = costEstimator.calculateCost(provider, model, {
          promptTokens,
          completionTokens: maxTokens || 1000,
          totalTokens: promptTokens + (maxTokens || 1000),
        });

        if (estimatedCost > 0.1) {
          warnings.push(`Estimated cost is high: $${estimatedCost.toFixed(4)}`);
        }
      } catch (costError) {
        console.warn("Could not estimate cost:", costError);
      }

      res.json({
        success: true,
        data: {
          valid: errors.length === 0,
          errors,
          warnings,
          recommendations: [
            ...(prompt && prompt.length < 50
              ? ["Consider adding more context to your prompt"]
              : []),
            ...(temperature === undefined
              ? ["Setting temperature can improve response quality"]
              : []),
            ...(maxTokens === undefined
              ? ["Setting max tokens helps control response length"]
              : []),
          ],
        },
      });
    } catch (error) {
      console.error("Validate config error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to validate configuration",
      });
    }
  }
}

module.exports = new TestController();
