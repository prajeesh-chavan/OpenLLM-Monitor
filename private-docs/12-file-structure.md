# File Structure Guide - Complete Backend Organization

## 🎯 Overview

This guide provides a comprehensive breakdown of the OpenLLM Monitor backend file structure, explaining the purpose, relationships, and importance of each file and directory.

## 📁 Root Directory Structure

```
backend/
├── 📁 config/           # Configuration files
├── 📁 controllers/      # Business logic handlers
├── 📁 middlewares/      # Custom middleware functions
├── 📁 models/          # Database schemas and models
├── 📁 routes/          # API route definitions
├── 📁 services/        # External service integrations
├── 📁 tests/           # Test files and test utilities
├── 📁 utils/           # Utility functions and helpers
├── 📄 app.js           # Main application setup and configuration
├── 📄 server.js        # Server startup and lifecycle management
├── 📄 package.json     # Dependencies, scripts, and project metadata
├── 📄 package-lock.json # Exact dependency versions
├── 📄 .env             # Environment variables (not in repo)
├── 📄 .env.example     # Environment variables template
├── 📄 jest.config.json # Jest testing configuration
├── 📄 Dockerfile       # Docker container configuration
└── 📄 .dockerignore    # Docker ignore patterns
```

## 📋 Detailed File Breakdown

### 🔧 Configuration Directory (`config/`)

#### `config/env.js` (120 lines)

**Purpose**: Central configuration management for all environment variables and application settings.

**Key Responsibilities**:

- Environment variable validation and defaults
- Provider API configurations (OpenAI, Ollama, etc.)
- Database connection settings
- Security and rate limiting configurations
- Feature flags and toggles

**Dependencies**:

- Uses `dotenv` for environment variable loading
- Validates required environment variables on startup

**Example Usage**:

```javascript
const config = require("./config/env");
const apiKey = config.providers.openai.apiKey;
const dbUri = config.mongodb.uri;
```

#### `config/db.js` (85 lines)

**Purpose**: Database connection management and configuration for MongoDB.

**Key Responsibilities**:

- MongoDB connection establishment
- Connection pool configuration
- Error handling for database connectivity
- Connection monitoring and health checks

**Dependencies**:

- `mongoose` for MongoDB ODM
- `config/env.js` for database settings

**Features**:

- Automatic reconnection on connection loss
- Connection pooling for performance
- Graceful shutdown handling

### 🎮 Controllers Directory (`controllers/`)

Controllers contain the business logic for handling API requests and responses.

#### `controllers/testController.js` (537 lines)

**Purpose**: Handles all test-related functionality for direct model testing.

**Key Methods**:

- `testPrompt()` - Single model testing
- `compareModels()` - Multi-model comparison
- `getAvailableModels()` - Model listing
- `getCostEstimate()` - Cost estimation
- `validateConfig()` - Configuration validation

**Dependencies**:

- All service classes (OpenAI, Ollama, Mistral, OpenRouter)
- Utility classes (costEstimator, tokenCounter, retryHandler)
- Log model for data persistence

#### `controllers/analyticsController.js` (752 lines)

**Purpose**: Provides analytics and reporting functionality.

**Key Methods**:

- `getStats()` - Overall system statistics
- `getRequestVolume()` - Usage patterns over time
- `getModelPerformance()` - Performance metrics by model
- `getCostAnalysis()` - Cost breakdown and analysis
- `getProviderDistribution()` - Provider usage distribution

**Dependencies**:

- Log model for data querying
- MongoDB aggregation framework

#### `controllers/logController.js` (579 lines)

**Purpose**: Manages log storage, retrieval, and analysis.

**Key Methods**:

- `getLogs()` - Paginated log retrieval with filtering
- `createLog()` - New log entry creation
- `getStats()` - Dashboard statistics
- `exportLogs()` - Data export functionality
- `getModelComparison()` - Model performance comparison

**Dependencies**:

- Log model for database operations
- UUID for request ID generation

#### `controllers/providerController.js` (652 lines)

**Purpose**: Manages LLM provider configurations and monitoring.

**Key Methods**:

- `getAllProviders()` - Provider configuration listing
- `updateProvider()` - Configuration updates
- `testConnection()` - Provider connectivity testing
- `getProviderStats()` - Usage statistics
- `getRecommendations()` - Provider recommendations

**Dependencies**:

- Configuration system for provider settings
- Service classes for connection testing

#### `controllers/replayController.js` (580 lines)

**Purpose**: Handles prompt replay functionality.

**Key Methods**:

- `replayPrompt()` - Basic replay functionality
- `replayFromLog()` - Replay from existing log entries
- `streamReplay()` - Streaming replay responses
- `compareReplays()` - Multi-configuration replay comparison

**Dependencies**:

- All service classes for provider communication
- Log model for historical data access

### 🛠️ Middlewares Directory (`middlewares/`)

#### `middlewares/llmLogger.js` (245 lines)

**Purpose**: Automatic logging middleware for LLM API calls.

**Key Features**:

- Intercepts outgoing LLM API requests
- Automatically logs request/response data
- Configurable logging parameters
- Real-time WebSocket broadcasting
- Performance impact minimization

**Integration Points**:

- Applied globally in `app.js`
- Integrates with WebSocket for real-time updates
- Uses Log model for data persistence

### 🗄️ Models Directory (`models/`)

#### `models/Log.js` (239 lines)

**Purpose**: Defines the MongoDB schema for log entries.

**Schema Components**:

- Request information (ID, provider, model)
- Prompt and response data
- Performance metrics (latency, tokens)
- Cost calculations
- Error information and retry history
- Metadata for categorization

**Indexes**:

- Performance-optimized indexes for common queries
- Compound indexes for complex filtering
- Time-based indexes for analytics

### 🛣️ Routes Directory (`routes/`)

Routes define API endpoints and map them to controller methods.

#### `routes/index.js` (45 lines)

**Purpose**: Central route aggregation and API organization.

**Structure**:

```javascript
router.use("/test", testRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/logs", logRoutes);
router.use("/providers", providerRoutes);
router.use("/replay", replayRoutes);
```

#### `routes/test.js` (45 lines)

**Purpose**: Test functionality endpoints.

**Endpoints**:

- `POST /prompt` - Single model testing
- `POST /compare` - Multi-model comparison
- `GET /models` - Available models
- `POST /estimate` - Cost estimation
- `POST /validate` - Configuration validation

#### `routes/analytics.js` (74 lines)

**Purpose**: Analytics and reporting endpoints.

**Endpoints**:

- `GET /stats` - System statistics
- `GET /usage` - Usage patterns
- `GET /performance` - Performance metrics
- `GET /costs` - Cost analysis
- `GET /providers` - Provider analytics

#### `routes/logs.js` (80 lines)

**Purpose**: Log management endpoints.

**Endpoints**:

- `GET /` - Log retrieval with filtering
- `POST /` - Log creation
- `GET /stats` - Dashboard statistics
- `GET /export` - Data export

#### `routes/providers.js` (136 lines)

**Purpose**: Provider management endpoints.

**Endpoints**:

- `GET /` - Provider configurations
- `PUT /:provider` - Configuration updates
- `POST /:provider/test` - Connection testing
- `GET /stats` - Provider statistics

#### `routes/replay.js` (65 lines)

**Purpose**: Replay functionality endpoints.

**Endpoints**:

- `POST /` - Basic replay
- `POST /stream` - Streaming replay
- `POST /compare` - Comparison replay
- `POST /log/:logId` - Replay from log

### 🌐 Services Directory (`services/`)

Services handle external API integrations and provider-specific logic.

#### `services/openaiService.js` (332 lines)

**Purpose**: OpenAI API integration for GPT models.

**Key Features**:

- Authentication handling
- Request/response formatting
- Token counting integration
- Cost calculation
- Retry logic implementation
- Streaming support

#### `services/ollamaService.js` (531 lines)

**Purpose**: Local Ollama model integration.

**Key Features**:

- Local API communication
- Model discovery and management
- Token estimation for local models
- Free cost handling (local deployment)
- Extended timeout handling

#### `services/mistralService.js` (285 lines)

**Purpose**: Mistral AI API integration.

**Key Features**:

- Mistral-specific authentication
- Model variant support
- European compliance considerations
- Cost optimization

#### `services/openrouterService.js` (378 lines)

**Purpose**: OpenRouter multi-provider integration.

**Key Features**:

- Multi-provider routing
- Provider fallback capabilities
- Model format handling (provider/model)
- Unified API access

### 🔧 Utils Directory (`utils/`)

Utility functions provide common functionality across the application.

#### `utils/costEstimator.js` (311 lines)

**Purpose**: Cost calculation for different LLM providers.

**Key Features**:

- Provider-specific pricing data
- Token-based cost calculation
- Cost projection and analysis
- Multi-currency support potential

**Pricing Support**:

- OpenAI models (GPT-4, GPT-3.5-Turbo, etc.)
- Mistral models (Tiny, Small, Medium, Large)
- OpenRouter models (various providers)
- Ollama models (free/local)

#### `utils/tokenCounter.js` (184 lines)

**Purpose**: Token counting and estimation for different models.

**Key Features**:

- Accurate token counting using tiktoken
- Model-specific encoding support
- Chat message format handling
- Fallback estimation for unknown models

**Supported Models**:

- OpenAI models (precise counting)
- Chat format with role/content structure
- Ollama models (estimation)

#### `utils/retryHandler.js` (362 lines)

**Purpose**: Robust retry logic for API calls.

**Key Features**:

- Exponential backoff with jitter
- Provider-specific retry configurations
- Error categorization and retry decisions
- Comprehensive retry history tracking

**Retry Strategies**:

- Different configurations per provider
- Retryable error detection
- Maximum retry limits
- Delay calculations

### 🧪 Tests Directory (`tests/`)

#### `tests/setup.js` (95 lines)

**Purpose**: Test environment setup and configuration.

**Responsibilities**:

- Test database configuration
- Mock service initialization
- Global test utilities
- Environment isolation

#### `tests/testApp.js` (120 lines)

**Purpose**: Express app instance for testing.

**Features**:

- Isolated test application
- Test-specific middleware
- Mock integrations

#### `tests/*.test.js` Files

- `analytics.test.js` (180 lines) - Analytics functionality tests
- `logs.test.js` (165 lines) - Log management tests
- `providers.test.js` (140 lines) - Provider management tests
- `replay.test.js` (175 lines) - Replay functionality tests
- `test.test.js` (200 lines) - Test models functionality tests

### 📄 Core Application Files

#### `app.js` (353 lines)

**Purpose**: Main application class and configuration.

**Key Responsibilities**:

- Express application setup
- Middleware configuration (security, CORS, rate limiting)
- Route initialization
- WebSocket setup for real-time features
- Error handling configuration

**Architecture Pattern**:

- Class-based application structure
- Modular initialization methods
- Separation of concerns

#### `server.js` (75 lines)

**Purpose**: Server startup and lifecycle management.

**Key Responsibilities**:

- Database connection establishment
- Application instance creation
- HTTP server startup
- Graceful shutdown handling
- Environment-specific configurations

#### `package.json` (Dependencies and Scripts)

**Purpose**: Project metadata, dependencies, and automation scripts.

**Key Sections**:

- **Dependencies**: Production libraries
- **DevDependencies**: Development and testing tools
- **Scripts**: Automation commands
- **Engines**: Node.js version requirements

**Main Dependencies**:

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `socket.io` - WebSocket support
- `axios` - HTTP client
- `helmet` - Security middleware
- `cors` - Cross-origin resource sharing
- `morgan` - Request logging

**Development Dependencies**:

- `jest` - Testing framework
- `supertest` - API testing
- `nodemon` - Development server

## 🔗 File Relationships and Dependencies

### Dependency Flow

```
app.js
├── config/env.js
├── config/db.js
├── routes/index.js
│   ├── routes/test.js → controllers/testController.js
│   ├── routes/analytics.js → controllers/analyticsController.js
│   ├── routes/logs.js → controllers/logController.js
│   ├── routes/providers.js → controllers/providerController.js
│   └── routes/replay.js → controllers/replayController.js
├── middlewares/llmLogger.js
└── models/Log.js

controllers/
├── testController.js
│   ├── services/openaiService.js
│   ├── services/ollamaService.js
│   ├── services/mistralService.js
│   ├── services/openrouterService.js
│   ├── utils/costEstimator.js
│   ├── utils/tokenCounter.js
│   ├── utils/retryHandler.js
│   └── models/Log.js
└── [other controllers follow similar pattern]

services/
├── openaiService.js
│   ├── utils/tokenCounter.js
│   ├── utils/costEstimator.js
│   └── utils/retryHandler.js
└── [other services follow similar pattern]
```

### Import Patterns

```javascript
// Configuration imports
const config = require("../config/env");
const database = require("../config/db");

// Service imports
const OpenAIService = require("../services/openaiService");
const OllamaService = require("../services/ollamaService");

// Utility imports
const costEstimator = require("../utils/costEstimator");
const tokenCounter = require("../utils/tokenCounter");
const retryHandler = require("../utils/retryHandler");

// Model imports
const Log = require("../models/Log");
```

## 📊 File Size and Complexity Analysis

### Large Files (300+ lines)

- `controllers/analyticsController.js` (752 lines) - Complex analytics queries
- `controllers/logController.js` (579 lines) - Comprehensive log management
- `controllers/providerController.js` (652 lines) - Provider configuration logic
- `controllers/replayController.js` (580 lines) - Replay functionality
- `controllers/testController.js` (537 lines) - Core testing functionality

### Medium Files (100-300 lines)

- `services/openaiService.js` (332 lines) - OpenAI integration
- `services/ollamaService.js` (531 lines) - Ollama integration
- `utils/costEstimator.js` (311 lines) - Cost calculation logic
- `utils/retryHandler.js` (362 lines) - Retry handling logic

### Small Files (< 100 lines)

- Route files (45-136 lines) - Simple endpoint definitions
- `utils/tokenCounter.js` (184 lines) - Token counting utilities
- Configuration files (75-120 lines) - Settings and setup

## 🎯 File Organization Principles

### Separation of Concerns

- **Routes**: Only endpoint definitions and parameter validation
- **Controllers**: Business logic and request/response handling
- **Services**: External API integration and provider-specific logic
- **Models**: Data structure and database interaction
- **Utils**: Reusable helper functions

### Naming Conventions

- **Files**: camelCase (e.g., `testController.js`)
- **Classes**: PascalCase (e.g., `TestController`)
- **Functions**: camelCase (e.g., `testPrompt`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_MODEL`)

### Module Exports

- **Classes**: `module.exports = new ClassName()` or `module.exports = ClassName`
- **Functions**: `module.exports = { function1, function2 }`
- **Utilities**: `module.exports = new UtilityClass()`

This file structure provides a scalable, maintainable architecture that separates concerns effectively while maintaining clear relationships between components. Each file has a specific purpose and responsibility within the larger system architecture.
