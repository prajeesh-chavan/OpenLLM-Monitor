# OpenLLM Monitor API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API does not require authentication. This can be added in future versions.

## Endpoints

### Logs

#### GET /logs

Get paginated logs with filtering and sorting options.

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 50) - Items per page
- `provider` (string) - Filter by provider (openai, ollama, openrouter, mistral)
- `model` (string) - Filter by model
- `status` (string) - Filter by status (success, error)
- `search` (string) - Search in prompts and responses
- `startDate` (string) - Filter from date (ISO format)
- `endDate` (string) - Filter to date (ISO format)
- `sortBy` (string, default: createdAt) - Sort field
- `sortOrder` (string, default: desc) - Sort order (asc, desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "log_id",
        "provider": "openai",
        "model": "gpt-3.5-turbo",
        "prompt": "Hello, world!",
        "response": "Hello! How can I help you?",
        "tokenUsage": {
          "promptTokens": 3,
          "completionTokens": 8,
          "totalTokens": 11
        },
        "cost": 0.000022,
        "duration": 1250,
        "status": "success",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "metadata": {},
        "error": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalCount": 500,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /logs/:id

Get a specific log by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "log": {
      "_id": "log_id",
      "provider": "openai",
      "model": "gpt-3.5-turbo"
      // ... full log object
    }
  }
}
```

#### DELETE /logs/:id

Delete a specific log.

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Log deleted successfully"
  }
}
```

#### POST /logs/bulk-delete

Delete multiple logs.

**Request Body:**

```json
{
  "ids": ["log_id_1", "log_id_2", "log_id_3"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "deletedCount": 3,
    "message": "3 logs deleted successfully"
  }
}
```

#### GET /logs/stats

Get log statistics and analytics.

**Query Parameters:**

- `timeframe` (number, default: 24) - Hours to look back

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRequests": 1250,
      "successRate": 96.8,
      "errorRate": 3.2,
      "avgDuration": 1430,
      "totalCost": 15.67,
      "totalTokens": 125000
    },
    "providerStats": [
      {
        "provider": "openai",
        "requests": 800,
        "successRate": 97.5,
        "avgDuration": 1200,
        "totalCost": 12.45
      }
    ],
    "hourlyStats": [
      {
        "hour": "2024-01-01T00:00:00.000Z",
        "requests": 50,
        "cost": 0.75,
        "avgDuration": 1300
      }
    ],
    "recentActivity": [
      {
        "_id": "log_id",
        "provider": "openai",
        "model": "gpt-3.5-turbo",
        "status": "success",
        "duration": 1250,
        "cost": 0.002,
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Analytics

#### GET /analytics/stats

Get comprehensive analytics statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRequests": 1250,
      "successfulRequests": 1210,
      "failedRequests": 40,
      "successRate": 96.8,
      "avgDuration": 1430,
      "medianDuration": 1200,
      "totalCost": 15.67,
      "totalTokens": 125000,
      "totalProviders": 4
    },
    "providerStats": [...],
    "modelStats": [...],
    "timeRangeStats": [...]
  }
}
```

#### GET /analytics/usage

Get usage analytics over time.

**Query Parameters:**

- `timeframe` (number, default: 24) - Hours to analyze

**Response:**

```json
{
  "success": true,
  "data": {
    "hourlyStats": [...],
    "requestVolume": [...],
    "tokenUsage": [...],
    "costTrend": [...]
  }
}
```

#### GET /analytics/performance

Get performance analytics.

**Response:**

```json
{
  "success": true,
  "data": {
    "responseTime": {
      "avg": 1430,
      "median": 1200,
      "p95": 2800,
      "p99": 4500
    },
    "latencyDistribution": [...],
    "errorRate": {
      "overall": 3.2,
      "byProvider": {...}
    }
  }
}
```

#### GET /analytics/costs

Get cost analytics.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalCost": 15.67,
    "costByProvider": [...],
    "costByModel": [...],
    "costTrend": [...],
    "projectedMonthlyCost": 450.00
  }
}
```

#### GET /analytics/providers

Get provider comparison analytics.

**Response:**

```json
{
  "success": true,
  "data": {
    "providerComparison": [...],
    "modelComparison": [...],
    "recommendations": [...]
  }
}
```

#### GET /analytics/errors

Get error analytics.

**Response:**

```json
{
  "success": true,
  "data": {
    "errorRate": 3.2,
    "errorsByType": [...],
    "errorsByProvider": [...],
    "errorTrends": [...],
    "topErrors": [...]
  }
}
```

#### GET /analytics/trends

Get trend analysis and insights.

**Response:**

```json
{
  "success": true,
  "data": {
    "insights": [...],
    "patterns": [...],
    "predictions": [...],
    "recommendations": [...]
  }
}
```

#### GET /analytics/export

Export analytics data.

**Query Parameters:**

- `format` (string, default: json) - Export format (json, csv)
- `timeframe` (number, default: 24) - Hours to export

**Response:**

- For JSON: Standard JSON response with data
- For CSV: File download with CSV data

### Providers

#### GET /providers

Get all available providers and their configurations.

**Response:**

```json
{
  "success": true,
  "data": {
    "providers": {
      "openai": {
        "name": "OpenAI",
        "baseUrl": "https://api.openai.com/v1",
        "hasApiKey": true,
        "models": ["gpt-3.5-turbo", "gpt-4", ...],
        "status": "connected"
      },
      "ollama": {
        "name": "Ollama",
        "baseUrl": "http://localhost:11434",
        "hasApiKey": false,
        "models": ["llama2", "codellama", ...],
        "status": "connected"
      }
      // ... other providers
    }
  }
}
```

#### GET /providers/stats

Get provider usage statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProviders": 4,
      "activeProviders": 3,
      "totalModels": 25
    },
    "providers": [
      {
        "provider": "openai",
        "requests": 800,
        "successRate": 97.5,
        "avgDuration": 1200,
        "totalCost": 12.45,
        "lastUsed": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### GET /providers/recommendations

Get provider recommendations based on use case.

**Query Parameters:**

- `useCase` (string) - Use case (translation, coding, creative, analysis, general)

**Response:**

```json
{
  "success": true,
  "data": {
    "useCase": "coding",
    "recommendations": [
      {
        "provider": "openai",
        "model": "gpt-4",
        "reason": "Excellent for complex coding tasks",
        "score": 95
      }
    ]
  }
}
```

#### GET /providers/comparison

Get provider comparison data.

**Response:**

```json
{
  "success": true,
  "data": {
    "comparison": [
      {
        "provider": "openai",
        "metrics": {
          "avgLatency": 1200,
          "successRate": 97.5,
          "costPerToken": 0.000002,
          "modelsCount": 8
        }
      }
    ]
  }
}
```

#### POST /providers/test-connection

Test connection to a specific provider.

**Request Body:**

```json
{
  "provider": "openai"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "provider": "openai",
    "connected": true,
    "latency": 250,
    "availableModels": ["gpt-3.5-turbo", "gpt-4"],
    "message": "Connection successful"
  }
}
```

### Replay

#### POST /replay

Replay a prompt with specified provider and model.

**Request Body:**

```json
{
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "prompt": "What is the capital of France?",
  "maxTokens": 100,
  "temperature": 0.7,
  "stream": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "response": "The capital of France is Paris.",
    "tokenUsage": {
      "promptTokens": 8,
      "completionTokens": 7,
      "totalTokens": 15
    },
    "cost": 0.00003,
    "duration": 1250,
    "provider": "openai",
    "model": "gpt-3.5-turbo"
  }
}
```

#### POST /replay/log/:logId

Replay a prompt from an existing log.

**Request Body:**

```json
{
  "provider": "ollama",
  "model": "llama2",
  "modifications": {
    "temperature": 0.8
  }
}
```

#### POST /replay/compare

Compare responses from multiple providers.

**Request Body:**

```json
{
  "prompt": "What is the capital of France?",
  "providers": [
    { "provider": "openai", "model": "gpt-3.5-turbo" },
    { "provider": "ollama", "model": "llama2" }
  ],
  "maxTokens": 100,
  "temperature": 0.7
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "provider": "openai",
        "model": "gpt-3.5-turbo",
        "response": "The capital of France is Paris.",
        "duration": 1250,
        "cost": 0.00003,
        "success": true
      },
      {
        "provider": "ollama",
        "model": "llama2",
        "response": "Paris is the capital city of France.",
        "duration": 2100,
        "cost": 0,
        "success": true
      }
    ],
    "comparison": {
      "fastestProvider": "openai",
      "cheapestProvider": "ollama",
      "averageDuration": 1675
    }
  }
}
```

#### POST /replay/estimate

Estimate cost for a prompt.

**Request Body:**

```json
{
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "prompt": "What is the capital of France?",
  "maxTokens": 100
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "promptTokens": 8,
    "maxCompletionTokens": 100,
    "estimatedCost": 0.000216,
    "costBreakdown": {
      "promptCost": 0.000016,
      "completionCost": 0.0002
    }
  }
}
```

#### GET /replay/models

Get available models for all providers or a specific provider.

**Query Parameters:**

- `provider` (string, optional) - Specific provider

**Response:**

```json
{
  "success": true,
  "data": {
    "models": {
      "openai": ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
      "ollama": ["llama2", "codellama", "mistral"],
      "openrouter": ["anthropic/claude-3", "meta-llama/llama-2-70b"],
      "mistral": [
        "mistral-tiny",
        "mistral-small",
        "mistral-medium",
        "mistral-large"
      ]
    }
  }
}
```

#### GET /replay/connection/:provider

Test connection to a specific provider.

**Response:**

```json
{
  "success": true,
  "data": {
    "provider": "openai",
    "connected": true,
    "latency": 250,
    "message": "Connection successful"
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes:

- `VALIDATION_ERROR` - Invalid request parameters
- `NOT_FOUND` - Resource not found
- `PROVIDER_ERROR` - LLM provider error
- `RATE_LIMIT` - Rate limit exceeded
- `SERVER_ERROR` - Internal server error

## WebSocket Events

The application supports real-time updates via WebSocket connection at `ws://localhost:3001`.

### Events:

- `log_created` - New log entry created
- `log_updated` - Log entry updated
- `log_deleted` - Log entry deleted
- `stats_updated` - Statistics updated
- `provider_status_changed` - Provider connection status changed

### Event Format:

```json
{
  "type": "log_created",
  "data": {
    // Event-specific data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
