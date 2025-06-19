// Example of how a JavaScript OpenAI SDK wrapper for OpenLLM Monitor would work
const axios = require("axios");

/**
 * OpenAI API wrapper that logs all requests to OpenLLM Monitor
 */
class OpenAI {
  /**
   * Initialize the OpenAI client wrapper
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - OpenAI API key
   * @param {string} options.organization - OpenAI organization ID (optional)
   * @param {string} options.monitorUrl - URL of OpenLLM Monitor API
   * @param {boolean} options.enableMonitoring - Whether to enable monitoring
   */
  constructor(options = {}) {
    // Store OpenLLM Monitor configuration
    this.monitorUrl = options.monitorUrl || "http://localhost:3001/api/logs";
    this.enableMonitoring = options.enableMonitoring !== false;

    // Store OpenAI configuration
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    this.organization = options.organization || process.env.OPENAI_ORGANIZATION;

    if (!this.apiKey) {
      throw new Error("OpenAI API key is required");
    }

    // Create nested API structure
    this.chat = {
      completions: {
        create: this._createChatCompletion.bind(this),
      },
    };

    this.completions = {
      create: this._createCompletion.bind(this),
    };

    this.embeddings = {
      create: this._createEmbedding.bind(this),
    };
  }

  /**
   * Log data to OpenLLM Monitor
   * @param {Object} data - Data to log
   * @private
   */
  async _logToMonitor(data) {
    if (!this.enableMonitoring) return;

    try {
      await axios.post(this.monitorUrl, data, { timeout: 2000 });
    } catch (error) {
      // Don't let monitoring failures affect the main application
      console.warn(
        "[OpenLLM Monitor] Warning: Failed to log request:",
        error.message
      );
    }
  }

  /**
   * Create a chat completion
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} - OpenAI API response
   */
  async _createChatCompletion(params) {
    const startTime = Date.now();

    // Extract user prompt and system message for monitoring
    let prompt = "";
    let systemMessage = "";

    if (params.messages) {
      for (const message of params.messages) {
        if (message.role === "user") {
          prompt += message.content + "\n";
        } else if (message.role === "system") {
          systemMessage += message.content + "\n";
        }
      }
    }

    prompt = prompt.trim();
    systemMessage = systemMessage.trim();

    try {
      // In a real implementation, this would call the actual OpenAI API
      // For this example, we'll make a direct axios call
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        params,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            ...(this.organization
              ? { "OpenAI-Organization": this.organization }
              : {}),
          },
        }
      );

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Extract completion from response
      let completion = "";
      if (response.data.choices && response.data.choices.length > 0) {
        completion = response.data.choices[0].message?.content || "";
      }

      // Log to OpenLLM Monitor
      this._logToMonitor({
        timestamp: new Date().toISOString(),
        provider: "openai",
        model: params.model,
        endpoint: "chat.completions",
        status: response.status,
        latency,
        requestBody: params,
        responseBody: response.data,
        prompt,
        systemMessage,
        completion,
        tokenUsage: response.data.usage,
        source: "js-sdk-wrapper",
      });

      return response.data;
    } catch (error) {
      // Also log failed requests
      const endTime = Date.now();
      const latency = endTime - startTime;

      this._logToMonitor({
        timestamp: new Date().toISOString(),
        provider: "openai",
        model: params.model,
        endpoint: "chat.completions",
        status: error.response?.status || 500,
        latency,
        requestBody: params,
        responseBody: error.response?.data || { error: error.message },
        prompt,
        systemMessage,
        error: error.message,
        source: "js-sdk-wrapper",
      });

      throw error;
    }
  }

  /**
   * Create a completion
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} - OpenAI API response
   */
  async _createCompletion(params) {
    // Similar implementation to _createChatCompletion
    // Adapted for the completions endpoint
    // ...

    // For brevity, this example just calls the chat completions method
    // But a real implementation would handle the differences
    return this._createChatCompletion({
      messages: [{ role: "user", content: params.prompt }],
      model: params.model,
      temperature: params.temperature,
      max_tokens: params.max_tokens,
    });
  }

  /**
   * Create an embedding
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} - OpenAI API response
   */
  async _createEmbedding(params) {
    const startTime = Date.now();

    try {
      // In a real implementation, this would call the actual OpenAI API
      const response = await axios.post(
        "https://api.openai.com/v1/embeddings",
        params,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            ...(this.organization
              ? { "OpenAI-Organization": this.organization }
              : {}),
          },
        }
      );

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Log to OpenLLM Monitor
      this._logToMonitor({
        timestamp: new Date().toISOString(),
        provider: "openai",
        model: params.model,
        endpoint: "embeddings",
        status: response.status,
        latency,
        requestBody: params,
        responseBody: response.data,
        tokenUsage: response.data.usage,
        source: "js-sdk-wrapper",
      });

      return response.data;
    } catch (error) {
      // Log failed requests
      const endTime = Date.now();
      const latency = endTime - startTime;

      this._logToMonitor({
        timestamp: new Date().toISOString(),
        provider: "openai",
        model: params.model,
        endpoint: "embeddings",
        status: error.response?.status || 500,
        latency,
        requestBody: params,
        responseBody: error.response?.data || { error: error.message },
        error: error.message,
        source: "js-sdk-wrapper",
      });

      throw error;
    }
  }
}

// Example usage
async function exampleUsage() {
  // Initialize the client with OpenLLM Monitor integration
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    monitorUrl: "http://localhost:3001/api/logs",
  });

  try {
    // Use the client normally - all calls will be logged to OpenLLM Monitor
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, how are you today?" },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  exampleUsage();
}

module.exports = { OpenAI };
