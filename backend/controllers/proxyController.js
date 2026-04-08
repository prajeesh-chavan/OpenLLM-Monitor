const { v4: uuidv4 } = require("uuid");
const OllamaService = require("../services/ollamaService");
const OpenAIService = require("../services/openaiService");
const OpenRouterService = require("../services/openrouterService");
const mistralService = require("../services/mistralService");
const GeminiService = require("../services/geminiService");
const GrokService = require("../services/grokService");
const tokenCounter = require("../utils/tokenCounter");
const costEstimator = require("../utils/costEstimator");
const Log = require("../models/Log");

/**
 * OpenAI-compatible proxy controller
 * Accepts requests in OpenAI chat completion format and routes to the appropriate provider
 */
class ProxyController {
  constructor() {
    this.services = {
      openai: new OpenAIService(),
      ollama: new OllamaService(),
      openrouter: new OpenRouterService(),
      mistral: mistralService,
      gemini: new GeminiService(),
      grok: new GrokService(),
    };
    this.io = null;
  }

  /**
   * Set WebSocket instance for real-time log broadcasting
   */
  setWebSocketInstance(io) {
    this.io = io;
  }

  /**
   * Detect provider from model name
   */
  detectProvider(model) {
    // Explicit prefix: "openrouter/meta-llama/..." or "ollama/llama3"
    if (model.includes("/")) {
      const prefix = model.split("/")[0].toLowerCase();
      const knownProviders = [
        "openrouter",
        "mistral",
        "openai",
        "ollama",
        "gemini",
        "grok",
      ];
      if (knownProviders.includes(prefix)) {
        return {
          provider: prefix,
          modelName: model.split("/").slice(1).join("/"),
        };
      }
      // Slash models default to openrouter
      return { provider: "openrouter", modelName: model };
    }

    // Known model patterns
    if (model.startsWith("gpt-") || model.startsWith("o1") || model.startsWith("o3") || model.startsWith("o4"))
      return { provider: "openai", modelName: model };
    if (model.startsWith("mistral") || model.startsWith("codestral"))
      return { provider: "mistral", modelName: model };
    if (model.startsWith("gemini"))
      return { provider: "gemini", modelName: model };
    if (model.startsWith("grok"))
      return { provider: "grok", modelName: model };

    // Default → ollama (local models)
    return { provider: "ollama", modelName: model };
  }

  /**
   * Extract prompt and system message from OpenAI messages array
   */
  extractFromMessages(messages) {
    let systemMessage = "";
    let prompt = "";

    for (const msg of messages) {
      if (msg.role === "system") {
        systemMessage += (systemMessage ? "\n" : "") + msg.content;
      } else if (msg.role === "user") {
        prompt += (prompt ? "\n" : "") + msg.content;
      }
    }

    return { prompt, systemMessage };
  }

  /**
   * Build OpenAI-compatible response object
   */
  buildOpenAIResponse(requestId, model, completion, tokenUsage, finishReason) {
    return {
      id: `chatcmpl-${requestId}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: completion,
          },
          finish_reason: finishReason || "stop",
        },
      ],
      usage: {
        prompt_tokens: tokenUsage.promptTokens || 0,
        completion_tokens: tokenUsage.completionTokens || 0,
        total_tokens: tokenUsage.totalTokens || 0,
      },
    };
  }

  /**
   * Save log entry and broadcast via WebSocket
   */
  async saveAndBroadcastLog(logData) {
    try {
      const log = new Log(logData);
      await log.save();

      if (this.io) {
        this.io.to("logs").emit("new-log", {
          type: "new-log",
          data: log.toObject(),
          timestamp: new Date(),
        });
      }

      return log;
    } catch (error) {
      console.error("Failed to save proxy log:", error.message);
    }
  }

  /**
   * POST /v1/chat/completions
   * OpenAI-compatible chat completion endpoint
   */
  async chatCompletion(req, res) {
    const {
      model,
      messages,
      temperature = 0.7,
      max_tokens,
      top_p = 1.0,
      stream = false,
      frequency_penalty = 0,
      presence_penalty = 0,
      stop,
    } = req.body;

    // Validate required fields
    if (!model) {
      return res.status(400).json({
        error: {
          message: "model is required",
          type: "invalid_request_error",
          code: "model_required",
        },
      });
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: {
          message: "messages must be a non-empty array",
          type: "invalid_request_error",
          code: "messages_required",
        },
      });
    }

    const { provider, modelName } = this.detectProvider(model);
    const service = this.services[provider];

    if (!service) {
      return res.status(400).json({
        error: {
          message: `Unsupported provider: ${provider} (detected from model: ${model})`,
          type: "invalid_request_error",
          code: "unsupported_provider",
        },
      });
    }

    const requestId = `proxy-${uuidv4()}`;
    const { prompt, systemMessage } = this.extractFromMessages(messages);

    const requestParams = {
      prompt,
      model: modelName,
      systemMessage,
      temperature,
      maxTokens: max_tokens || null,
      topP: top_p,
      frequencyPenalty: frequency_penalty,
      presencePenalty: presence_penalty,
      stop,
      stream: false, // We handle streaming ourselves
      requestId,
    };

    // --- STREAMING ---
    if (stream) {
      return this.handleStreamingResponse(
        req,
        res,
        provider,
        service,
        requestParams,
        model,
        requestId,
        prompt,
        systemMessage,
        { temperature, max_tokens, top_p, frequency_penalty, presence_penalty }
      );
    }

    // --- NON-STREAMING ---
    try {
      const startTime = Date.now();
      const result = await service.sendPrompt(requestParams);
      const latency = Date.now() - startTime;

      const tokenUsage = result.tokenUsage || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
      const completion = result.completion || "";
      const finishReason = result.finishReason || "stop";
      const cost = result.cost ||
        costEstimator.calculateCost({
          provider,
          model: modelName,
          promptTokens: tokenUsage.promptTokens,
          completionTokens: tokenUsage.completionTokens,
        });

      // Save log
      this.saveAndBroadcastLog({
        requestId,
        provider,
        model: modelName,
        prompt,
        completion,
        systemMessage,
        parameters: {
          temperature,
          maxTokens: max_tokens,
          topP: top_p,
          frequencyPenalty: frequency_penalty,
          presencePenalty: presence_penalty,
        },
        tokenUsage,
        cost,
        latency,
        status: result.status || "success",
        error: result.error || null,
        isStreaming: false,
        createdAt: new Date(),
      });

      // Return OpenAI-compatible response
      const response = this.buildOpenAIResponse(
        requestId,
        model,
        completion,
        tokenUsage,
        finishReason
      );

      return res.json(response);
    } catch (error) {
      console.error("Proxy non-streaming error:", error.message);

      // Save error log
      this.saveAndBroadcastLog({
        requestId,
        provider,
        model: modelName,
        prompt,
        completion: "",
        systemMessage,
        parameters: { temperature, maxTokens: max_tokens, topP: top_p },
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        cost: { promptCost: 0, completionCost: 0, totalCost: 0, currency: "USD" },
        latency: 0,
        status: "error",
        error: { message: error.message, code: error.code },
        isStreaming: false,
        createdAt: new Date(),
      });

      return res.status(500).json({
        error: {
          message: error.message || "Internal server error",
          type: "server_error",
          code: "proxy_error",
        },
      });
    }
  }

  /**
   * Handle streaming response in OpenAI SSE format
   */
  async handleStreamingResponse(
    req,
    res,
    provider,
    service,
    requestParams,
    originalModel,
    requestId,
    prompt,
    systemMessage,
    params
  ) {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const startTime = Date.now();
    let fullCompletion = "";
    const streamChunks = [];

    // Send initial role delta
    const initialChunk = {
      id: `chatcmpl-${requestId}`,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1000),
      model: originalModel,
      choices: [
        {
          index: 0,
          delta: { role: "assistant", content: "" },
          finish_reason: null,
        },
      ],
    };
    res.write(`data: ${JSON.stringify(initialChunk)}\n\n`);

    try {
      // Check if service supports streaming
      if (typeof service.streamCompletion === "function") {
        await service.streamCompletion(requestParams, (chunkData) => {
          const content = chunkData.content || "";
          fullCompletion += content;

          streamChunks.push({
            timestamp: new Date(),
            content,
            finishReason: chunkData.finishReason || null,
          });

          const sseChunk = {
            id: `chatcmpl-${requestId}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: originalModel,
            choices: [
              {
                index: 0,
                delta: { content },
                finish_reason: chunkData.finishReason || null,
              },
            ],
          };
          res.write(`data: ${JSON.stringify(sseChunk)}\n\n`);
        });
      } else {
        // Fallback: non-streaming service, simulate streaming
        const result = await service.sendPrompt(requestParams);
        fullCompletion = result.completion || "";

        // Send completion as a single chunk
        const sseChunk = {
          id: `chatcmpl-${requestId}`,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: originalModel,
          choices: [
            {
              index: 0,
              delta: { content: fullCompletion },
              finish_reason: "stop",
            },
          ],
        };
        res.write(`data: ${JSON.stringify(sseChunk)}\n\n`);
      }

      // Send finish chunk
      const finishChunk = {
        id: `chatcmpl-${requestId}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: originalModel,
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: "stop",
          },
        ],
      };
      res.write(`data: ${JSON.stringify(finishChunk)}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();

      // Calculate tokens and cost after stream ends
      const latency = Date.now() - startTime;
      let promptTokens = 0;
      let completionTokens = 0;

      try {
        promptTokens = await tokenCounter.getTokenCount(
          prompt,
          provider,
          requestParams.model
        );
        completionTokens = await tokenCounter.getTokenCount(
          fullCompletion,
          provider,
          requestParams.model
        );
      } catch (e) {
        // Fallback estimation
        promptTokens = Math.ceil(prompt.length / 4);
        completionTokens = Math.ceil(fullCompletion.length / 4);
      }

      const tokenUsage = {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      };

      const cost = costEstimator.calculateCost({
        provider,
        model: requestParams.model,
        promptTokens,
        completionTokens,
      });

      // Save log after stream completes
      this.saveAndBroadcastLog({
        requestId,
        provider,
        model: requestParams.model,
        prompt,
        completion: fullCompletion,
        systemMessage,
        parameters: {
          temperature: params.temperature,
          maxTokens: params.max_tokens,
          topP: params.top_p,
        },
        tokenUsage,
        cost,
        latency,
        status: "success",
        isStreaming: true,
        streamChunks,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Proxy streaming error:", error.message);

      // Send error as SSE
      const errorChunk = {
        id: `chatcmpl-${requestId}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: originalModel,
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: "stop",
          },
        ],
      };
      res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();

      // Save error log
      this.saveAndBroadcastLog({
        requestId,
        provider,
        model: requestParams.model,
        prompt,
        completion: fullCompletion,
        systemMessage,
        parameters: {
          temperature: params.temperature,
          maxTokens: params.max_tokens,
          topP: params.top_p,
        },
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        cost: { promptCost: 0, completionCost: 0, totalCost: 0, currency: "USD" },
        latency: Date.now() - startTime,
        status: "error",
        error: { message: error.message, code: error.code },
        isStreaming: true,
        createdAt: new Date(),
      });
    }
  }

  /**
   * GET /v1/models
   * List available models from all providers
   */
  async listModels(req, res) {
    try {
      const allModels = [];

      // Ollama models
      try {
        const ollamaModels = await this.services.ollama.listModels();
        if (Array.isArray(ollamaModels)) {
          for (const m of ollamaModels) {
            const name = typeof m === "string" ? m : m.name || m.model;
            if (name) {
              allModels.push({
                id: name,
                object: "model",
                created: Math.floor(Date.now() / 1000),
                owned_by: "ollama",
              });
            }
          }
        }
      } catch (e) {
        // Ollama not available
      }

      // Static models from known providers
      const staticModels = [
        { id: "gpt-4", owned_by: "openai" },
        { id: "gpt-4-turbo", owned_by: "openai" },
        { id: "gpt-3.5-turbo", owned_by: "openai" },
        { id: "mistral-large-latest", owned_by: "mistral" },
        { id: "mistral-small-latest", owned_by: "mistral" },
      ];

      for (const m of staticModels) {
        allModels.push({
          id: m.id,
          object: "model",
          created: Math.floor(Date.now() / 1000),
          owned_by: m.owned_by,
        });
      }

      return res.json({
        object: "list",
        data: allModels,
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          message: "Failed to list models",
          type: "server_error",
        },
      });
    }
  }
}

module.exports = new ProxyController();
