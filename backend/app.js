const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const socketIo = require("socket.io");
const path = require("path");

const config = require("./config/env");
const database = require("./config/db");
const apiRoutes = require("./routes");
const llmLogger = require("./middlewares/llmLogger");

/**
 * OpenLLM Monitor Express Application
 */
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

  /**
   * Initialize middlewares
   */
  initializeMiddlewares() {
    // Security middleware
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

    // CORS
    this.app.use(
      cors({
        origin: config.corsOrigins,
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );

    // Rate limiting
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

    // Logging
    if (config.nodeEnv === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Trust proxy (for accurate IP addresses)
    this.app.set("trust proxy", 1);

    // Custom middleware for request ID
    this.app.use((req, res, next) => {
      req.requestId = require("uuid").v4();
      res.setHeader("X-Request-ID", req.requestId);
      next();
    });

    // LLM logging middleware (for monitoring LLM API calls)
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
  }
  /**
   * Initialize routes
   */
  initializeRoutes() {
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

    // API routes - these must come before the catch-all route
    this.app.use("/api", apiRoutes);

    // Serve static files in production
    if (config.isProduction) {
      this.app.use(express.static("public"));
    }
  }

  /**
   * Initialize WebSocket for real-time updates
   */ initializeWebSocket() {
    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join room for real-time log updates
      socket.on("join-logs", () => {
        socket.join("logs");
        console.log(`Client ${socket.id} joined logs room`);
      });

      // Join room for provider status updates
      socket.on("join-providers", () => {
        socket.join("providers");
        console.log(`Client ${socket.id} joined providers room`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });

      // Send initial connection confirmation
      socket.emit("connected", {
        message: "Connected to OpenLLM Monitor",
        timestamp: new Date(),
      });
    });

    // Pass WebSocket instance to LLM Logger for real-time updates
    llmLogger.setWebSocketInstance(this.io);

    // Broadcast new logs to connected clients
    this.setupLogBroadcasting();
  }

  /**
   * Set up log broadcasting to WebSocket clients
   */
  setupLogBroadcasting() {
    const Log = require("./models/Log");

    // Watch for new log entries (MongoDB Change Streams)
    if (config.nodeEnv === "production") {
      const changeStream = Log.watch([{ $match: { operationType: "insert" } }]);

      changeStream.on("change", (change) => {
        // Broadcast new log to connected clients
        this.io.to("logs").emit("new-log", {
          type: "new-log",
          data: change.fullDocument,
          timestamp: new Date(),
        });
      });

      changeStream.on("error", (error) => {
        console.error("MongoDB Change Stream error:", error);
      });
    }

    // Alternative: Polling-based approach for development
    if (config.isDevelopment) {
      let lastLogTime = new Date();

      setInterval(async () => {
        try {
          const newLogs = await Log.find({
            createdAt: { $gt: lastLogTime },
          })
            .sort({ createdAt: 1 })
            .limit(10);

          if (newLogs.length > 0) {
            newLogs.forEach((log) => {
              this.io.to("logs").emit("new-log", {
                type: "new-log",
                data: log,
                timestamp: new Date(),
              });
            });

            lastLogTime = newLogs[newLogs.length - 1].createdAt;
          }
        } catch (error) {
          console.error("Error checking for new logs:", error);
        }
      }, 2000); // Check every 2 seconds
    }
  }
  /**
   * Initialize error handling
   */
  initializeErrorHandling() {
    // 404 handler for API routes
    this.app.use("/api/*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "API route not found",
        path: req.originalUrl,
        timestamp: new Date(),
      });
    });

    // Handle client-side routing for production (serve index.html for non-API routes)
    if (config.isProduction) {
      this.app.get("*", (req, res) => {
        // Check if the request is for an API route that wasn't found
        if (req.path.startsWith("/api/")) {
          return res.status(404).json({
            success: false,
            error: "API route not found",
            path: req.originalUrl,
            timestamp: new Date(),
          });
        }
        
        // Serve index.html for all other routes (client-side routing)
        res.sendFile(path.join(__dirname, "public", "index.html"));
      });
    }

    // Default 404 handler for development
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Route not found",
        path: req.originalUrl,
        timestamp: new Date(),
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error("Global error handler:", error);

      // Don't log client aborted connections
      if (error.code === "ECONNABORTED") {
        return;
      }

      const statusCode = error.statusCode || error.status || 500;
      const message = error.message || "Internal server error";

      res.status(statusCode).json({
        success: false,
        error: message,
        requestId: req.requestId,
        timestamp: new Date(),
        ...(config.isDevelopment && { stack: error.stack }),
      });
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      // Don't exit the process in production
      if (config.isDevelopment) {
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      // Graceful shutdown
      this.gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    // Handle shutdown signals
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
  }

  /**
   * Graceful shutdown
   * @param {string} signal - Shutdown signal
   */
  async gracefulShutdown(signal) {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    this.server.close(() => {
      console.log("HTTP server closed");
    });

    // Close WebSocket connections
    this.io.close(() => {
      console.log("WebSocket server closed");
    });

    try {
      // Close database connection
      await database.disconnect();

      // Clean up active requests
      llmLogger.cleanupActiveRequests(0);

      console.log("Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  }

  /**
   * Get Express app instance
   * @returns {Express} Express app
   */
  getApp() {
    return this.app;
  }

  /**
   * Get HTTP server instance
   * @returns {Server} HTTP server
   */
  getServer() {
    return this.server;
  }

  /**
   * Get Socket.IO instance
   * @returns {SocketIO} Socket.IO instance
   */
  getIO() {
    return this.io;
  }
}

module.exports = App;
