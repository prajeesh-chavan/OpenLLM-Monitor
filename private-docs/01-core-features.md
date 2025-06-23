# Core Features Overview

## 🎯 Main System Features

The OpenLLM Monitor backend provides 6 core features:

### 1. **Test Models Feature** (`/api/test/*`)

- **Purpose**: Direct testing of LLM models with prompts
- **Main Functions**: Single model testing, multi-model comparison, cost estimation
- **Files**: `routes/test.js`, `controllers/testController.js`

### 2. **Analytics Feature** (`/api/analytics/*`)

- **Purpose**: Data analysis and insights from usage patterns
- **Main Functions**: Usage statistics, performance metrics, cost analysis
- **Files**: `routes/analytics.js`, `controllers/analyticsController.js`

### 3. **Logs Management** (`/api/logs/*`)

- **Purpose**: Storage and retrieval of all LLM interactions
- **Main Functions**: Log storage, filtering, export, dashboard stats
- **Files**: `routes/logs.js`, `controllers/logController.js`

### 4. **Provider Management** (`/api/providers/*`)

- **Purpose**: Managing different LLM providers (OpenAI, Ollama, etc.)
- **Main Functions**: Provider stats, recommendations, comparisons
- **Files**: `routes/providers.js`, `controllers/providerController.js`

### 5. **Replay Feature** (`/api/replay/*`)

- **Purpose**: Re-execute previous prompts with different models or settings
- **Main Functions**: Single replay, comparison replays, streaming
- **Files**: `routes/replay.js`, `controllers/replayController.js`

### 6. **Monitoring & Logging** (Middleware)

- **Purpose**: Automatic monitoring of LLM API calls
- **Main Functions**: Request interception, automatic logging
- **Files**: `middlewares/llmLogger.js`

## 🔄 Data Flow Pattern

All features follow this pattern:

```
HTTP Request → Route → Controller → Service(s) → Database → Response
```

1. **Route** (`routes/*.js`) - Defines API endpoints and maps to controllers
2. **Controller** (`controllers/*.js`) - Handles business logic and validation
3. **Service** (`services/*.js`) - Integrates with external LLM APIs
4. **Utilities** (`utils/*.js`) - Helper functions for costs, tokens, retries
5. **Database** (`models/*.js`) - Data storage using MongoDB

## 🛠 Supporting Infrastructure

### Services Layer

- **OpenAI Service** - GPT models integration
- **Ollama Service** - Local models integration
- **Mistral Service** - Mistral AI integration
- **OpenRouter Service** - Multi-provider routing

### Utilities

- **Cost Estimator** - Calculate API costs
- **Token Counter** - Count tokens in prompts/responses
- **Retry Handler** - Handle API failures and retries

### Configuration

- **Environment Config** (`config/env.js`) - All settings
- **Database Config** (`config/db.js`) - MongoDB connection

## 🔒 Security & Performance

### Rate Limiting

- API endpoints are rate-limited per IP
- Configurable limits for different endpoints

### Error Handling

- Comprehensive error logging
- Graceful fallbacks for API failures
- Detailed error responses in development

### Performance

- Request/response caching where appropriate
- Database indexing for fast queries
- Connection pooling for external APIs

## 📊 Monitoring Capabilities

### Real-time Monitoring

- WebSocket connections for live updates
- Stream processing for real-time analytics

### Data Collection

- Automatic logging of all LLM interactions
- Performance metrics collection
- Cost tracking and analysis
