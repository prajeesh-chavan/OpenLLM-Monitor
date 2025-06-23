# Utilities - Detailed Documentation

## 🎯 Utilities Overview

The Utilities layer provides essential helper functions and classes that support the core functionality of the OpenLLM Monitor. These utilities handle cost estimation, token counting, retry logic, and other common operations needed across the application.

## 📁 Files Involved

### Utility Files

- `utils/costEstimator.js` - Cost calculation for different providers (311 lines)
- `utils/tokenCounter.js` - Token counting and estimation (184 lines)
- `utils/retryHandler.js` - Retry logic for API failures (362 lines)

## 💰 Cost Estimator (`costEstimator.js`)

### Class Overview

Calculates costs for LLM API usage based on provider pricing models and token consumption.

### Constructor - Pricing Database

```javascript
constructor() {
  this.pricing = {
    openai: {
      "gpt-4": { prompt: 0.03, completion: 0.06 },
      "gpt-3.5-turbo": { prompt: 0.0015, completion: 0.002 },
      // ... more models
    },
    mistral: {
      "mistral-tiny": { prompt: 0.00025, completion: 0.00025 },
      "mistral-small": { prompt: 0.002, completion: 0.006 },
      // ... more models
    },
    openrouter: {
      "openai/gpt-4": { prompt: 0.03, completion: 0.06 },
      // ... more models
    },
    ollama: {
      default: { prompt: 0.0, completion: 0.0 }  // Free (local)
    }
  };
}
```

**Pricing Structure**: All prices are in USD per 1,000 tokens, separated by prompt and completion costs.

### Method: `calculateCost(provider, model, tokenUsage)` - Core Cost Calculation

#### Input Parameters

```javascript
{
  provider: "openai",           // Provider name
  model: "gpt-3.5-turbo",      // Model name
  tokenUsage: {
    promptTokens: 50,          // Input tokens
    completionTokens: 100,     // Output tokens
    totalTokens: 150           // Total tokens
  }
}
```

#### Process Flow

1. **Provider Validation**: Checks if provider exists in pricing database
2. **Model Lookup**: Finds specific model pricing or uses default
3. **Cost Calculation**: Applies pricing to token usage
4. **Result Formatting**: Returns detailed cost breakdown

#### Calculation Logic

```javascript
calculateCost(provider, model, tokenUsage) {
  const providerPricing = this.pricing[provider.toLowerCase()];
  if (!providerPricing) {
    return { promptCost: 0, completionCost: 0, totalCost: 0 };
  }

  const modelPricing = providerPricing[model] || providerPricing.default || { prompt: 0, completion: 0 };

  const promptCost = (tokenUsage.promptTokens / 1000) * modelPricing.prompt;
  const completionCost = (tokenUsage.completionTokens / 1000) * modelPricing.completion;
  const totalCost = promptCost + completionCost;

  return {
    promptCost: Math.round(promptCost * 1000000) / 1000000,      // 6 decimal places
    completionCost: Math.round(completionCost * 1000000) / 1000000,
    totalCost: Math.round(totalCost * 1000000) / 1000000
  };
}
```

### Method: `getCostBreakdown(provider, model, tokenUsage)` - Detailed Analysis

#### Purpose

Provides detailed cost analysis including per-token costs and efficiency metrics.

#### Response Format

```javascript
{
  provider: "openai",
  model: "gpt-3.5-turbo",
  costs: {
    promptCost: 0.000075,
    completionCost: 0.0002,
    totalCost: 0.000275
  },
  pricing: {
    promptPricePerK: 0.0015,
    completionPricePerK: 0.002
  },
  efficiency: {
    costPerToken: 0.00000183,
    costPerCharacter: 0.0000007,
    tokensPerDollar: 545454
  },
  tokenUsage: {
    promptTokens: 50,
    completionTokens: 100,
    totalTokens: 150
  }
}
```

### Method: `estimateMonthlyProjection(dailyCost, growthRate)` - Cost Projections

#### Purpose

Projects monthly and yearly costs based on current usage patterns.

#### Calculation

```javascript
estimateMonthlyProjection(dailyCost, growthRate = 0) {
  const daysInMonth = 30;
  const monthsInYear = 12;

  let monthlyCost = dailyCost * daysInMonth;
  if (growthRate > 0) {
    // Apply compound growth
    const dailyGrowthRate = growthRate / 365;
    monthlyCost = dailyCost * ((Math.pow(1 + dailyGrowthRate, 30) - 1) / dailyGrowthRate);
  }

  const yearlyCost = monthlyCost * monthsInYear;

  return {
    daily: dailyCost,
    monthly: monthlyCost,
    yearly: yearlyCost,
    growthRate: growthRate
  };
}
```

## 🔢 Token Counter (`tokenCounter.js`)

### Class Overview

Counts and estimates tokens for different LLM providers using accurate tokenization libraries.

### Constructor - Encoding Cache

```javascript
constructor() {
  this.encodings = new Map();  // Cache for encoding objects
}
```

**Caching Strategy**: Stores encoding objects to avoid repeated initialization overhead.

### Method: `getEncoding(model)` - Model-Specific Encoding

#### Purpose

Gets the appropriate tokenization encoding for a specific model.

#### Process Flow

1. **Cache Check**: Looks for cached encoding first
2. **Model-Specific**: Attempts to get model-specific encoding
3. **Fallback**: Uses cl100k_base encoding for unknown models
4. **Caching**: Stores encoding for future use

#### Implementation

```javascript
getEncoding(model) {
  if (this.encodings.has(model)) {
    return this.encodings.get(model);
  }

  let encoding;
  try {
    encoding = encoding_for_model(model);
  } catch (error) {
    console.warn(`Unknown model ${model}, using cl100k_base encoding`);
    encoding = get_encoding("cl100k_base");
  }

  this.encodings.set(model, encoding);
  return encoding;
}
```

### Method: `countTokens(text, model)` - Accurate Token Counting

#### Purpose

Provides precise token counts for text using tiktoken library.

#### Input Parameters

- `text` (string) - Text to count tokens for
- `model` (string) - Model name for appropriate encoding, default: "gpt-3.5-turbo"

#### Process Flow

1. **Input Validation**: Checks for valid text input
2. **Encoding Selection**: Gets appropriate encoding for model
3. **Tokenization**: Encodes text to tokens
4. **Fallback**: Uses character-based estimation if encoding fails

#### Implementation

```javascript
countTokens(text, model = "gpt-3.5-turbo") {
  if (!text || typeof text !== "string") {
    return 0;
  }

  try {
    const encoding = this.getEncoding(model);
    const tokens = encoding.encode(text);
    return tokens.length;
  } catch (error) {
    console.error("Error counting tokens:", error);
    // Fallback: rough estimation (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }
}
```

### Method: `countChatTokens(messages, model)` - Chat Format Tokens

#### Purpose

Counts tokens for chat message format including formatting overhead.

#### Input Format

```javascript
[
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Hello world!" },
  { role: "assistant", content: "Hello! How can I help you?" },
];
```

#### Overhead Calculation

```javascript
countChatTokens(messages, model = "gpt-3.5-turbo") {
  let totalTokens = 0;

  messages.forEach((message) => {
    if (message.content) {
      totalTokens += this.countTokens(message.content, model);
    }

    // Message formatting overhead
    totalTokens += 4; // <|start|>role<|message|>content<|end|>

    if (message.role) {
      totalTokens += this.countTokens(message.role, model);
    }

    if (message.name) {
      totalTokens += this.countTokens(message.name, model);
    }
  });

  // Conversation priming tokens
  totalTokens += 3;

  return totalTokens;
}
```

### Method: `estimateOllamaTokens(text)` - Ollama Estimation

#### Purpose

Provides token estimation for Ollama models where exact counting isn't available.

#### Estimation Logic

```javascript
estimateOllamaTokens(text) {
  if (!text || typeof text !== "string") {
    return 0;
  }

  // Character-based estimation for Ollama models
  // Adjusted for typical Ollama model tokenization
  const avgCharsPerToken = 3.5;  // Slightly more dense than GPT models
  return Math.ceil(text.length / avgCharsPerToken);
}
```

## 🔄 Retry Handler (`retryHandler.js`)

### Class Overview

Provides robust retry logic for API calls with exponential backoff, jitter, and configurable retry conditions.

### Constructor - Default Configuration

```javascript
constructor() {
  this.defaultConfig = {
    maxRetries: 20,                    // Maximum retry attempts
    baseDelay: 1000,                   // 1 second base delay
    maxDelay: 30000,                   // 30 seconds maximum delay
    backoffMultiplier: 2,              // Exponential backoff factor
    jitter: true,                      // Add randomness to delays
    retryableErrors: [
      "ECONNRESET", "ENOTFOUND", "ECONNREFUSED",
      "ETIMEDOUT", "TIMEOUT", "RATE_LIMITED", "SERVER_ERROR"
    ],
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
  };
}
```

### Method: `executeWithRetry(fn, config)` - Core Retry Logic

#### Purpose

Executes a function with retry logic, handling failures and tracking attempts.

#### Input Parameters

- `fn` (function) - Async function to execute with retries
- `config` (object) - Retry configuration override

#### Process Flow

1. **Configuration Merging**: Combines default and provided config
2. **Attempt Loop**: Tries function execution up to maxRetries
3. **Error Analysis**: Determines if error is retryable
4. **Delay Calculation**: Calculates backoff delay with jitter
5. **History Tracking**: Records all attempt results
6. **Success/Failure**: Returns result or throws final error

#### Implementation

```javascript
async executeWithRetry(fn, config = {}) {
  const retryConfig = { ...this.defaultConfig, ...config };
  const retryHistory = [];
  let lastError;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    const startTime = Date.now();

    try {
      const result = await fn();

      if (attempt > 0) {
        retryHistory.push({
          attempt,
          timestamp: new Date(),
          success: true,
          latency: Date.now() - startTime
        });
      }

      return { result, retryHistory, totalAttempts: attempt + 1 };
    } catch (error) {
      lastError = error;
      const latency = Date.now() - startTime;

      retryHistory.push({
        attempt: attempt + 1,
        timestamp: new Date(),
        error: error.message,
        errorCode: error.code || error.status,
        latency,
        success: false
      });

      if (attempt >= retryConfig.maxRetries || !this.shouldRetry(error, retryConfig)) {
        break;
      }

      const delay = this.calculateDelay(attempt, retryConfig);
      await this.sleep(delay);
    }
  }

  throw this.createFinalError(lastError, retryHistory, retryConfig);
}
```

### Method: `shouldRetry(error, config)` - Retry Decision Logic

#### Purpose

Determines whether an error should trigger a retry attempt.

#### Retry Conditions

```javascript
shouldRetry(error, config) {
  // Check error codes
  if (config.retryableErrors.includes(error.code)) {
    return true;
  }

  // Check HTTP status codes
  if (error.response && config.retryableStatusCodes.includes(error.response.status)) {
    return true;
  }

  // Check error messages
  const errorMessage = error.message.toLowerCase();
  const retryableMessages = [
    'timeout', 'rate limit', 'server error', 'service unavailable',
    'connection reset', 'network error', 'temporary failure'
  ];

  return retryableMessages.some(msg => errorMessage.includes(msg));
}
```

### Method: `calculateDelay(attempt, config)` - Backoff Calculation

#### Purpose

Calculates delay between retry attempts using exponential backoff with jitter.

#### Calculation Logic

```javascript
calculateDelay(attempt, config) {
  // Exponential backoff
  let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);

  // Cap at maximum delay
  delay = Math.min(delay, config.maxDelay);

  // Add jitter to prevent thundering herd
  if (config.jitter) {
    const jitterAmount = delay * 0.1;  // 10% jitter
    delay += (Math.random() - 0.5) * jitterAmount;
  }

  return Math.max(delay, 0);
}
```

### Method: `getProviderRetryConfig(provider)` - Provider-Specific Settings

#### Purpose

Returns optimized retry configurations for different providers.

#### Provider Configurations

```javascript
getProviderRetryConfig(provider) {
  const configs = {
    openai: {
      maxRetries: 5,
      baseDelay: 2000,
      maxDelay: 60000,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504, 520, 524]
    },
    ollama: {
      maxRetries: 3,
      baseDelay: 5000,    // Longer delay for local processing
      maxDelay: 30000,
      retryableStatusCodes: [408, 500, 502, 503, 504]
    },
    mistral: {
      maxRetries: 4,
      baseDelay: 1500,
      maxDelay: 45000,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504]
    },
    openrouter: {
      maxRetries: 6,      // More retries for multi-provider routing
      baseDelay: 2500,
      maxDelay: 90000,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504, 520, 521, 522, 524]
    }
  };

  return { ...this.defaultConfig, ...configs[provider] };
}
```

## 🔧 Utility Integration Pattern

### Usage in Services

```javascript
// In service classes
const tokenCounter = require("../utils/tokenCounter");
const costEstimator = require("../utils/costEstimator");
const retryHandler = require("../utils/retryHandler");

// Token counting
const promptTokens = tokenCounter.countTokens(prompt, model);

// Cost calculation
const cost = costEstimator.calculateCost(provider, model, tokenUsage);

// Retry execution
const { result } = await retryHandler.executeWithRetry(
  () => this.client.post(endpoint, requestBody),
  retryHandler.getProviderRetryConfig(provider)
);
```

### Error Handling Integration

```javascript
try {
  const result = await retryHandler.executeWithRetry(apiCall, retryConfig);
  const cost = costEstimator.calculateCost(provider, model, result.tokenUsage);

  return {
    ...result,
    cost,
    retryHistory: result.retryHistory,
  };
} catch (error) {
  console.error(`API call failed after retries: ${error.message}`);
  throw error;
}
```

## 📊 Utility Performance Considerations

### Cost Estimator

- **Memory Efficiency**: Pricing data stored in memory for fast access
- **Precision**: Uses 6 decimal places for accurate cost tracking
- **Caching**: Could implement pricing cache for external pricing APIs

### Token Counter

- **Encoding Cache**: Caches tiktoken encodings to avoid repeated initialization
- **Fallback Strategy**: Character-based estimation when exact counting fails
- **Model Support**: Handles both known and unknown models gracefully

### Retry Handler

- **Exponential Backoff**: Prevents API overload during outages
- **Jitter**: Reduces thundering herd problems
- **Provider Optimization**: Different configs for different provider characteristics

## 🎯 Usage Examples

### Cost Estimation

```javascript
const costEstimator = new CostEstimator();
const cost = costEstimator.calculateCost("openai", "gpt-3.5-turbo", {
  promptTokens: 100,
  completionTokens: 200,
  totalTokens: 300,
});
// Returns: { promptCost: 0.00015, completionCost: 0.0004, totalCost: 0.00055 }
```

### Token Counting

```javascript
const tokenCounter = new TokenCounter();
const tokens = tokenCounter.countTokens("Hello, world!", "gpt-3.5-turbo");
// Returns: 4

const chatTokens = tokenCounter.countChatTokens(
  [
    { role: "user", content: "Hello!" },
    { role: "assistant", content: "Hi there!" },
  ],
  "gpt-3.5-turbo"
);
// Returns: 15 (including formatting overhead)
```

### Retry Logic

```javascript
const retryHandler = new RetryHandler();
const result = await retryHandler.executeWithRetry(
  async () => {
    const response = await apiClient.post("/endpoint", data);
    return response.data;
  },
  { maxRetries: 3, baseDelay: 1000 }
);
// Returns: { result: apiData, retryHistory: [...], totalAttempts: 2 }
```

The Utilities layer provides the essential building blocks that enable reliable, cost-effective, and well-monitored LLM operations across the entire OpenLLM Monitor system.
