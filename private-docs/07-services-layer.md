# Services Layer - Detailed Documentation

## 🎯 Services Overview

The Services Layer provides abstracted interfaces to different LLM providers. Each service class handles provider-specific API communication, authentication, request formatting, response processing, and error handling. This layer ensures consistent interfaces across different providers while handling their unique requirements.

## 📁 Files Involved

### Service Files

- `services/openaiService.js` - OpenAI GPT models integration (332 lines)
- `services/ollamaService.js` - Local Ollama models integration (531 lines)
- `services/mistralService.js` - Mistral AI integration (285 lines)
- `services/openrouterService.js` - OpenRouter multi-provider routing (378 lines)

## 🔧 Service Architecture Pattern

All services follow a consistent pattern:

```javascript
class ProviderService {
  constructor() {
    // Initialize configuration
    // Create HTTP client
    // Set up retry configuration
  }

  async sendPrompt(params) {
    // Validate parameters
    // Format request
    // Execute with retry logic
    // Process response
    // Calculate costs/tokens
    // Return standardized result
  }

  // Additional provider-specific methods
}
```

## 🚀 OpenAI Service (`openaiService.js`)

### Class Overview

Handles integration with OpenAI's GPT models including GPT-4, GPT-3.5-Turbo, and other variants.

### Constructor - Initialization

```javascript
constructor() {
  this.baseUrl = config.providers.openai.baseUrl;
  this.apiKey = config.providers.openai.apiKey;
  this.defaultModel = "gpt-3.5-turbo";

  this.client = axios.create({
    baseURL: this.baseUrl,
    headers: {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "OpenLLM-Monitor/1.0"
    },
    timeout: 60000
  });

  this.retryConfig = retryHandler.getProviderRetryConfig("openai");
}
```

**Key Features:**

- **Authentication**: API key via Bearer token
- **Timeout**: 60 seconds for API calls
- **User Agent**: Custom identification for monitoring
- **Retry Configuration**: Provider-specific retry settings

### Method: `sendPrompt(params)` - Core Functionality

#### Input Parameters

```javascript
{
  prompt: "User prompt text",
  model: "gpt-3.5-turbo",
  systemMessage: "System instructions",
  temperature: 1.0,
  maxTokens: null,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stop: null,
  stream: false,
  requestId: "unique-id"
}
```

#### Process Flow

1. **Message Formatting**: Converts to OpenAI chat format
2. **Token Counting**: Counts prompt tokens using tokenCounter
3. **Request Preparation**: Builds OpenAI API request body
4. **Retry Execution**: Calls API with retry logic
5. **Response Processing**: Extracts completion and metadata
6. **Cost Calculation**: Calculates costs using costEstimator
7. **Result Formatting**: Returns standardized response

#### Message Format Conversion

```javascript
const messages = [];

if (systemMessage) {
  messages.push({ role: "system", content: systemMessage });
}

messages.push({ role: "user", content: prompt });
```

#### OpenAI Request Body

```javascript
{
  model: "gpt-3.5-turbo",
  messages: [...],
  temperature: 1.0,
  top_p: 1.0,
  frequency_penalty: 0,
  presence_penalty: 0,
  max_tokens: 1000,
  stop: ["<stop>"],
  stream: false
}
```

#### Response Processing

```javascript
const completion = result.choices[0]?.message?.content || "";
const usage = result.usage || {};

const tokenUsage = {
  promptTokens: usage.prompt_tokens || promptTokens,
  completionTokens: usage.completion_tokens || 0,
  totalTokens: usage.total_tokens || 0,
};

const cost = costEstimator.calculateCost("openai", model, tokenUsage);
```

## 🏠 Ollama Service (`ollamaService.js`)

### Class Overview

Handles integration with local Ollama models including Llama2, Mistral, and other open-source models.

### Constructor - Local Setup

```javascript
constructor() {
  this.baseUrl = config.providers.ollama.baseUrl;
  this.defaultModel = "llama2";

  this.client = axios.create({
    baseURL: this.baseUrl,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "OpenLLM-Monitor/1.0"
    },
    timeout: 120000  // 2 minutes for local models
  });

  this.retryConfig = retryHandler.getProviderRetryConfig("ollama");
}
```

**Key Differences from OpenAI:**

- **No API Key**: Local service doesn't require authentication
- **Longer Timeout**: 2 minutes for potentially slower local processing
- **Different Base URL**: Points to local Ollama instance

### Method: `sendPrompt(params)` - Local Model Processing

#### Prompt Formatting

```javascript
let fullPrompt = prompt;
if (systemMessage) {
  fullPrompt = `System: ${systemMessage}\n\nUser: ${prompt}`;
}
```

**System Message Handling**: Ollama doesn't use structured messages, so system instructions are prepended to the prompt.

#### Ollama Request Body

```javascript
{
  model: "llama2",
  prompt: "System: ...\n\nUser: ...",
  stream: false,
  options: {
    temperature: 0.7,
    top_p: 0.9,
    num_predict: 1000  // maxTokens equivalent
  }
}
```

#### Token Estimation

```javascript
const promptTokens = tokenCounter.estimateOllamaTokens(fullPrompt);
const completionTokens = tokenCounter.estimateOllamaTokens(completion);

const tokenUsage = {
  promptTokens,
  completionTokens,
  totalTokens: promptTokens + completionTokens,
};
```

**Token Estimation**: Ollama doesn't provide exact token counts, so we estimate using heuristics.

#### Cost Calculation

```javascript
const cost = {
  promptCost: 0,
  completionCost: 0,
  totalCost: 0, // Ollama is free (local)
};
```

### Method: `listModels()` - Model Discovery

```javascript
async listModels() {
  try {
    const response = await this.client.get("/api/tags");
    return response.data.models.map(model => ({
      name: model.name,
      size: model.size,
      modified: model.modified_at,
      family: model.details?.family
    }));
  } catch (error) {
    throw new Error(`Failed to list Ollama models: ${error.message}`);
  }
}
```

**Dynamic Model Discovery**: Gets actual models installed on local Ollama instance.

## 🧠 Mistral Service (`mistralService.js`)

### Class Overview

Handles integration with Mistral AI's models including Mistral Tiny, Small, Medium, and Large.

### Constructor - Mistral Setup

```javascript
constructor() {
  this.baseUrl = config.providers.mistral.baseUrl;
  this.apiKey = config.providers.mistral.apiKey;
  this.defaultModel = "mistral-tiny";

  this.client = axios.create({
    baseURL: this.baseUrl,
    headers: {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "OpenLLM-Monitor/1.0"
    },
    timeout: 60000
  });
}
```

### Mistral Request Format

```javascript
{
  model: "mistral-tiny",
  messages: [
    { role: "system", content: "System message" },
    { role: "user", content: "User prompt" }
  ],
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1.0,
  stream: false
}
```

**Similar to OpenAI**: Uses chat messages format like OpenAI but with Mistral-specific models.

## 🌐 OpenRouter Service (`openrouterService.js`)

### Class Overview

Handles integration with OpenRouter, which provides access to multiple LLM providers through a unified API.

### Constructor - Multi-Provider Setup

```javascript
constructor() {
  this.baseUrl = config.providers.openrouter.baseUrl;
  this.apiKey = config.providers.openrouter.apiKey;
  this.defaultModel = "openai/gpt-3.5-turbo";

  this.client = axios.create({
    baseURL: this.baseUrl,
    headers: {
      Authorization: `Bearer ${this.apiKey}`,
      "HTTP-Referer": config.appUrl,
      "X-Title": "OpenLLM Monitor",
      "Content-Type": "application/json"
    },
    timeout: 90000
  });
}
```

**OpenRouter-Specific Headers:**

- **HTTP-Referer**: Required for OpenRouter API
- **X-Title**: Application identification
- **Longer Timeout**: 90 seconds for multi-provider routing

### Model Format

OpenRouter models use provider/model format:

- `openai/gpt-4`
- `anthropic/claude-3-haiku`
- `meta-llama/llama-2-70b-chat`

## 🔧 Common Service Features

### Retry Logic Integration

All services use the retry handler for resilient API calls:

```javascript
const { result, retryHistory } = await retryHandler.executeWithRetry(
  async () => {
    const response = await this.client.post(endpoint, requestBody);
    return response.data;
  },
  this.retryConfig
);
```

### Standardized Response Format

All services return consistent response structures:

```javascript
{
  completion: "Model response text",
  tokenUsage: {
    promptTokens: 50,
    completionTokens: 100,
    totalTokens: 150
  },
  cost: {
    promptCost: 0.0001,
    completionCost: 0.0002,
    totalCost: 0.0003
  },
  latency: 1200,
  requestId: "unique-id",
  model: "gpt-3.5-turbo",
  provider: "openai",
  metadata: {
    retryHistory: [...],
    apiResponse: {...}
  }
}
```

### Error Handling Pattern

```javascript
try {
  // API call logic
} catch (error) {
  if (error.response) {
    // HTTP error with response
    const status = error.response.status;
    const message = error.response.data?.error?.message || error.message;
    throw new Error(`${provider} API error (${status}): ${message}`);
  } else if (error.request) {
    // Network error
    throw new Error(`${provider} network error: ${error.message}`);
  } else {
    // Other error
    throw new Error(`${provider} error: ${error.message}`);
  }
}
```

## 🔄 Service Integration Flow

```
Controller Method
     ↓
Service Selection (provider-based)
     ↓
Service.sendPrompt(params)
     ↓
Parameter Validation & Formatting
     ↓
HTTP Client Request (with retry logic)
     ↓
Response Processing & Standardization
     ↓
Token Counting & Cost Calculation
     ↓
Standardized Result Return
     ↓
Controller Response Processing
```

## 📊 Service-Specific Optimizations

### OpenAI Service

- **Token Counting**: Precise token counting using tiktoken
- **Rate Limiting**: Handles OpenAI rate limits with exponential backoff
- **Model Support**: Full support for all OpenAI models and parameters

### Ollama Service

- **Local Optimization**: Optimized for local model performance
- **Model Management**: Dynamic model discovery and management
- **Resource Awareness**: Considers local resource constraints

### Mistral Service

- **European Compliance**: Handles EU data residency requirements
- **Model Variants**: Supports all Mistral model sizes
- **Efficiency**: Optimized for Mistral's specific characteristics

### OpenRouter Service

- **Multi-Provider**: Unified interface to multiple providers
- **Model Routing**: Intelligent routing to optimal providers
- **Fallback**: Provider fallback capabilities

## 🚨 Error Handling Strategies

### Provider-Specific Errors

- **OpenAI**: Rate limits, quota exceeded, invalid models
- **Ollama**: Model not found, service unavailable, timeout
- **Mistral**: Authentication, model limits, service errors
- **OpenRouter**: Provider routing errors, quota limits

### Common Error Types

- **Network Errors**: Connection timeouts, DNS failures
- **Authentication**: Invalid API keys, expired tokens
- **Rate Limiting**: API quota exceeded, too many requests
- **Model Errors**: Invalid model names, model unavailable

## 🎯 Service Usage Examples

### OpenAI Service

```javascript
const openaiService = new OpenAIService();
const result = await openaiService.sendPrompt({
  prompt: "Explain quantum computing",
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 1000,
});
```

### Ollama Service

```javascript
const ollamaService = new OllamaService();
const result = await ollamaService.sendPrompt({
  prompt: "Write a haiku",
  model: "llama2",
  systemMessage: "You are a poet",
});
```

### Mistral Service

```javascript
const mistralService = new MistralService();
const result = await mistralService.sendPrompt({
  prompt: "Summarize this text",
  model: "mistral-small",
  temperature: 0.3,
});
```

### OpenRouter Service

```javascript
const openrouterService = new OpenRouterService();
const result = await openrouterService.sendPrompt({
  prompt: "Compare these options",
  model: "anthropic/claude-3-haiku",
  temperature: 0.5,
});
```

The Services Layer provides the foundation for reliable, scalable, and consistent LLM provider integration, handling all the complexity of different APIs while providing a unified interface for the rest of the application.
