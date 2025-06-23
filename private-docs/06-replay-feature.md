# Replay Feature - Detailed Documentation

## 🎯 Feature Overview

The Replay feature allows users to re-execute previously stored prompts with the same or different providers and models. This is useful for comparing model performance, testing configuration changes, and reproducing results from logged interactions.

## 📁 Files Involved

### 1. Route File: `routes/replay.js`

**Purpose**: Defines API endpoints for replay functionality
**Size**: 65 lines

#### Endpoints Defined:

- `POST /api/replay` - Replay a prompt with specified settings
- `POST /api/replay/stream` - Stream a replay (Server-Sent Events)
- `POST /api/replay/compare` - Compare multiple replays
- `POST /api/replay/estimate` - Get cost estimate for replay
- `GET /api/replay/models` - Get available models
- `POST /api/replay/log/:logId` - Replay from existing log entry

### 2. Controller File: `controllers/replayController.js`

**Purpose**: Contains all replay business logic
**Size**: 580 lines
**Main Class**: `ReplayController`

## 🔧 Detailed Method Breakdown

### ReplayController Class

#### Constructor - Service Initialization

```javascript
constructor() {
  this.services = {
    openai: new OpenAIService(),
    ollama: new OllamaService(),
    openrouter: new OpenRouterService(),
    mistral: mistralService
  };
}
```

**What it does**: Initializes all LLM provider services for replay functionality.

### Method 1: `replayPrompt(req, res)` - Basic Replay

#### Purpose

Re-executes a prompt with specified provider and model settings.

#### Input Parameters (req.body)

- `prompt` (required) - The text prompt to replay
- `provider` (required) - Which service to use (openai, ollama, mistral, openrouter)
- `model` (required) - Specific model name
- `systemMessage` (optional) - System instructions, default: ""
- `parameters` (optional) - Model parameters object
- `originalLogId` (optional) - Reference to original log entry

#### Parameters Object Structure

```javascript
{
  temperature: 1.0,
  maxTokens: null,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stop: null
}
```

#### Process Flow

1. **Validation**: Checks required fields (prompt, provider, model)
2. **Service Selection**: Gets appropriate service from services object
3. **Request ID Generation**: Creates unique UUID for replay
4. **Parameter Preparation**: Merges provided parameters with defaults
5. **Execution**: Calls service.sendPrompt() with prepared parameters
6. **Metadata Addition**: Adds replay-specific metadata
7. **Response Formatting**: Formats response for client consumption

#### Key Features

- **Parameter Override**: Can modify any model parameters during replay
- **Metadata Tracking**: Marks responses as replays with timestamps
- **Backward Compatibility**: Maintains compatibility with test interfaces
- **Unique Identification**: Each replay gets unique request ID

#### Response Format

```javascript
{
  success: true,
  data: {
    completion: "Model's response text",
    response: "Model's response text", // Alias for compatibility
    tokenUsage: {
      promptTokens: 50,
      completionTokens: 100,
      totalTokens: 150
    },
    cost: {
      totalCost: 0.0002
    },
    duration: 1200,
    isReplay: true,
    originalLogId: "64a123...",
    replayedAt: "2025-06-22T10:30:00.000Z"
  }
}
```

### Method 2: `replayFromLog(req, res)` - Log-Based Replay

#### Purpose

Replays a prompt from an existing log entry, optionally with different provider/model settings.

#### Input Parameters

- `req.params.logId` (required) - MongoDB ObjectId of original log
- `req.body.provider` (optional) - New provider to use
- `req.body.model` (optional) - New model to use
- `req.body.parameters` (optional) - New parameters to use

#### Process Flow

1. **Log ID Validation**: Validates MongoDB ObjectId format
2. **Log Retrieval**: Fetches original log from database
3. **Existence Check**: Ensures log exists
4. **Parameter Merging**: Combines original and new settings
5. **Replay Execution**: Forwards to replayPrompt method
6. **Response**: Returns replay results with original log reference

#### Validation Logic

```javascript
const mongoose = require("mongoose");
if (!mongoose.Types.ObjectId.isValid(logId)) {
  return res.status(400).json({
    success: false,
    error: "Invalid log ID format",
  });
}
```

#### Parameter Merging

```javascript
const provider = newProvider || originalLog.provider;
const model = newModel || originalLog.model;

const parameters = {
  ...originalLog.parameters, // Original parameters
  ...newParameters, // Override with new parameters
};
```

#### Use Cases

- **Model Comparison**: Replay same prompt with different models
- **Parameter Tuning**: Test different temperature/token settings
- **Provider Switching**: Compare provider performance
- **Reproducibility**: Re-run exact previous configurations

### Method 3: `streamReplay(req, res)` - Streaming Replay

#### Purpose

Provides real-time streaming of replay responses using Server-Sent Events (SSE).

#### Input Parameters

Same as replayPrompt, but response is streamed instead of returned as complete response.

#### Process Flow

1. **Validation**: Standard parameter validation
2. **SSE Setup**: Configures Server-Sent Events headers
3. **Service Check**: Verifies streaming support for provider
4. **Stream Execution**: Calls service with streaming enabled
5. **Event Forwarding**: Forwards stream events to client
6. **Completion**: Closes stream when response complete

#### SSE Headers

```javascript
res.writeHead(200, {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "Access-Control-Allow-Origin": "*",
});
```

#### Stream Event Format

```javascript
// Data chunk
data: {"chunk": "partial response text"}

// Completion
data: {"done": true, "metadata": {...}}

// Error
data: {"error": "Error message"}
```

### Method 4: `compareReplays(req, res)` - Multi-Replay Comparison

#### Purpose

Replays the same prompt with multiple different configurations for comparison.

#### Input Parameters (req.body)

- `prompt` (required) - Text prompt to replay
- `configurations` (required) - Array of provider/model configurations
- `systemMessage` (optional) - System instructions for all replays

#### Configuration Format

```javascript
{
  provider: "openai",
  model: "gpt-3.5-turbo",
  parameters: {
    temperature: 0.7,
    maxTokens: 1000
  }
}
```

#### Process Flow

1. **Validation**: Checks prompt and configurations array
2. **Sequential Execution**: Replays prompt with each configuration
3. **Result Collection**: Aggregates all replay results
4. **Comparison Data**: Adds comparison metadata
5. **Performance Metrics**: Calculates comparative statistics

#### Comparison Result Format

```javascript
{
  success: true,
  data: {
    prompt: "Original prompt",
    results: [
      {
        provider: "openai",
        model: "gpt-3.5-turbo",
        response: "Response text",
        tokenUsage: {...},
        cost: {...},
        duration: 1200,
        status: "success"
      }
      // ... more results
    ],
    comparison: {
      totalConfigurations: 3,
      successful: 2,
      failed: 1,
      averageDuration: 1350,
      totalCost: 0.0006
    }
  }
}
```

### Method 5: `getCostEstimate(req, res)` - Replay Cost Estimation

#### Purpose

Estimates the cost of replaying a prompt before actually executing it.

#### Input Parameters (req.body)

- `prompt` (required) - Text to estimate
- `provider` (required) - Provider for cost calculation
- `model` (required) - Model for pricing
- `maxTokens` (optional) - Maximum response tokens

#### Process Flow

1. **Parameter Validation**: Validates required fields
2. **Token Counting**: Counts prompt tokens
3. **Completion Estimation**: Estimates response tokens
4. **Cost Calculation**: Uses cost estimator utility
5. **Response**: Returns detailed cost breakdown

#### Cost Estimation Logic

```javascript
const tokenCounter = require("../utils/tokenCounter");
const costEstimator = require("../utils/costEstimator");

const promptTokens = tokenCounter.countTokens(prompt);
const estimatedCompletionTokens = Math.min(
  maxTokens || 1000,
  promptTokens * 0.5
);

const tokenUsage = {
  promptTokens,
  completionTokens: estimatedCompletionTokens,
  totalTokens: promptTokens + estimatedCompletionTokens,
};

const cost = costEstimator.calculateCost(provider, model, tokenUsage);
```

### Method 6: `getAvailableModels(req, res)` - Model Listing

#### Purpose

Returns available models for all providers, similar to test controller but optimized for replay use.

#### Features

- **Static Lists**: Returns predefined model lists
- **Dynamic Fetching**: Attempts to get live model lists where possible
- **Caching**: Could implement caching for performance
- **Provider Status**: Indicates which providers are available

## 🔄 Data Flow Diagram

```
Replay Request
     ↓
Route Handler (/api/replay/*)
     ↓
ReplayController Method
     ↓
Parameter Validation & Processing
     ↓
Original Log Retrieval (if from log)
     ↓
Service Selection (OpenAI/Ollama/Mistral/OpenRouter)
     ↓
Request Execution
     ↓
Response Processing & Metadata Addition
     ↓
Client Response
```

## 🗄️ Database Integration

### Log Retrieval

- **Original Log Access**: Fetches complete log entries by ID
- **Parameter Extraction**: Extracts prompt, system message, parameters
- **Metadata Preservation**: Maintains reference to original log

### Replay Logging

- **New Log Entry**: Each replay creates new log entry
- **Replay Metadata**: Includes isReplay flag and original log reference
- **Comparison Tracking**: Links related replay attempts

### Log Entry Fields for Replay

```javascript
{
  requestId: "new-uuid",
  prompt: "original-prompt",
  provider: "new-or-same-provider",
  model: "new-or-same-model",
  completion: "new-response",
  isReplay: true,
  originalLogId: "original-log-id",
  replayedAt: "2025-06-22T10:30:00.000Z",
  parameters: {
    // merged parameters
  }
}
```

## 🔧 Service Integration

### Provider Service Usage

Each replay uses the same service classes as the test feature:

- **OpenAIService** - For GPT models
- **OllamaService** - For local models
- **MistralService** - For Mistral models
- **OpenRouterService** - For multi-provider access

### Service Method Compatibility

- **sendPrompt()** - Primary method for all replays
- **Parameter Passing** - Consistent parameter structure
- **Response Format** - Standardized response handling
- **Error Handling** - Unified error processing

## 🚨 Error Handling

### Replay-Specific Errors

- **Invalid Log ID**: Malformed MongoDB ObjectId
- **Log Not Found**: Referenced log doesn't exist
- **Provider Unavailable**: Selected provider is offline
- **Parameter Conflicts**: Invalid parameter combinations

### Error Response Formats

```javascript
// Validation Error
{
  success: false,
  error: "Missing required fields: prompt, provider, model"
}

// Log Not Found Error
{
  success: false,
  error: "Original log not found"
}

// Service Error
{
  success: false,
  error: "Failed to replay prompt",
  details: "Provider connection timeout"
}
```

## 🎯 Usage Examples

### Basic Replay

```bash
POST /api/replay
{
  "prompt": "Explain quantum computing",
  "provider": "openai",
  "model": "gpt-4",
  "parameters": {
    "temperature": 0.5,
    "maxTokens": 800
  }
}
```

### Replay from Log

```bash
POST /api/replay/log/64a123456789abcdef
{
  "provider": "ollama",
  "model": "llama2",
  "parameters": {
    "temperature": 0.8
  }
}
```

### Compare Replays

```bash
POST /api/replay/compare
{
  "prompt": "Write a haiku about coding",
  "configurations": [
    {"provider": "openai", "model": "gpt-3.5-turbo"},
    {"provider": "openai", "model": "gpt-4"},
    {"provider": "ollama", "model": "llama2"}
  ]
}
```

### Stream Replay

```bash
POST /api/replay/stream
{
  "prompt": "Tell me a story",
  "provider": "openai",
  "model": "gpt-3.5-turbo"
}
```

### Cost Estimation

```bash
POST /api/replay/estimate
{
  "prompt": "Long prompt text...",
  "provider": "openai",
  "model": "gpt-4",
  "maxTokens": 1500
}
```

The Replay feature provides powerful capabilities for experimenting with different model configurations, comparing outputs, and reproducing previous results, making it an essential tool for LLM testing and optimization.
