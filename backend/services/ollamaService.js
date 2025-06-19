const axios = require("axios");
const config = require("../config/env");
const tokenCounter = require("../utils/tokenCounter");
const costEstimator = require("../utils/costEstimator");
const retryHandler = require("../utils/retryHandler");

/**
 * Ollama service wrapper for local LLM models
 */
class OllamaService {
  constructor() {
    this.baseUrl = config.providers.ollama.baseUrl;
    this.defaultModel = "llama2";

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "OpenLLM-Monitor/1.0",
      },
      timeout: 120000, // 2 minutes for local models
    });

    // Get provider-specific retry config
    this.retryConfig = retryHandler.getProviderRetryConfig("ollama");
  }

  /**
   * Send a prompt to Ollama
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response with metadata
   */
  async sendPrompt(params) {
    const {
      prompt,
      model = this.defaultModel,
      systemMessage = "",
      temperature = 0.7,
      maxTokens = null,
      topP = 0.9,
      stream = false,
      requestId,
    } = params;

    const startTime = Date.now();

    try {
      // Prepare the full prompt
      let fullPrompt = prompt;
      if (systemMessage) {
        fullPrompt = `System: ${systemMessage}\n\nUser: ${prompt}`;
      }

      // Count prompt tokens (estimated)
      const promptTokens = tokenCounter.estimateOllamaTokens(fullPrompt);

      // Prepare request body
      const requestBody = {
        model,
        prompt: fullPrompt,
        stream: false, // We'll handle streaming separately
        options: {
          temperature,
          top_p: topP,
        },
      };

      if (maxTokens) {
        requestBody.options.num_predict = maxTokens;
      }

      // Execute with retry logic
      const { result, retryHistory } = await retryHandler.executeWithRetry(
        async () => {
          const response = await this.client.post("/api/generate", requestBody);
          return response.data;
        },
        this.retryConfig
      );

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Extract response data
      const completion = result.response || "";

      // Estimate completion tokens
      const completionTokens = tokenCounter.estimateOllamaTokens(completion);
      const totalTokens = promptTokens + completionTokens;

      const tokenUsage = {
        promptTokens,
        completionTokens,
        totalTokens,
      };

      // Ollama is free (local), so cost is 0
      const cost = {
        promptCost: 0,
        completionCost: 0,
        totalCost: 0,
        currency: "USD",
      };

      return {
        requestId,
        provider: "ollama",
        model,
        prompt,
        completion,
        systemMessage,
        parameters: {
          temperature,
          maxTokens,
          topP,
        },
        tokenUsage,
        cost,
        latency,
        retryHistory,
        status: "success",
        rawResponse: result,
        finishReason: result.done ? "stop" : "length",
      };
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;

      return {
        requestId,
        provider: "ollama",
        model,
        prompt,
        completion: "",
        systemMessage,
        parameters: {
          temperature,
          maxTokens,
          topP,
        },
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        cost: {
          promptCost: 0,
          completionCost: 0,
          totalCost: 0,
          currency: "USD",
        },
        latency,
        retryHistory: error.retryHistory || [],
        status: this.getErrorStatus(error),
        error: {
          message: error.message,
          code: error.code || error.response?.status,
          details: error.response?.data || {},
        },
      };
    }
  }

  /**
   * Stream chat completion from Ollama
   * @param {Object} params - Request parameters
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<Object>} Final response
   */
  async streamCompletion(params, onChunk) {
    const {
      prompt,
      model = this.defaultModel,
      systemMessage = "",
      temperature = 0.7,
      maxTokens = null,
      topP = 0.9,
      requestId,
    } = params;

    const startTime = Date.now();

    try {
      // Prepare the full prompt
      let fullPrompt = prompt;
      if (systemMessage) {
        fullPrompt = `System: ${systemMessage}\n\nUser: ${prompt}`;
      }

      const requestBody = {
        model,
        prompt: fullPrompt,
        stream: true,
        options: {
          temperature,
          top_p: topP,
        },
      };

      if (maxTokens) {
        requestBody.options.num_predict = maxTokens;
      }

      let completion = "";
      const streamChunks = [];

      // Execute streaming request
      const response = await this.client.post("/api/generate", requestBody, {
        responseType: "stream",
      });

      return new Promise((resolve, reject) => {
        response.data.on("data", (chunk) => {
          try {
            const lines = chunk
              .toString()
              .split("\n")
              .filter((line) => line.trim());

            for (const line of lines) {
              const data = JSON.parse(line);

              if (data.response) {
                completion += data.response;

                const chunkData = {
                  content: data.response,
                  timestamp: new Date(),
                  finishReason: data.done ? "stop" : null,
                };

                streamChunks.push(chunkData);

                if (onChunk) {
                  onChunk(chunkData);
                }
              }

              if (data.done) {
                const endTime = Date.now();
                const latency = endTime - startTime;

                // Estimate tokens
                const promptTokens =
                  tokenCounter.estimateOllamaTokens(fullPrompt);
                const completionTokens =
                  tokenCounter.estimateOllamaTokens(completion);

                resolve({
                  requestId,
                  provider: "ollama",
                  model,
                  prompt,
                  completion,
                  systemMessage,
                  parameters: { temperature, maxTokens, topP },
                  tokenUsage: {
                    promptTokens,
                    completionTokens,
                    totalTokens: promptTokens + completionTokens,
                  },
                  cost: {
                    promptCost: 0,
                    completionCost: 0,
                    totalCost: 0,
                    currency: "USD",
                  },
                  latency,
                  retryHistory: [],
                  status: "success",
                  isStreaming: true,
                  streamChunks,
                  rawResponse: data,
                });
              }
            }
          } catch (parseError) {
            console.error("Error parsing Ollama stream chunk:", parseError);
          }
        });

        response.data.on("error", (error) => {
          reject(error);
        });
      });
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;

      return {
        requestId,
        provider: "ollama",
        model,
        prompt,
        completion: "",
        systemMessage,
        parameters: { temperature, maxTokens, topP },
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        cost: {
          promptCost: 0,
          completionCost: 0,
          totalCost: 0,
          currency: "USD",
        },
        latency,
        retryHistory: [],
        status: this.getErrorStatus(error),
        error: {
          message: error.message,
          code: error.code || error.response?.status,
          details: error.response?.data || {},
        },
      };
    }
  }

  /**
   * List available models from Ollama
   * @returns {Promise<Array>} List of available models
   */
  async listModels() {
    try {
      const response = await this.client.get("/api/tags");
      return (
        response.data.models?.map((model) => ({
          id: model.name,
          name: model.name,
          size: model.size,
          modified: model.modified_at,
          digest: model.digest,
          details: model.details,
        })) || []
      );
    } catch (error) {
      console.error("Error listing Ollama models:", error.message);
      return [];
    }
  }

  /**
   * Pull a model from Ollama registry
   * @param {string} modelName - Name of the model to pull
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<boolean>} Success status
   */
  async pullModel(modelName, onProgress) {
    try {
      const response = await this.client.post(
        "/api/pull",
        { name: modelName },
        { responseType: "stream" }
      );

      return new Promise((resolve, reject) => {
        response.data.on("data", (chunk) => {
          try {
            const data = JSON.parse(chunk.toString());

            if (onProgress) {
              onProgress({
                status: data.status,
                digest: data.digest,
                total: data.total,
                completed: data.completed,
              });
            }

            if (data.status === "success") {
              resolve(true);
            }
          } catch (parseError) {
            console.error("Error parsing pull progress:", parseError);
          }
        });

        response.data.on("error", (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error("Error pulling Ollama model:", error.message);
      return false;
    }
  }

  /**
   * Delete a model from Ollama
   * @param {string} modelName - Name of the model to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteModel(modelName) {
    try {
      await this.client.delete("/api/delete", { data: { name: modelName } });
      return true;
    } catch (error) {
      console.error("Error deleting Ollama model:", error.message);
      return false;
    }
  }

  /**
   * Test connection to Ollama server
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const response = await this.client.get("/api/tags");
      return response.status === 200;
    } catch (error) {
      console.error("Ollama connection test failed:", error.message);
      return false;
    }
  }

  /**
   * Get server info
   * @returns {Promise<Object>} Server information
   */
  async getServerInfo() {
    try {
      // Ollama doesn't have a dedicated info endpoint, but we can get version info
      const response = await this.client.get("/api/version");
      return {
        version: response.data.version,
        status: "running",
        baseUrl: this.baseUrl,
      };
    } catch (error) {
      return {
        version: "unknown",
        status: "error",
        baseUrl: this.baseUrl,
        error: error.message,
      };
    }
  }

  /**
   * Get error status from error object
   * @param {Error} error - Error object
   * @returns {string} Status string
   */
  getErrorStatus(error) {
    if (error.response) {
      const status = error.response.status;
      if (status >= 500) return "error";
      if (status === 408) return "timeout";
      if (status === 404) return "error"; // Model not found
    }

    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return "timeout";
    }

    if (error.code === "ECONNREFUSED") {
      return "error"; // Ollama server not running
    }

    return "error";
  }

  /**
   * Estimate tokens for Ollama models
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    return tokenCounter.estimateOllamaTokens(text);
  }

  /**
   * Get model information
   * @param {string} model - Model name
   * @returns {Object} Model information
   */
  getModelInfo(model) {
    const commonModels = {
      llama2: {
        maxTokens: 4096,
        contextWindow: 4096,
        type: "chat",
        description: "Meta Llama 2 model",
      },
      codellama: {
        maxTokens: 4096,
        contextWindow: 4096,
        type: "code",
        description: "Code-specialized Llama model",
      },
      mistral: {
        maxTokens: 8192,
        contextWindow: 8192,
        type: "chat",
        description: "Mistral 7B model",
      },
      "neural-chat": {
        maxTokens: 4096,
        contextWindow: 4096,
        type: "chat",
        description: "Intel Neural Chat model",
      },
    };

    // Check for exact match or partial match
    const exactMatch = commonModels[model];
    if (exactMatch) return exactMatch;

    // Check for partial matches
    for (const [key, info] of Object.entries(commonModels)) {
      if (model.includes(key)) {
        return info;
      }
    }

    return {
      maxTokens: 4096,
      contextWindow: 4096,
      type: "unknown",
      description: "Local Ollama model",
    };
  }

  /**
   * Update base URL for Ollama server
   * @param {string} baseUrl - New base URL
   */
  updateBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
    this.client.defaults.baseURL = baseUrl;
  }
}

module.exports = OllamaService;
