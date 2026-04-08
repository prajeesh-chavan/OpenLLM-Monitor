require("dotenv").config();

/**
 * Environment configuration loader
 */
const config = {
  // Server Configuration
  port: parseInt(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || null,

  // Database
  mongoUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/openllm-monitor",

  // LLM Provider APIs
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: "https://api.openai.com/v1",
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: "https://openrouter.ai/api/v1",
    },
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY,
      baseUrl: "https://api.mistral.ai/v1",
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      baseUrl:
        process.env.GEMINI_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta/models",
    },
    grok: {
      apiKey: process.env.GROK_API_KEY,
      baseUrl: process.env.GROK_BASE_URL || "https://api.grok.x.ai/v1",
    },
  },

  // CORS (supports comma-separated origins: "http://localhost:3000,http://100.x.x.x:3000")
  corsOrigins: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
    : ["http://localhost:5173"],

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Development settings
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

// Validation
if (config.isProduction) {
  const requiredEnvVars = ["JWT_SECRET", "MONGODB_URI"];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(
      "❌ Missing required environment variables:",
      missingVars.join(", ")
    );
    process.exit(1);
  }

  // Validate JWT_SECRET strength in production
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error(
      "❌ JWT_SECRET must be at least 32 characters in production"
    );
    process.exit(1);
  }
}

module.exports = config;
