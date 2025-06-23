# Test Models Feature - Detailed Documentation

## 🎯 Feature Overview

The Test Models feature allows users to directly test LLM models with custom prompts. It's the core functionality for experimenting with different models and comparing their outputs.

## 📁 Files Involved

### 1. Route File: `routes/test.js`

**Purpose**: Defines API endpoints for testing functionality
**Size**: 45 lines

#### Endpoints Defined:

- `POST /api/test/prompt` - Test single model
- `POST /api/test/compare` - Compare multiple models
- `GET /api/test/models` - Get available models
- `POST /api/test/estimate` - Get cost estimate
- `POST /api/test/validate` - Validate test configuration

### 2. Controller File: `controllers/testController.js`

**Purpose**: Contains all business logic for testing
**Size**: 537 lines
**Main Class**: `TestController`

## 🔧 Detailed Method Breakdown

### TestController Class

#### Constructor

```javascript
constructor() {
  this.services = {
    openai: new OpenAIService(),
    ollama: new OllamaService(),
    mistral: mistralService,
    openrouter: new OpenRouterService()
  };
}
```

**What it does**: Initializes all LLM provider services that can be used for testing.

### Method 1: `testPrompt(req, res)` - Single Model Testing

#### Purpose

Test a single prompt with one specific model and provider.

#### Input Parameters (req.body)

- `prompt` (required) - The text prompt to send
- `provider` (required) - Which service to use (openai, ollama, mistral, openrouter)
- `model` (required) - Specific model name
- `systemMessage` (optional) - System instructions, default: "You are a helpful assistant."
- `temperature` (optional) - Creativity level, default: 0.7
- `maxTokens` (optional) - Maximum response length, default: 1000
- `stream` (optional) - Whether to stream response, default: false

#### Process Flow

1. **Validation**: Checks if required fields (prompt, provider, model) are present
2. **Service Selection**: Uses switch statement to pick correct service based on provider
3. **Request Preparation**: Creates request parameters object
4. **Execution**: Calls service with retry logic (3 attempts, 1 second delay)
5. **Token Calculation**: Counts input/output tokens for cost calculation
6. **Cost Calculation**: Uses costEstimator to calculate API costs
7. **Logging**: Saves complete interaction to database
8. **Response**: Returns formatted response with all metrics

#### Key Logic Points

- **Request ID Generation**: Creates unique ID using timestamp + random string
- **Token Usage**: If service doesn't provide token count, uses tokenCounter utility
- **Error Handling**: Catches errors and logs failed attempts to database
- **Retry Logic**: Uses retryHandler with exponential backoff

#### Response Format

```javascript
{
  success: true,
  data: {
    requestId: "test-1234567890-abc123",
    provider: "openai",
    model: "gpt-3.5-turbo",
    response: "Model's response text",
    tokenUsage: {
      promptTokens: 50,
      completionTokens: 100,
      totalTokens: 150
    },
    cost: 0.0002,
    duration: 1200,
    timestamp: "2025-06-22T10:30:00.000Z"
  }
}
```

### Method 2: `compareModels(req, res)` - Multi-Model Comparison

#### Purpose

Test the same prompt across multiple models and compare results side-by-side.

#### Input Parameters (req.body)

- `prompt` (required) - The text prompt to test
- `models` (required) - Array of model configurations
- `systemMessage` (optional) - System instructions for all models

#### Model Configuration Format

```javascript
{
  provider: "openai",
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  maxTokens: 1000
}
```

#### Process Flow

1. **Validation**: Ensures prompt and models array are provided
2. **Sequential Testing**: Loops through each model configuration
3. **Individual Processing**: For each model:
   - Selects appropriate service
   - Executes request with retry logic
   - Calculates tokens and costs
   - Logs individual result
4. **Result Aggregation**: Collects all results into array
5. **Summary Generation**: Creates summary with success/failure counts

#### Key Features

- **Error Isolation**: If one model fails, others continue processing
- **Individual Logging**: Each model test is logged separately with `isComparison: true`
- **Performance Tracking**: Tracks both individual and total duration
- **Status Tracking**: Marks each result as "success" or "error"

#### Response Format

```javascript
{
  success: true,
  data: {
    prompt: "Original prompt text",
    results: [
      {
        provider: "openai",
        model: "gpt-3.5-turbo",
        response: "Response from GPT-3.5",
        tokenUsage: {...},
        cost: 0.0002,
        duration: 1200,
        status: "success",
        requestId: "compare-123-abc"
      }
      // ... more results
    ],
    totalDuration: 3500,
    timestamp: "2025-06-22T10:30:00.000Z",
    summary: {
      total: 3,
      successful: 2,
      failed: 1
    }
  }
}
```

### Method 3: `getAvailableModels(req, res)` - Model Listing

#### Purpose

Returns list of all available models for each provider.

#### Process Flow

1. **Static Models**: Defines default model lists for each provider
2. **Dynamic Ollama**: Attempts to fetch live Ollama models using `listModels()`
3. **Fallback**: Uses static list if dynamic fetch fails

#### Model Lists

- **OpenAI**: GPT-4 variants, GPT-3.5 variants
- **Ollama**: Llama2, Mistral, Phi3, Gemma models
- **Mistral**: Tiny, Small, Medium, Large models
- **OpenRouter**: Various provider models through OpenRouter

#### Key Logic

- **Live Ollama Detection**: Tries to get actual running models from Ollama
- **Error Tolerance**: Continues with static list if live fetch fails
- **Caching Potential**: Could be enhanced with caching for performance

### Method 4: `getCostEstimate(req, res)` - Cost Estimation

#### Purpose

Provides cost estimate before running actual test.

#### Input Parameters

- `prompt` (required) - Text to estimate
- `provider` (required) - Which provider to estimate for
- `model` (required) - Specific model for pricing
- `maxTokens` (optional) - Maximum response tokens, default: 1000

#### Process Flow

1. **Token Counting**: Uses tokenCounter to count prompt tokens
2. **Completion Estimation**: Estimates completion tokens (50% of prompt or maxTokens)
3. **Cost Calculation**: Uses costEstimator with estimated token usage
4. **Breakdown**: Provides detailed cost breakdown if available

#### Estimation Logic

- **Prompt Tokens**: Exact count using tokenCounter
- **Completion Tokens**: `Math.min(maxTokens, promptTokens * 0.5)`
- **Safety Margin**: Conservative estimation to avoid surprises

### Method 5: `validateConfig(req, res)` - Configuration Validation

#### Purpose

Validates test configuration before execution to catch issues early.

#### Validation Rules

##### Prompt Validation

- **Required**: Must be present and non-empty
- **Length Limits**:
  - Max: 50,000 characters (error)
  - Min: 10 characters (warning if shorter)

##### Provider Validation

- **Supported**: Must be one of: openai, ollama, mistral, openrouter
- **Case Insensitive**: Converts to lowercase for comparison

##### Model Validation

- **Required**: Must be present and non-empty
- **Format**: String validation (no specific model checking)

##### Parameter Validation

- **Temperature**:
  - Range: 0-2 (error if outside)
  - Warning: >1.5 may produce incoherent responses
- **MaxTokens**:
  - Range: 1-4096 (error if outside)
  - Warning: >2000 may increase cost significantly

##### Cost Validation

- **High Cost Warning**: Warns if estimated cost > $0.10
- **Estimation**: Uses same logic as getCostEstimate

#### Response Categories

- **Errors**: Configuration problems that prevent execution
- **Warnings**: Issues that may affect quality/cost but allow execution
- **Recommendations**: Suggestions for improvement

## 🔄 Data Flow Diagram

```
Client Request
     ↓
Route Handler (/api/test/*)
     ↓
TestController Method
     ↓
Input Validation
     ↓
Service Selection (OpenAI/Ollama/Mistral/OpenRouter)
     ↓
Retry Handler (3 attempts)
     ↓
External API Call
     ↓
Token Counting (tokenCounter.js)
     ↓
Cost Calculation (costEstimator.js)
     ↓
Database Logging (Log model)
     ↓
Response Formatting
     ↓
Client Response
```

## 🗄️ Database Integration

### Log Entry Structure

Every test creates a log entry with:

- `requestId` - Unique identifier
- `provider` - Which service was used
- `model` - Specific model name
- `prompt` - Original prompt text
- `systemMessage` - System instructions
- `completion` - Model's response
- `tokenUsage` - Token consumption data
- `cost` - Calculated cost
- `latency` - Response time in milliseconds
- `status` - "success" or "error"
- `parameters` - Request parameters (temperature, maxTokens, etc.)
- `metadata` - Additional data including:
  - `isTest: true` - Marks as test request
  - `isComparison: true` - Marks as comparison test
  - `userAgent` - Client information
  - `timestamp` - Execution time

## 🚨 Error Handling

### Error Types

1. **Validation Errors** (400) - Missing/invalid parameters
2. **Provider Errors** (400) - Unsupported provider
3. **Service Errors** (500) - External API failures
4. **Database Errors** (500) - Logging failures

### Error Response Format

```javascript
{
  success: false,
  error: "Error message",
  details: "Stack trace (development only)"
}
```

### Error Logging

- Failed tests are logged to database with error details
- Separate error handling for logging failures
- Development vs production error detail levels

## 🔧 Dependencies

### External Services

- **OpenAI API** - For GPT models
- **Ollama API** - For local models
- **Mistral API** - For Mistral models
- **OpenRouter API** - For multi-provider access

### Internal Utilities

- **tokenCounter.js** - Token counting for cost calculation
- **costEstimator.js** - Cost calculation based on provider pricing
- **retryHandler.js** - Retry logic for failed API calls

### Database

- **Log Model** - MongoDB document for storing test results
- **Database Connection** - MongoDB connection via Mongoose

## 🎯 Usage Examples

### Single Model Test

```bash
POST /api/test/prompt
{
  "prompt": "Explain quantum computing",
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "maxTokens": 500
}
```

### Multi-Model Comparison

```bash
POST /api/test/compare
{
  "prompt": "Write a haiku about programming",
  "systemMessage": "You are a poet",
  "models": [
    {"provider": "openai", "model": "gpt-3.5-turbo"},
    {"provider": "openai", "model": "gpt-4"},
    {"provider": "ollama", "model": "llama2"}
  ]
}
```

### Cost Estimation

```bash
POST /api/test/estimate
{
  "prompt": "Long prompt text...",
  "provider": "openai",
  "model": "gpt-4",
  "maxTokens": 1000
}
```

This test models feature is the foundation of the OpenLLM Monitor system, providing the core functionality for model experimentation and comparison.
