const App = require("./app");
const config = require("./config/env");
const database = require("./config/db");

/**
 * OpenLLM Monitor Server
 */
class Server {
  constructor() {
    this.app = new App();
    this.port = config.port;
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Connect to database
      console.log("🔌 Connecting to database...");
      await database.connect();

      // Start HTTP server
      this.server = this.app.getServer();

      this.server.listen(this.port, () => {
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                           OpenLLM Monitor Server                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  🚀 Server running on port ${this.port.toString().padEnd(52)}                ║
║  🌐 Environment: ${config.nodeEnv.toUpperCase().padEnd(59)}                  ║
║  📊 Database: ${database.getConnectionStatus().padEnd(62)}                   ║
║  🔗 API Base URL: http://localhost:${this.port}/api${" ".repeat(37)}         ║
║  📡 WebSocket: http://localhost:${this.port}${" ".repeat(42)}                ║
║  📚 API Info: http://localhost:${this.port}/api/info${" ".repeat(35)}        ║
╚══════════════════════════════════════════════════════════════════════════════╝

🎯 Ready to monitor LLM requests!

Supported Providers:
  • OpenAI (GPT-3.5, GPT-4)
  • OpenRouter (Multi-model access)
  • Mistral AI (Mistral models)
  • Ollama (Local models)

Features:
  ✅ Real-time request logging
  ✅ Prompt replay & comparison
  ✅ Cost tracking & analysis
  ✅ Performance monitoring
  ✅ Error analysis & debugging
  ✅ WebSocket real-time updates

Environment Configuration:
  • Node.js: ${process.version}
  • MongoDB: ${database.mongoUri}
  • CORS Origins: ${config.corsOrigins.join(", ")}
  • Rate Limiting: ${config.rateLimit.maxRequests} requests per ${
          config.rateLimit.windowMs / 1000 / 60
        } minutes

🔧 To configure providers, visit: http://localhost:${this.port}/api/providers
📖 For API documentation, visit: http://localhost:${this.port}/api/info
        `);

        this.displayProviderStatus();
      });

      // Handle server errors
      this.server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
          console.error(`❌ Port ${this.port} is already in use`);
          process.exit(1);
        } else {
          console.error("❌ Server error:", error);
        }
      });
    } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  }

  /**
   * Display provider status on startup
   */
  async displayProviderStatus() {
    try {
      const providers = {
        OpenAI: config.providers.openai.apiKey
          ? "🟢 API Key Set"
          : "🔴 No API Key",
        OpenRouter: config.providers.openrouter.apiKey
          ? "🟢 API Key Set"
          : "🔴 No API Key",
        Mistral: config.providers.mistral.apiKey
          ? "🟢 API Key Set"
          : "🔴 No API Key",
        Ollama: "🟡 Local (No API Key Required)",
      };

      console.log("\n📡 Provider Status:");
      Object.entries(providers).forEach(([name, status]) => {
        console.log(`  ${name}: ${status}`);
      });

      // Test connections in background
      setTimeout(() => {
        this.testProviderConnections();
      }, 2000);
    } catch (error) {
      console.error("Error displaying provider status:", error);
    }
  }

  /**
   * Test provider connections
   */
  async testProviderConnections() {
    const services = {
      OpenAI: () => new (require("./services/openaiService"))(),
      OpenRouter: () => new (require("./services/openrouterService"))(),
      Ollama: () => new (require("./services/ollamaService"))(),
    };

    console.log("\n🔍 Testing provider connections...");

    for (const [name, createService] of Object.entries(services)) {
      try {
        const service = createService();
        const startTime = Date.now();
        const isConnected = await service.testConnection();
        const latency = Date.now() - startTime;

        if (isConnected) {
          console.log(`  ${name}: 🟢 Connected (${latency}ms)`);
        } else {
          console.log(`  ${name}: 🔴 Connection failed`);
        }
      } catch (error) {
        console.log(`  ${name}: 🔴 Error - ${error.message}`);
      }
    }

    console.log("\n🎉 Server initialization complete!\n");
  }

  /**
   * Stop the server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log("👋 Server stopped");
          resolve();
        });
      });
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

module.exports = Server;
