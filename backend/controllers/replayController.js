const OpenAIService = require("../services/openaiService");
const OllamaService = require("../services/ollamaService");
const OpenRouterService = require("../services/openrouterService");
const mistralService = require("../services/mistralService");
const { v4: uuidv4 } = require("uuid");

/**
 * Replay controller for re-executing stored prompts
 */
class ReplayController {
  constructor() {
    this.services = {
      openai: new OpenAIService(),
      ollama: new OllamaService(),
      openrouter: new OpenRouterService(),
      mistral: mistralService, // Use the already instantiated service
    };
  }

  /**
   * Replay a prompt with the same or different provider/model
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async replayPrompt(req, res) {
    try {
      const {
        prompt,
        provider,
        model,
        systemMessage = "",
        parameters = {},
        originalLogId = null,
      } = req.body;

      // Validate required fields
      if (!prompt || !provider || !model) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: prompt, provider, model",
        });
      }

      // Get the appropriate service
      const service = this.services[provider];
      if (!service) {
        return res.status(400).json({
          success: false,
          error: `Unsupported provider: ${provider}`,
        });
      }

      // Generate request ID
      const requestId = uuidv4();

      // Prepare request parameters
      const requestParams = {
        prompt,
        model,
        systemMessage,
        requestId,
        temperature: parameters.temperature || 1.0,
        maxTokens: parameters.maxTokens || null,
        topP: parameters.topP || 1.0,
        frequencyPenalty: parameters.frequencyPenalty || 0,
        presencePenalty: parameters.presencePenalty || 0,
        stop: parameters.stop || null,
      }; // Execute the prompt
      const result = await service.sendPrompt(requestParams);

      // Add replay metadata
      result.isReplay = true;
      result.originalLogId = originalLogId;
      result.replayedAt = new Date();

      // For backward compatibility, also include 'response' field (alias for 'completion')
      if (result.completion !== undefined) {
        result.response = result.completion;
      }

      // Transform result for test compatibility
      const responseData = {
        ...result,
        // Map expected fields for tests
        tokenUsage: result.tokenUsage,
        cost: result.cost,
        duration: result.latency, // Map latency to duration for tests
      };

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      console.error("Error replaying prompt:", error);
      res.status(500).json({
        success: false,
        error: "Failed to replay prompt",
        details: error.message,
      });
    }
  }
  /**
   * Replay a prompt from an existing log entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async replayFromLog(req, res) {
    try {
      const { logId } = req.params;
      const {
        provider: newProvider,
        model: newModel,
        parameters: newParameters = {},
      } = req.body;

      // Validate ObjectId format
      const mongoose = require("mongoose");
      if (!mongoose.Types.ObjectId.isValid(logId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid log ID format",
        });
      }

      // Get the original log
      const Log = require("../models/Log");
      const originalLog = await Log.findById(logId);

      if (!originalLog) {
        return res.status(404).json({
          success: false,
          error: "Original log not found",
        });
      }

      // Use original or new provider/model
      const provider = newProvider || originalLog.provider;
      const model = newModel || originalLog.model;

      // Merge parameters
      const parameters = {
        ...originalLog.parameters,
        ...newParameters,
      };

      // Replay the prompt
      const replayData = {
        prompt: originalLog.prompt,
        provider,
        model,
        systemMessage: originalLog.systemMessage,
        parameters,
        originalLogId: logId,
      };

      // Forward to replay method
      req.body = replayData;
      return this.replayPrompt(req, res);
    } catch (error) {
      console.error("Error replaying from log:", error);
      res.status(500).json({
        success: false,
        error: "Failed to replay from log",
        details: error.message,
      });
    }
  }

  /**
   * Stream a replay (for real-time responses)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async streamReplay(req, res) {
    try {
      const {
        prompt,
        provider,
        model,
        systemMessage = "",
        parameters = {},
      } = req.body;

      // Validate required fields
      if (!prompt || !provider || !model) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: prompt, provider, model",
        });
      }

      // Get the appropriate service
      const service = this.services[provider];
      if (!service) {
        return res.status(400).json({
          success: false,
          error: `Unsupported provider: ${provider}`,
        });
      }

      // Set up SSE headers
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });

      const requestId = uuidv4();

      // Prepare request parameters
      const requestParams = {
        prompt,
        model,
        systemMessage,
        requestId,
        temperature: parameters.temperature || 1.0,
        maxTokens: parameters.maxTokens || null,
        topP: parameters.topP || 1.0,
        stream: true,
      };

      // Stream the response
      try {
        const result = await service.streamCompletion(
          requestParams,
          (chunk) => {
            // Send chunk to client
            res.write(
              `data: ${JSON.stringify({
                type: "chunk",
                content: chunk.content,
                finishReason: chunk.finishReason,
                timestamp: chunk.timestamp,
              })}\n\n`
            );
          }
        );

        // Send final result
        res.write(
          `data: ${JSON.stringify({
            type: "complete",
            result: {
              ...result,
              isReplay: true,
              replayedAt: new Date(),
            },
          })}\n\n`
        );

        res.write("data: [DONE]\n\n");
        res.end();
      } catch (streamError) {
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            error: streamError.message,
          })}\n\n`
        );
        res.end();
      }
    } catch (error) {
      console.error("Error streaming replay:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Failed to stream replay",
          details: error.message,
        });
      }
    }
  }

  /**
   * Compare multiple replays of the same prompt
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */ async compareReplays(req, res) {
    try {
      const {
        prompt,
        systemMessage = "",
        configurations = [], // Array of {provider, model, parameters}
        providers = [], // Alternative field name for backward compatibility
        temperature,
        maxTokens,
        topP,
      } = req.body;

      // Support both 'configurations' and 'providers' field names
      const configsToUse =
        configurations.length > 0 ? configurations : providers;

      if (!prompt || !configsToUse || configsToUse.length === 0) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: prompt and configurations/providers array",
        });
      }

      if (configsToUse.length > 5) {
        return res.status(400).json({
          success: false,
          error: "Maximum 5 configurations allowed for comparison",
        });
      }

      // Execute all configurations in parallel
      const results = await Promise.allSettled(
        configsToUse.map(async (config, index) => {
          const service = this.services[config.provider];
          if (!service) {
            throw new Error(`Unsupported provider: ${config.provider}`);
          }

          const requestParams = {
            prompt,
            model: config.model,
            systemMessage,
            requestId: `compare_${uuidv4()}_${index}`,
            temperature: config.parameters?.temperature || temperature || 1.0,
            maxTokens: config.parameters?.maxTokens || maxTokens || null,
            topP: config.parameters?.topP || topP || 1.0,
            frequencyPenalty: config.parameters?.frequencyPenalty || 0,
            presencePenalty: config.parameters?.presencePenalty || 0,
          };

          const result = await service.sendPrompt(requestParams);
          return {
            ...result,
            configIndex: index,
            configuration: config,
          };
        })
      );

      // Process results
      const comparison = {
        prompt,
        systemMessage,
        timestamp: new Date(),
        results: results.map((result, index) => ({
          configIndex: index,
          configuration: configsToUse[index],
          provider: configsToUse[index].provider,
          model: configsToUse[index].model,
          status: result.status,
          data: result.status === "fulfilled" ? result.value : null,
          error: result.status === "rejected" ? result.reason.message : null,
          // Add fields expected by tests
          response:
            result.status === "fulfilled" ? result.value?.completion : null,
          duration:
            result.status === "fulfilled" ? result.value?.latency : null,
        })),
      };

      // Add comparison metrics
      const successfulResults = comparison.results.filter(
        (r) => r.status === "fulfilled" && r.data
      );

      if (successfulResults.length > 1) {
        comparison.metrics = {
          latencyComparison: successfulResults
            .map((r) => ({
              config: `${r.configuration.provider}/${r.configuration.model}`,
              latency: r.data.latency,
            }))
            .sort((a, b) => a.latency - b.latency),

          costComparison: successfulResults
            .map((r) => ({
              config: `${r.configuration.provider}/${r.configuration.model}`,
              cost: r.data.cost.totalCost,
            }))
            .sort((a, b) => a.cost - b.cost),

          tokenComparison: successfulResults
            .map((r) => ({
              config: `${r.configuration.provider}/${r.configuration.model}`,
              tokens: r.data.tokenUsage.totalTokens,
            }))
            .sort((a, b) => a.tokens - b.tokens),

          responseLength: successfulResults
            .map((r) => ({
              config: `${r.configuration.provider}/${r.configuration.model}`,
              length: r.data.completion.length,
            }))
            .sort((a, b) => b.length - a.length),
        };
      }

      res.json({
        success: true,
        data: comparison,
      });
    } catch (error) {
      console.error("Error comparing replays:", error);
      res.status(500).json({
        success: false,
        error: "Failed to compare replays",
        details: error.message,
      });
    }
  }

  /**
   * Get available models for each provider
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAvailableModels(req, res) {
    try {
      const { provider } = req.query;
      if (provider && this.services[provider]) {
        // Get models for specific provider
        const models = await this.services[provider].listModels();
        res.json({
          success: true,
          data: {
            models: models,
            [provider]: models, // Keep both formats for compatibility
          },
        });
      } else {
        // Get models for all providers
        const allModels = {};

        await Promise.allSettled(
          Object.entries(this.services).map(async ([providerName, service]) => {
            try {
              allModels[providerName] = await service.listModels();
            } catch (error) {
              allModels[providerName] = [];
              console.warn(
                `Failed to get models for ${providerName}:`,
                error.message
              );
            }
          })
        );

        res.json({
          success: true,
          data: {
            models: allModels, // For test compatibility
            ...allModels, // Keep individual provider fields
          },
        });
      }
    } catch (error) {
      console.error("Error getting available models:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get available models",
        details: error.message,
      });
    }
  }

  /**
   * Test connection to a specific provider
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testConnection(req, res) {
    try {
      const { provider } = req.params;

      const service = this.services[provider];
      if (!service) {
        return res.status(400).json({
          success: false,
          error: `Unsupported provider: ${provider}`,
        });
      }

      const isConnected = await service.testConnection();

      res.json({
        success: true,
        data: {
          provider,
          connected: isConnected,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Error testing connection:", error);
      res.status(500).json({
        success: false,
        error: "Failed to test connection",
        details: error.message,
      });
    }
  }

  /**
   * Get cost estimate for a prompt
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCostEstimate(req, res) {
    try {
      const {
        prompt,
        provider,
        model,
        estimatedCompletionLength = 100,
      } = req.body;

      if (!prompt || !provider || !model) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: prompt, provider, model",
        });
      }

      const service = this.services[provider];
      if (!service) {
        return res.status(400).json({
          success: false,
          error: `Unsupported provider: ${provider}`,
        });
      }

      // Estimate tokens
      const promptTokens = service.estimateTokens
        ? service.estimateTokens(prompt, model)
        : Math.ceil(prompt.length / 4);

      const estimatedCompletionTokens = Math.ceil(
        estimatedCompletionLength / 4
      );

      // Get cost estimate
      const costEstimator = require("../utils/costEstimator");
      const costEstimate = costEstimator.estimateCost({
        provider,
        model,
        promptTokens,
        estimatedCompletionTokens,
      });
      res.json({
        success: true,
        data: {
          prompt: prompt.substring(0, 100) + (prompt.length > 100 ? "..." : ""),
          provider,
          model,
          tokenEstimate: {
            promptTokens,
            estimatedCompletionTokens,
            totalTokens: promptTokens + estimatedCompletionTokens,
          },
          costEstimate,
          // Add fields expected by tests
          estimatedCost: costEstimate.totalCost,
          promptTokens,
          maxCompletionTokens: estimatedCompletionTokens,
        },
      });
    } catch (error) {
      console.error("Error getting cost estimate:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get cost estimate",
        details: error.message,
      });
    }
  }
}

module.exports = new ReplayController();
