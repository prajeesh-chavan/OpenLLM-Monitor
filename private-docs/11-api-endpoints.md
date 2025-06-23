# API Endpoints Reference - Complete Documentation

## 🎯 API Overview

The OpenLLM Monitor provides a comprehensive REST API for managing LLM interactions, analytics, and system monitoring. All endpoints follow RESTful conventions and return JSON responses with consistent error handling.

## 🌐 Base Information

- **Base URL**: `http://localhost:3000/api` (development)
- **Content-Type**: `application/json`
- **Authentication**: Currently no authentication required (configurable)
- **Rate Limiting**: 100 requests per 15 minutes per IP (configurable)

## 📊 Response Format

### Success Response

```javascript
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2025-06-22T10:30:00.000Z"
}
```

### Error Response

```javascript
{
  "success": false,
  "error": "Human-readable error message",
  "details": "Technical error details (development only)",
  "requestId": "uuid-v4-string",
  "timestamp": "2025-06-22T10:30:00.000Z"
}
```

## 🧪 Test Models Endpoints

### POST `/api/test/prompt`

**Purpose**: Test a single prompt with specified provider and model

**Request Body**:

```javascript
{
  "prompt": "Explain quantum computing",
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "systemMessage": "You are a helpful assistant",
  "temperature": 0.7,
  "maxTokens": 1000,
  "stream": false
}
```

**Response**:

```javascript
{
  "success": true,
  "data": {
    "requestId": "test-1719058200-abc123",
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "response": "Quantum computing is a revolutionary technology...",
    "tokenUsage": {
      "promptTokens": 50,
      "completionTokens": 200,
      "totalTokens": 250
    },
    "cost": 0.000375,
    "duration": 1250,
    "timestamp": "2025-06-22T10:30:00.000Z"
  }
}
```

### POST `/api/test/compare`

**Purpose**: Test the same prompt with multiple models for comparison

**Request Body**:

```javascript
{
  "prompt": "Write a haiku about programming",
  "systemMessage": "You are a creative poet",
  "models": [
    {
      "provider": "openai",
      "model": "gpt-3.5-turbo",
      "temperature": 0.7,
      "maxTokens": 100
    },
    {
      "provider": "openai",
      "model": "gpt-4",
      "temperature": 0.7,
      "maxTokens": 100
    },
    {
      "provider": "ollama",
      "model": "llama2",
      "temperature": 0.7,
      "maxTokens": 100
    }
  ]
}
```

**Response**:

```javascript
{
  "success": true,
  "data": {
    "prompt": "Write a haiku about programming",
    "results": [
      {
        "provider": "openai",
        "model": "gpt-3.5-turbo",
        "response": "Code flows like water...",
        "tokenUsage": {...},
        "cost": 0.0001,
        "duration": 1200,
        "status": "success",
        "requestId": "compare-123-abc"
      }
      // ... more results
    ],
    "totalDuration": 3500,
    "timestamp": "2025-06-22T10:30:00.000Z",
    "summary": {
      "total": 3,
      "successful": 2,
      "failed": 1
    }
  }
}
```

### GET `/api/test/models`

**Purpose**: Get available models for all configured providers

**Response**:

```javascript
{
  "success": true,
  "data": {
    "openai": [
      "gpt-4",
      "gpt-4-turbo",
      "gpt-3.5-turbo",
      "gpt-3.5-turbo-16k"
    ],
    "ollama": [
      "llama2",
      "mistral",
      "phi3:mini"
    ],
    "mistral": [
      "mistral-tiny",
      "mistral-small",
      "mistral-medium",
      "mistral-large-latest"
    ],
    "openrouter": [
      "openai/gpt-4",
      "anthropic/claude-3-haiku"
    ]
  },
  "timestamp": "2025-06-22T10:30:00.000Z"
}
```

### POST `/api/test/estimate`

**Purpose**: Get cost estimate for a test prompt

**Request Body**:

```javascript
{
  "prompt": "Long prompt text to estimate cost for...",
  "provider": "openai",
  "model": "gpt-4",
  "maxTokens": 1000
}
```

**Response**:

```javascript
{
  "success": true,
  "data": {
    "prompt": "Long prompt text...",
    "provider": "openai",
    "model": "gpt-4",
    "tokenUsage": {
      "promptTokens": 120,
      "completionTokens": 1000,
      "totalTokens": 1120
    },
    "estimatedCost": 0.0636,
    "breakdown": {
      "promptCost": 0.0036,
      "completionCost": 0.06,
      "totalCost": 0.0636
    }
  }
}
```

### POST `/api/test/validate`

**Purpose**: Validate test configuration before running

**Request Body**:

```javascript
{
  "prompt": "Test prompt",
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Response**:

```javascript
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [
      "High token limit may increase cost and response time"
    ],
    "recommendations": [
      "Setting temperature can improve response quality"
    ]
  }
}
```

## 📈 Analytics Endpoints

### GET `/api/analytics/stats`

**Purpose**: Get comprehensive analytics statistics

**Query Parameters**:

- `timeRange` (optional): "1h", "6h", "24h", "7d", "30d" (default: "24h")

**Response**:

```javascript
{
  "success": true,
  "data": {
    "overview": {
      "totalRequests": 1250,
      "successfulRequests": 1180,
      "errorRequests": 70,
      "successRate": 94.4,
      "errorRate": 5.6,
      "retryRate": 8.2,
      "avgDuration": 1250,
      "totalCost": 2.4567,
      "totalTokens": 125000,
      "promptTokens": 50000,
      "completionTokens": 75000,
      "activeProviders": 3
    },
    "timeRangeStats": {
      "timeRange": "24h",
      "generatedAt": "2025-06-22T10:30:00.000Z"
    }
  }
}
```

### GET `/api/analytics/usage`

**Purpose**: Get usage analytics over time

**Query Parameters**:

- `timeRange` (optional): Time period to analyze
- `interval` (optional): Grouping interval

**Response**:

```javascript
{
  "success": true,
  "data": {
    "usage": [
      {
        "timestamp": "2025-06-22 09:00",
        "requests": 45,
        "successful": 42,
        "errors": 3,
        "avgLatency": 1200,
        "totalCost": 0.025
      }
      // ... more time periods
    ],
    "timeRange": "24h",
    "interval": "1h"
  }
}
```

### GET `/api/analytics/performance`

**Purpose**: Get performance analytics by model and provider

**Response**:

```javascript
{
  "success": true,
  "data": {
    "modelPerformance": [
      {
        "provider": "openai",
        "model": "gpt-3.5-turbo",
        "totalRequests": 500,
        "avgLatency": 1200,
        "successRate": 98.5,
        "avgCost": 0.0003,
        "tokensPerSecond": 85
      }
      // ... more models
    ]
  }
}
```

### GET `/api/analytics/costs`

**Purpose**: Get cost analysis and spending breakdown

**Query Parameters**:

- `timeRange` (optional): Time period for cost analysis

**Response**:

```javascript
{
  "success": true,
  "data": {
    "totalCost": 45.67,
    "byProvider": {
      "openai": 35.20,
      "mistral": 8.47,
      "openrouter": 2.00,
      "ollama": 0.00
    },
    "byModel": {
      "gpt-4": 25.30,
      "gpt-3.5-turbo": 9.90,
      "mistral-small": 8.47
    },
    "trends": [
      {
        "date": "2025-06-22",
        "cost": 2.34
      }
      // ... more dates
    ]
  }
}
```

### GET `/api/analytics/providers`

**Purpose**: Get provider distribution and comparison

**Response**:

```javascript
{
  "success": true,
  "data": {
    "distribution": {
      "openai": 65.2,
      "ollama": 20.5,
      "mistral": 10.3,
      "openrouter": 4.0
    },
    "comparison": [
      {
        "provider": "openai",
        "requests": 815,
        "avgLatency": 1200,
        "successRate": 98.5,
        "totalCost": 35.20
      }
      // ... more providers
    ]
  }
}
```

### GET `/api/analytics/errors`

**Purpose**: Get error analysis and failure patterns

**Response**:

```javascript
{
  "success": true,
  "data": {
    "errorSummary": {
      "total": 70,
      "byType": {
        "rate_limited": 35,
        "timeout": 20,
        "error": 15
      }
    },
    "byProvider": {
      "openai": 25,
      "mistral": 15,
      "openrouter": 30
    },
    "trends": [
      {
        "hour": "2025-06-22 09:00",
        "errors": 5,
        "errorRate": 8.5
      }
      // ... more hours
    ]
  }
}
```

## 📄 Logs Management Endpoints

### GET `/api/logs`

**Purpose**: Get logs with filtering and pagination

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50)
- `provider` (optional): Filter by provider(s)
- `model` (optional): Filter by model(s)
- `status` (optional): Filter by status(es)
- `startDate` (optional): Filter from date (ISO string)
- `endDate` (optional): Filter to date (ISO string)
- `sortBy` (optional): Sort field (default: "createdAt")
- `sortOrder` (optional): Sort direction (default: "desc")
- `search` (optional): Text search in prompt/completion/model

**Example**: `/api/logs?provider=openai&status=success&page=1&limit=20`

**Response**:

```javascript
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "64a123456789abcdef",
        "requestId": "test-123-abc",
        "provider": "openai",
        "model": "gpt-3.5-turbo",
        "prompt": "Hello world",
        "completion": "Hello! How can I help you?",
        "tokenUsage": {
          "promptTokens": 2,
          "completionTokens": 8,
          "totalTokens": 10
        },
        "cost": {
          "totalCost": 0.0001
        },
        "latency": 1200,
        "status": "success",
        "createdAt": "2025-06-22T10:30:00.000Z"
      }
      // ... more logs
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalCount": 1250,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 50
    }
  }
}
```

### POST `/api/logs`

**Purpose**: Create a new log entry

**Request Body**:

```javascript
{
  "requestId": "custom-request-id",
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "prompt": "Test prompt",
  "completion": "Test response",
  "latency": 1200,
  "status": "success",
  "tokenUsage": {
    "promptTokens": 10,
    "completionTokens": 20,
    "totalTokens": 30
  },
  "cost": {
    "totalCost": 0.0001
  }
}
```

### GET `/api/logs/stats`

**Purpose**: Get dashboard statistics for logs

**Response**:

```javascript
{
  "success": true,
  "data": {
    "totalLogs": 15000,
    "recentActivity": 250,
    "avgResponseTime": 1250,
    "successRate": 94.5,
    "topProviders": [
      {"provider": "openai", "count": 8000},
      {"provider": "ollama", "count": 4500}
    ],
    "topModels": [
      {"model": "gpt-3.5-turbo", "count": 6000},
      {"model": "llama2", "count": 3000}
    ]
  }
}
```

### GET `/api/logs/export`

**Purpose**: Export logs to CSV format

**Query Parameters**: Same as GET `/api/logs` for filtering

**Response**: CSV file download

## 🔌 Provider Management Endpoints

### GET `/api/providers`

**Purpose**: Get all provider configurations

**Query Parameters**:

- `testConnections` (optional): Test connections (true/false)

**Response**:

```javascript
{
  "success": true,
  "data": {
    "openai": {
      "name": "OpenAI",
      "baseUrl": "https://api.openai.com/v1",
      "hasApiKey": true,
      "models": ["gpt-4", "gpt-3.5-turbo"],
      "features": ["chat", "completion", "streaming"],
      "status": "connected",
      "enabled": true
    },
    "ollama": {
      "name": "Ollama (Local)",
      "baseUrl": "http://localhost:11434",
      "hasApiKey": false,
      "models": ["llama2", "mistral"],
      "features": ["chat", "completion", "streaming", "local"],
      "status": "connected",
      "enabled": true
    }
    // ... more providers
  }
}
```

### GET `/api/providers/stats`

**Purpose**: Get provider usage statistics

**Response**:

```javascript
{
  "success": true,
  "data": {
    "providers": [
      {
        "provider": "openai",
        "totalRequests": 8000,
        "successRate": 98.5,
        "avgLatency": 1200,
        "totalCost": 25.30,
        "lastUsed": "2025-06-22T10:30:00.000Z"
      }
      // ... more providers
    ]
  }
}
```

### PUT `/api/providers/:provider`

**Purpose**: Update provider configuration

**Request Body**:

```javascript
{
  "baseUrl": "https://api.openai.com/v1",
  "enabled": true
}
```

### POST `/api/providers/:provider/test`

**Purpose**: Test provider connection

**Request Body**:

```javascript
{
  "apiKey": "sk-...",
  "baseUrl": "https://api.openai.com/v1"
}
```

## 🔄 Replay Endpoints

### POST `/api/replay`

**Purpose**: Replay a prompt with specified settings

**Request Body**:

```javascript
{
  "prompt": "Explain quantum computing",
  "provider": "openai",
  "model": "gpt-4",
  "systemMessage": "You are a physics teacher",
  "parameters": {
    "temperature": 0.5,
    "maxTokens": 800
  },
  "originalLogId": "64a123456789abcdef"
}
```

### POST `/api/replay/compare`

**Purpose**: Compare multiple replays of the same prompt

**Request Body**:

```javascript
{
  "prompt": "Write a summary of climate change",
  "configurations": [
    {
      "provider": "openai",
      "model": "gpt-3.5-turbo",
      "parameters": {"temperature": 0.3}
    },
    {
      "provider": "openai",
      "model": "gpt-4",
      "parameters": {"temperature": 0.3}
    }
  ]
}
```

### POST `/api/replay/log/:logId`

**Purpose**: Replay a prompt from an existing log entry

**Request Body**:

```javascript
{
  "provider": "openai",
  "model": "gpt-4",
  "parameters": {
    "temperature": 0.8
  }
}
```

### GET `/api/replay/models`

**Purpose**: Get available models for replay

**Response**: Same format as `/api/test/models`

## 🏥 System Endpoints

### GET `/health`

**Purpose**: Basic health check

**Response**:

```javascript
{
  "status": "healthy",
  "timestamp": "2025-06-22T10:30:00.000Z",
  "uptime": 86400,
  "environment": "production"
}
```

### GET `/`

**Purpose**: API information

**Response**:

```javascript
{
  "message": "OpenLLM Monitor API Server",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2025-06-22T10:30:00.000Z",
  "documentation": "/api/info"
}
```

## 🚨 Error Status Codes

### HTTP Status Codes

- **200**: Success
- **201**: Created (new resource)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (authentication required)
- **404**: Not Found (resource doesn't exist)
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

### Common Error Responses

#### Validation Error (400)

```javascript
{
  "success": false,
  "error": "Missing required fields: prompt, provider, model",
  "requestId": "uuid-v4-string",
  "timestamp": "2025-06-22T10:30:00.000Z"
}
```

#### Rate Limit Error (429)

```javascript
{
  "success": false,
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": 900,
  "requestId": "uuid-v4-string",
  "timestamp": "2025-06-22T10:30:00.000Z"
}
```

## 🔧 API Usage Examples

### Test a Prompt with cURL

```bash
curl -X POST http://localhost:3000/api/test/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is machine learning?",
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7
  }'
```

### Get Analytics with JavaScript

```javascript
const response = await fetch(
  "http://localhost:3000/api/analytics/stats?timeRange=7d"
);
const data = await response.json();

if (data.success) {
  console.log("Total requests:", data.data.overview.totalRequests);
  console.log("Success rate:", data.data.overview.successRate + "%");
}
```

### Filter Logs with Python

```python
import requests

params = {
    'provider': 'openai',
    'status': 'success',
    'startDate': '2025-06-01T00:00:00.000Z',
    'limit': 100
}

response = requests.get('http://localhost:3000/api/logs', params=params)
data = response.json()

if data['success']:
    logs = data['data']['logs']
    print(f"Found {len(logs)} logs")
```

This comprehensive API reference provides all the endpoints and examples needed to integrate with and use the OpenLLM Monitor system effectively.
