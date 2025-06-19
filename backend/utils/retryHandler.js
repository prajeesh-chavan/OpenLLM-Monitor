/**
 * Retry handler utility for LLM API requests
 */
class RetryHandler {
  constructor() {
    this.defaultConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: [
        "ECONNRESET",
        "ENOTFOUND",
        "ECONNREFUSED",
        "ETIMEDOUT",
        "TIMEOUT",
        "RATE_LIMITED",
        "SERVER_ERROR",
      ],
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    };
  }

  /**
   * Execute a function with retry logic
   * @param {Function} fn - Function to execute
   * @param {Object} config - Retry configuration
   * @returns {Promise} Result or throws final error
   */
  async executeWithRetry(fn, config = {}) {
    const retryConfig = { ...this.defaultConfig, ...config };
    const retryHistory = [];
    let lastError;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      const startTime = Date.now();

      try {
        const result = await fn();

        // If this was a retry attempt, log the successful retry
        if (attempt > 0) {
          retryHistory.push({
            attempt,
            timestamp: new Date(),
            success: true,
            latency: Date.now() - startTime,
          });
        }

        return {
          result,
          retryHistory,
          totalAttempts: attempt + 1,
        };
      } catch (error) {
        lastError = error;
        const latency = Date.now() - startTime;

        // Log this attempt
        retryHistory.push({
          attempt: attempt + 1,
          timestamp: new Date(),
          error: error.message,
          errorCode: error.code || error.status,
          latency,
          success: false,
        });

        // Check if we should retry
        if (
          attempt >= retryConfig.maxRetries ||
          !this.shouldRetry(error, retryConfig)
        ) {
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, retryConfig);
        console.log(
          `Retry attempt ${attempt + 1}/${
            retryConfig.maxRetries
          } after ${delay}ms delay. Error: ${error.message}`
        );

        await this.sleep(delay);
      }
    }

    // All retries exhausted
    const finalError = new Error(
      `Request failed after ${retryConfig.maxRetries + 1} attempts: ${
        lastError.message
      }`
    );
    finalError.originalError = lastError;
    finalError.retryHistory = retryHistory;
    finalError.totalAttempts = retryConfig.maxRetries + 1;

    throw finalError;
  }

  /**
   * Determine if an error should trigger a retry
   * @param {Error} error - The error to check
   * @param {Object} config - Retry configuration
   * @returns {boolean} Whether to retry
   */
  shouldRetry(error, config) {
    // Check HTTP status codes
    if (error.response && error.response.status) {
      return config.retryableStatusCodes.includes(error.response.status);
    }

    // Check error codes
    if (error.code) {
      return config.retryableErrors.includes(error.code);
    }

    // Check error messages for common patterns
    const errorMessage = error.message.toLowerCase();

    const retryablePatterns = [
      "timeout",
      "network error",
      "connection reset",
      "connection refused",
      "rate limit",
      "server error",
      "service unavailable",
      "too many requests",
      "internal server error",
      "bad gateway",
      "gateway timeout",
    ];

    return retryablePatterns.some((pattern) => errorMessage.includes(pattern));
  }

  /**
   * Calculate delay for next retry attempt
   * @param {number} attempt - Current attempt number (0-based)
   * @param {Object} config - Retry configuration
   * @returns {number} Delay in milliseconds
   */
  calculateDelay(attempt, config) {
    // Exponential backoff
    let delay = Math.min(
      config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
      config.maxDelay
    );

    // Add jitter to prevent thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a retry wrapper for LLM API calls
   * @param {Object} config - Retry configuration
   * @returns {Function} Retry wrapper function
   */
  createRetryWrapper(config = {}) {
    return async (apiCall) => {
      return this.executeWithRetry(apiCall, config);
    };
  }

  /**
   * Analyze retry history to get insights
   * @param {Array} retryHistory - Array of retry attempts
   * @returns {Object} Analysis results
   */
  analyzeRetryHistory(retryHistory) {
    if (!retryHistory || retryHistory.length === 0) {
      return {
        totalRetries: 0,
        totalLatency: 0,
        avgLatency: 0,
        errorPatterns: {},
        successOnRetry: false,
      };
    }

    const totalRetries = retryHistory.length;
    const totalLatency = retryHistory.reduce(
      (sum, attempt) => sum + attempt.latency,
      0
    );
    const avgLatency = totalLatency / totalRetries;

    // Analyze error patterns
    const errorPatterns = {};
    let successOnRetry = false;

    retryHistory.forEach((attempt) => {
      if (attempt.success) {
        successOnRetry = true;
      } else if (attempt.error) {
        const errorType = this.categorizeError(attempt.error);
        errorPatterns[errorType] = (errorPatterns[errorType] || 0) + 1;
      }
    });

    return {
      totalRetries,
      totalLatency,
      avgLatency: Math.round(avgLatency),
      errorPatterns,
      successOnRetry,
      lastAttemptSuccess:
        retryHistory[retryHistory.length - 1]?.success || false,
    };
  }

  /**
   * Categorize error for analysis
   * @param {string} errorMessage - Error message
   * @returns {string} Error category
   */
  categorizeError(errorMessage) {
    const message = errorMessage.toLowerCase();

    if (message.includes("timeout")) return "timeout";
    if (message.includes("rate limit") || message.includes("too many requests"))
      return "rate_limit";
    if (message.includes("network") || message.includes("connection"))
      return "network";
    if (message.includes("server error") || message.includes("internal"))
      return "server_error";
    if (message.includes("authentication") || message.includes("unauthorized"))
      return "auth_error";
    if (message.includes("quota") || message.includes("limit exceeded"))
      return "quota_exceeded";

    return "unknown";
  }

  /**
   * Get retry configuration for specific provider
   * @param {string} provider - Provider name
   * @returns {Object} Provider-specific retry config
   */
  getProviderRetryConfig(provider) {
    const providerConfigs = {
      openai: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      },

      openrouter: {
        maxRetries: 2,
        baseDelay: 2000,
        maxDelay: 20000,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      },

      mistral: {
        maxRetries: 3,
        baseDelay: 1500,
        maxDelay: 25000,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      },

      ollama: {
        maxRetries: 2,
        baseDelay: 500,
        maxDelay: 10000,
        retryableStatusCodes: [500, 502, 503, 504], // Local server, no rate limits
      },
    };

    return { ...this.defaultConfig, ...(providerConfigs[provider] || {}) };
  }

  /**
   * Create a circuit breaker pattern for frequent failures
   * @param {Object} config - Circuit breaker configuration
   * @returns {Object} Circuit breaker instance
   */
  createCircuitBreaker(config = {}) {
    const cbConfig = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      ...config,
    };

    let failures = 0;
    let lastFailureTime = 0;
    let state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN

    return {
      async execute(fn) {
        const now = Date.now();

        // Reset failure count after monitoring period
        if (now - lastFailureTime > cbConfig.monitoringPeriod) {
          failures = 0;
        }

        // Check circuit state
        if (state === "OPEN") {
          if (now - lastFailureTime > cbConfig.resetTimeout) {
            state = "HALF_OPEN";
          } else {
            throw new Error(
              "Circuit breaker is OPEN - too many recent failures"
            );
          }
        }

        try {
          const result = await fn();

          // Success - reset if we were in HALF_OPEN
          if (state === "HALF_OPEN") {
            failures = 0;
            state = "CLOSED";
          }

          return result;
        } catch (error) {
          failures++;
          lastFailureTime = now;

          // Open circuit if threshold exceeded
          if (failures >= cbConfig.failureThreshold) {
            state = "OPEN";
          }

          throw error;
        }
      },

      getState: () => ({ state, failures, lastFailureTime }),
      reset: () => {
        failures = 0;
        lastFailureTime = 0;
        state = "CLOSED";
      },
    };
  }
}

module.exports = new RetryHandler();
