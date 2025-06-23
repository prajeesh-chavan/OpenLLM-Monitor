# Application Architecture - Detailed Documentation

## 🎯 Architecture Overview

The OpenLLM Monitor backend follows a layered, modular architecture designed for scalability, maintainability, and extensibility. The application uses Express.js as the web framework with MongoDB for data persistence, and provides both REST API and real-time WebSocket capabilities.

## 📁 Files Involved

### Core Application Files

- `app.js` - Main application class and setup (353 lines)
- `server.js` - Server startup and lifecycle management
- `config/env.js` - Environment configuration
- `config/db.js` - Database configuration

### Supporting Files

- `routes/index.js` - Route aggregation and API organization
- `middlewares/llmLogger.js` - Automatic LLM request logging
- `package.json` - Dependencies and scripts

## 🏗️ Application Class (`app.js`)

### Class Overview

The `App` class encapsulates the entire application setup, including middleware configuration, route initialization, WebSocket setup, and error handling.

### Constructor - Application Initialization

```javascript
class App {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: config.corsOrigins,
        methods: ["GET", "POST"],
      },
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeWebSocket();
    this.initializeErrorHandling();
  }
}
```

**Architecture Components:**

- **Express App**: Core web application framework
- **HTTP Server**: Node.js HTTP server for handling requests
- **Socket.IO**: WebSocket server for real-time communication
- **Modular Initialization**: Separate methods for different concerns

## 🔧 Middleware Stack (`initializeMiddlewares()`)

### Security Middleware

```javascript
// Helmet for security headers
this.app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "ws:"],
      },
    },
  })
);
```

**Security Features:**

- **Content Security Policy**: Prevents XSS attacks
- **HTTPS Enforcement**: Redirects HTTP to HTTPS in production
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing

### CORS Configuration

```javascript
this.app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
```

**CORS Features:**

- **Origin Whitelist**: Configurable allowed origins
- **Credentials**: Supports cookie-based authentication
- **Preflight Handling**: Handles OPTIONS requests

### Rate Limiting

```javascript
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

this.app.use("/api/", limiter);
```

**Rate Limiting Features:**

- **IP-Based Limiting**: Tracks requests per IP address
- **Configurable Windows**: Customizable time windows and limits
- **Standard Headers**: Includes rate limit headers in responses
- **API-Only**: Only applies to API endpoints, not static files

### Request Processing

```javascript
// Logging
if (config.nodeEnv === "development") {
  this.app.use(morgan("dev"));
} else {
  this.app.use(morgan("combined"));
}

// Body parsing
this.app.use(express.json({ limit: "10mb" }));
this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy
this.app.set("trust proxy", 1);

// Request ID middleware
this.app.use((req, res, next) => {
  req.requestId = require("uuid").v4();
  res.setHeader("X-Request-ID", req.requestId);
  next();
});
```

**Request Processing Features:**

- **Environment-Aware Logging**: Different log formats for dev/prod
- **Large Payload Support**: 10MB limit for JSON/form data
- **Proxy Trust**: Accurate IP addresses behind proxies
- **Request Tracing**: Unique ID for each request

### LLM Monitoring Middleware

```javascript
this.app.use(
  llmLogger.createMiddleware({
    enabled: true,
    logPrompt: true,
    logCompletion: true,
    logParameters: true,
    maxPromptLength: 10000,
    maxCompletionLength: 10000,
  })
);
```

**LLM Monitoring Features:**

- **Automatic Logging**: Captures all LLM API calls
- **Configurable Details**: Control what data is logged
- **Size Limits**: Prevents extremely large logs
- **Performance Impact**: Minimal overhead on requests

## 🛣️ Route Architecture (`initializeRoutes()`)

### Health and Status Endpoints

```javascript
// Health check endpoint
this.app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
this.app.get("/", (req, res) => {
  res.json({
    message: "OpenLLM Monitor API Server",
    version: "1.0.0",
    status: "running",
    timestamp: new Date(),
    documentation: "/api/info",
  });
});
```

### API Route Organization

```javascript
// API routes
this.app.use("/api", apiRoutes);

// Static file serving (production)
if (config.isProduction) {
  this.app.use(express.static("public"));

  // Client-side routing support
  this.app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}
```

**Route Features:**

- **Modular API**: All API routes under `/api` prefix
- **Health Monitoring**: Dedicated health check endpoint
- **SPA Support**: Single-page app routing in production
- **Static Assets**: Efficient static file serving

## 🔌 WebSocket Architecture (`initializeWebSocket()`)

### Connection Management

```javascript
this.io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Room-based subscriptions
  socket.on("join-logs", () => {
    socket.join("logs");
    console.log(`Client ${socket.id} joined logs room`);
  });

  socket.on("join-providers", () => {
    socket.join("providers");
    console.log(`Client ${socket.id} joined providers room`);
  });

  // Disconnection handling
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Initial confirmation
  socket.emit("connected", {
    message: "Connected to OpenLLM Monitor",
    timestamp: new Date(),
  });
});
```

**WebSocket Features:**

- **Room-Based Broadcasting**: Selective event distribution
- **Connection Tracking**: Monitor client connections
- **Event-Driven**: Asynchronous real-time communication
- **Namespace Support**: Organized communication channels

### Real-Time Log Broadcasting

```javascript
setupLogBroadcasting() {
  const Log = require("./models/Log");

  // MongoDB Change Streams for real-time updates
  if (config.nodeEnv === "production") {
    const changeStream = Log.watch([{ $match: { operationType: "insert" } }]);

    changeStream.on("change", (change) => {
      this.io.to("logs").emit("new-log", {
        type: "new-log",
        data: change.fullDocument,
        timestamp: new Date()
      });
    });
  }
}
```

**Real-Time Features:**

- **Change Streams**: MongoDB native change detection
- **Production-Only**: Avoids overhead in development
- **Selective Broadcasting**: Only to interested clients
- **Data Enrichment**: Includes metadata with events

## 🚨 Error Handling Architecture (`initializeErrorHandling()`)

### 404 Handler

```javascript
// 404 handler for API routes
this.app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});
```

### Global Error Handler

```javascript
// Global error handling middleware
this.app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // Determine error status
  const status = error.status || error.statusCode || 500;

  // Error response
  const errorResponse = {
    success: false,
    error: error.message || "Internal server error",
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (config.nodeEnv === "development") {
    errorResponse.stack = error.stack;
    errorResponse.details = error.details;
  }

  res.status(status).json(errorResponse);
});
```

**Error Handling Features:**

- **Consistent Format**: Standard error response structure
- **Request Tracing**: Includes request ID for debugging
- **Environment Awareness**: More details in development
- **Comprehensive Logging**: All errors logged for analysis

## 🔄 Application Lifecycle

### Startup Sequence

```javascript
// server.js
const App = require("./app");
const database = require("./config/db");

async function startServer() {
  try {
    // 1. Connect to database
    await database.connect();

    // 2. Initialize application
    const app = new App();

    // 3. Start HTTP server
    const server = app.server;
    const port = process.env.PORT || 3000;

    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Dashboard: http://localhost:${port}`);
      console.log(`🔧 API: http://localhost:${port}/api`);
    });

    // 4. Graceful shutdown handling
    setupGracefulShutdown(server);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
```

### Graceful Shutdown

```javascript
function setupGracefulShutdown(server) {
  const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    server.close(() => {
      console.log("HTTP server closed");

      // Close database connection
      mongoose.connection.close(() => {
        console.log("Database connection closed");
        process.exit(0);
      });
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}
```

## 🔧 Configuration Architecture

### Environment Configuration

```javascript
// config/env.js
module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",

  // Database configuration
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/openllm-monitor",
  },

  // Security configuration
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },

  // Provider configurations
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    },
    // ... other providers
  },
};
```

## 📊 Monitoring and Observability

### Application Metrics

```javascript
// Built-in monitoring
this.app.get("/metrics", (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    connections: this.io.engine.clientsCount,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});
```

### Health Checks

```javascript
// Comprehensive health check
this.app.get("/health/detailed", async (req, res) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      redis: "unknown",
      providers: {},
    },
  };

  // Check database
  try {
    await mongoose.connection.db.admin().ping();
    health.services.database = "healthy";
  } catch (error) {
    health.services.database = "unhealthy";
    health.status = "degraded";
  }

  // Check providers
  for (const [name, service] of Object.entries(this.services)) {
    try {
      await service.healthCheck?.();
      health.services.providers[name] = "healthy";
    } catch (error) {
      health.services.providers[name] = "unhealthy";
    }
  }

  res.json(health);
});
```

## 🔒 Security Architecture

### Authentication Strategy

```javascript
// JWT middleware (if authentication is enabled)
this.app.use("/api/admin", (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid access token" });
  }
});
```

### API Key Validation

```javascript
// Provider API key validation
this.app.use("/api/test", (req, res, next) => {
  const { provider } = req.body;

  if (provider && !config.providers[provider]?.apiKey) {
    return res.status(400).json({
      error: `${provider} API key not configured`,
    });
  }

  next();
});
```

## 🎯 Deployment Architecture

### Production Optimizations

- **Process Management**: PM2 for process clustering
- **Reverse Proxy**: Nginx for load balancing and SSL
- **Container Support**: Docker containerization
- **Environment Separation**: Dev/staging/production configs

### Scaling Considerations

- **Horizontal Scaling**: Multiple application instances
- **Database Scaling**: MongoDB replica sets and sharding
- **Caching Layer**: Redis for session and data caching
- **CDN Integration**: Static asset distribution

The Application Architecture provides a robust, scalable foundation for the OpenLLM Monitor system, ensuring reliability, performance, and maintainability across different deployment scenarios.
