const Log = require("../models/Log");
const tokenCounter = require("../utils/tokenCounter");
const costEstimator = require("../utils/costEstimator");
const { v4: uuidv4 } = require("uuid");

/**
 * Middleware to log LLM API requests and responses
 */
class LLMLogger {
  constructor() {
    this.activeRequests = new Map(); // Track ongoing requests
    this.io = null; // WebSocket instance
  }

  /**
   * Set the WebSocket instance for real-time updates
   * @param {Object} io - Socket.io instance
   */
  setWebSocketInstance(io) {
    this.io = io;
  }

  /**
   * Create logging middleware
   * @param {Object} options - Middleware options
   * @returns {Function} Express middleware function
   */
  createMiddleware(options = {}) {
    const {
      enabled = true,
      logPrompt = true,
      logCompletion = true,
      logParameters = true,
      logRetries = true,
      logErrors = true,
      maxPromptLength = 10000,
      maxCompletionLength = 10000,
    } = options;

    return (req, res, next) => {
      if (!enabled) {
        return next();
      }

      // Only log specific LLM API endpoints
      const isLLMRequest = this.isLLMRequest(req);
      if (!isLLMRequest) {
        return next();
      }

      const requestId = uuidv4();
      const startTime = Date.now();

      // Extract request metadata
      const metadata = this.extractRequestMetadata(req);

      // Store request info
      this.activeRequests.set(requestId, {
        startTime,
        metadata,
        req,
        res,
      });

      // Override response methods to capture response data
      const originalSend = res.send;
      const originalJson = res.json;
      const originalEnd = res.end;

      res.send = function (data) {
        this.responseData = data;
        return originalSend.call(this, data);
      };

      res.json = function (data) {
        this.responseData = data;
        return originalJson.call(this, data);
      };

      res.end = function (data) {
        this.responseData = data;
        return originalEnd.call(this, data);
      };

      // Log the request when response finishes
      res.on("finish", async () => {
        try {
          const endTime = Date.now();
          const latency = endTime - startTime;

          const logData = await this.createLogEntry({
            requestId,
            metadata,
            req,
            res,
            latency,
            options: {
              logPrompt,
              logCompletion,
              logParameters,
              maxPromptLength,
              maxCompletionLength,
            },
          });

          // Save to database
          await this.saveLog(logData);

          // Clean up
          this.activeRequests.delete(requestId);
        } catch (error) {
          console.error("Error logging LLM request:", error);
          this.activeRequests.delete(requestId);
        }
      });

      // Handle request errors
      res.on("error", async (error) => {
        try {
          const endTime = Date.now();
          const latency = endTime - startTime;

          const logData = await this.createErrorLogEntry({
            requestId,
            metadata,
            req,
            error,
            latency,
          });

          await this.saveLog(logData);
          this.activeRequests.delete(requestId);
        } catch (logError) {
          console.error("Error logging LLM request error:", logError);
          this.activeRequests.delete(requestId);
        }
      });

      next();
    };
  }

  /**
   * Check if request is an LLM API request
   * @param {Object} req - Express request object
   * @returns {boolean} True if LLM request
   */ isLLMRequest(req) {
    const llmEndpoints = [
      "/api/replay",
      "/chat/completions",
      "/completions",
      "/api/generate", // Ollama
      "/v1/chat/completions", // OpenRouter
      "/complete", // Our new completion endpoint
    ];

    return llmEndpoints.some((endpoint) => req.path.includes(endpoint));
  }

  /**
   * Extract metadata from request
   * @param {Object} req - Express request object
   * @returns {Object} Request metadata
   */
  extractRequestMetadata(req) {
    const body = req.body || {};

    return {
      provider: this.detectProvider(req),
      model: body.model || "unknown",
      method: req.method,
      path: req.path,
      userAgent: req.get("User-Agent") || "",
      ipAddress: req.ip || req.connection.remoteAddress || "",
      headers: {
        authorization: req.get("Authorization") ? "[REDACTED]" : null,
        contentType: req.get("Content-Type") || "",
        accept: req.get("Accept") || "",
      },
      timestamp: new Date(),
    };
  }

  /**
   * Detect provider from request
   * @param {Object} req - Express request object
   * @returns {string} Provider name
   */ detectProvider(req) {
    const host = req.get("host") || "";
    const path = req.path || "";
    const userAgent = req.get("User-Agent") || "";

    if (host.includes("openai.com") || path.includes("openai")) {
      return "openai";
    }

    if (host.includes("openrouter.ai") || path.includes("openrouter")) {
      return "openrouter";
    }

    if (host.includes("mistral.ai") || path.includes("mistral")) {
      return "mistral";
    }

    if (host.includes("localhost") && path.includes("api/generate")) {
      return "ollama";
    }

    // Check for our new provider-specific complete endpoints
    if (path.includes("/api/providers/")) {
      const match = path.match(/\/api\/providers\/([^\/]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Check for replay requests
    if (path.includes("/api/replay")) {
      return req.body?.provider || "unknown";
    }

    return "unknown";
  }

  /**
   * Create log entry from successful request
   * @param {Object} params - Log parameters
   * @returns {Object} Log entry data
   */
  async createLogEntry(params) {
    const { requestId, metadata, req, res, latency, options } = params;

    const requestBody = req.body || {};
    const responseData = this.parseResponseData(res.responseData);

    // Extract prompt and completion
    const prompt = this.extractPrompt(requestBody, options.maxPromptLength);
    const completion = this.extractCompletion(
      responseData,
      options.maxCompletionLength
    );
    const systemMessage = this.extractSystemMessage(requestBody);

    // Calculate token usage
    const tokenUsage = await this.calculateTokenUsage({
      prompt,
      completion,
      provider: metadata.provider,
      model: metadata.model,
      responseData,
    });

    // Calculate cost
    const cost = costEstimator.calculateCost({
      provider: metadata.provider,
      model: metadata.model,
      promptTokens: tokenUsage.promptTokens,
      completionTokens: tokenUsage.completionTokens,
    });

    // Determine status
    const status = this.determineStatus(res, responseData);

    return {
      requestId,
      provider: metadata.provider,
      model: metadata.model,
      prompt: options.logPrompt ? prompt : "[REDACTED]",
      completion: options.logCompletion ? completion : "[REDACTED]",
      systemMessage,
      parameters: options.logParameters
        ? this.extractParameters(requestBody)
        : {},
      tokenUsage,
      cost,
      latency,
      status,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      rawResponse: responseData,
      finishReason: responseData?.choices?.[0]?.finish_reason || null,
      retryAttempts: 0,
      retryHistory: [],
      createdAt: new Date(),
    };
  }

  /**
   * Create log entry for error
   * @param {Object} params - Error log parameters
   * @returns {Object} Error log entry data
   */
  async createErrorLogEntry(params) {
    const { requestId, metadata, req, error, latency } = params;

    const requestBody = req.body || {};
    const prompt = this.extractPrompt(requestBody, 1000);
    const systemMessage = this.extractSystemMessage(requestBody);

    return {
      requestId,
      provider: metadata.provider,
      model: metadata.model,
      prompt,
      completion: "",
      systemMessage,
      parameters: this.extractParameters(requestBody),
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      cost: { promptCost: 0, completionCost: 0, totalCost: 0, currency: "USD" },
      latency,
      status: "error",
      error: {
        message: error.message,
        code: error.code || "UNKNOWN",
        details: error.stack || "",
      },
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      retryAttempts: 0,
      retryHistory: [],
      createdAt: new Date(),
    };
  }

  /**
   * Parse response data
   * @param {*} responseData - Raw response data
   * @returns {Object} Parsed response data
   */ parseResponseData(responseData) {
    if (!responseData) return {};

    try {
      if (Buffer.isBuffer(responseData)) {
        // Convert Buffer to string then parse as JSON
        const jsonString = responseData.toString("utf8");
        return JSON.parse(jsonString);
      } else if (typeof responseData === "string") {
        return JSON.parse(responseData);
      }
      return responseData;
    } catch (error) {
      console.error("Error parsing response data:", error);
      return { rawData: responseData };
    }
  }

  /**
   * Extract prompt from request body
   * @param {Object} requestBody - Request body
   * @param {number} maxLength - Maximum prompt length
   * @returns {string} Extracted prompt
   */
  extractPrompt(requestBody, maxLength) {
    let prompt = "";

    if (requestBody.messages && Array.isArray(requestBody.messages)) {
      // ChatML format
      const userMessage = requestBody.messages.find((m) => m.role === "user");
      prompt = userMessage?.content || "";
    } else if (requestBody.prompt) {
      // Direct prompt
      prompt = requestBody.prompt;
    } else if (requestBody.input) {
      // Alternative input field
      prompt = requestBody.input;
    }

    // Truncate if too long
    if (prompt.length > maxLength) {
      prompt = prompt.substring(0, maxLength) + "... [TRUNCATED]";
    }

    return prompt;
  }

  /**
   * Extract completion from response data
   * @param {Object} responseData - Response data
   * @param {number} maxLength - Maximum completion length
   * @returns {string} Extracted completion
   */ extractCompletion(responseData, maxLength) {
    let completion = "";

    if (responseData.choices && Array.isArray(responseData.choices)) {
      // OpenAI/OpenRouter format
      completion =
        responseData.choices[0]?.message?.content ||
        responseData.choices[0]?.text ||
        "";
    } else if (responseData.data && responseData.data.completion) {
      // Our new complete endpoint format
      completion = responseData.data.completion;
    } else if (responseData.response) {
      // Ollama format
      completion = responseData.response;
    } else if (responseData.result) {
      // Custom result format
      completion = responseData.result;
    }

    // Truncate if too long
    if (completion.length > maxLength) {
      completion = completion.substring(0, maxLength) + "... [TRUNCATED]";
    }

    return completion;
  }

  /**
   * Extract system message from request body
   * @param {Object} requestBody - Request body
   * @returns {string} System message
   */
  extractSystemMessage(requestBody) {
    if (requestBody.messages && Array.isArray(requestBody.messages)) {
      const systemMessage = requestBody.messages.find(
        (m) => m.role === "system"
      );
      return systemMessage?.content || "";
    }
    return requestBody.system || "";
  }

  /**
   * Extract parameters from request body
   * @param {Object} requestBody - Request body
   * @returns {Object} Parameters object
   */
  extractParameters(requestBody) {
    return {
      temperature: requestBody.temperature,
      maxTokens: requestBody.max_tokens || requestBody.maxTokens,
      topP: requestBody.top_p || requestBody.topP,
      frequencyPenalty:
        requestBody.frequency_penalty || requestBody.frequencyPenalty,
      presencePenalty:
        requestBody.presence_penalty || requestBody.presencePenalty,
      stop: requestBody.stop,
    };
  }

  /**
   * Calculate token usage
   * @param {Object} params - Token calculation parameters
   * @returns {Promise<Object>} Token usage object
   */
  async calculateTokenUsage(params) {
    const { prompt, completion, provider, model, responseData } = params;

    // Use response data if available
    if (responseData.usage) {
      // OpenAI/OpenRouter format
      return tokenCounter.validateUsage({
        promptTokens: responseData.usage.prompt_tokens,
        completionTokens: responseData.usage.completion_tokens,
        totalTokens: responseData.usage.total_tokens,
      });
    } else if (responseData.data && responseData.data.tokenUsage) {
      // Our new complete endpoint format
      return tokenCounter.validateUsage({
        promptTokens: responseData.data.tokenUsage.promptTokens,
        completionTokens: responseData.data.tokenUsage.completionTokens,
        totalTokens: responseData.data.tokenUsage.totalTokens,
      });
    }

    console.log(
      "Response Data for Token Usage:",
      JSON.stringify(responseData, null, 2)
    );

    // Calculate manually
    const promptTokens = await tokenCounter.getTokenCount(prompt, provider, model);
    const completionTokens = await tokenCounter.getTokenCount(
      completion,
      provider,
      model
    );

    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }

  /**
   * Determine request status
   * @param {Object} res - Express response object
   * @param {Object} responseData - Response data
   * @returns {string} Status string
   */
  determineStatus(res, responseData) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return "success";
    }

    if (res.statusCode === 429) {
      return "rate_limited";
    }

    if (res.statusCode === 408 || res.statusCode === 504) {
      return "timeout";
    }

    return "error";
  }

  /**
   * Save log to database
   * @param {Object} logData - Log data to save
   */ async saveLog(logData) {
    try {
      const log = new Log(logData);
      await log.save();

      // Emit WebSocket event for real-time updates
      if (this.io) {
        this.io.to("logs").emit("new-log", {
          type: "new-log",
          data: log.toObject(),
          timestamp: new Date(),
        });
        console.log("📡 Emitted new-log WebSocket event");
      }
    } catch (error) {
      console.error("Failed to save log to database:", error);
      // Optionally implement fallback logging (file, etc.)
    }
  }

  /**
   * Get active requests count
   * @returns {number} Number of active requests
   */
  getActiveRequestsCount() {
    return this.activeRequests.size;
  }

  /**
   * Get active requests info
   * @returns {Array} Active requests information
   */
  getActiveRequestsInfo() {
    return Array.from(this.activeRequests.entries()).map(([id, info]) => ({
      requestId: id,
      provider: info.metadata.provider,
      model: info.metadata.model,
      startTime: info.startTime,
      duration: Date.now() - info.startTime,
    }));
  }

  /**
   * Clear old active requests (cleanup)
   * @param {number} maxAge - Maximum age in milliseconds
   */
  cleanupActiveRequests(maxAge = 300000) {
    // 5 minutes
    const now = Date.now();

    for (const [id, info] of this.activeRequests.entries()) {
      if (now - info.startTime > maxAge) {
        this.activeRequests.delete(id);
      }
    }
  }
}

// Export singleton instance
module.exports = new LLMLogger();
