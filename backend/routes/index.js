const express = require("express");
const router = express.Router();

const logsRoutes = require("./logs");
const replayRoutes = require("./replay");
const testRoutes = require("./test");
const providersRoutes = require("./providers");
const analyticsRoutes = require("./analytics");
const authRoutes = require("./auth");
const evaluationRoutes = require("./evaluation");

// Mount routes under /api/ (legacy, backward compatible)
router.use("/auth", authRoutes);
router.use("/logs", logsRoutes);
router.use("/replay", replayRoutes);
router.use("/test", testRoutes);
router.use("/providers", providersRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/evaluations", evaluationRoutes);

// Mount routes under /api/v1/ (versioned)
router.use("/v1/auth", authRoutes);
router.use("/v1/logs", logsRoutes);
router.use("/v1/replay", replayRoutes);
router.use("/v1/test", testRoutes);
router.use("/v1/providers", providersRoutes);
router.use("/v1/analytics", analyticsRoutes);
router.use("/v1/evaluations", evaluationRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "OpenLLM Monitor API is running",
    timestamp: new Date(),
    version: "1.0.0",
  });
});

// Versioned health check
router.get("/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "OpenLLM Monitor API v1 is running",
    timestamp: new Date(),
    version: "1.0.0",
  });
});

// API info endpoint
router.get("/info", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "OpenLLM Monitor API",
      version: "1.0.0",
      description: "Real-time LLM observability dashboard API",
      versions: {
        v1: "/api/v1",
        legacy: "/api",
      },
      endpoints: {
        auth: "/api/auth",
        logs: "/api/logs",
        replay: "/api/replay",
        test: "/api/test",
        providers: "/api/providers",
        analytics: "/api/analytics",
        evaluations: "/api/evaluations",
      },
      supportedProviders: ["openai", "openrouter", "mistral", "ollama", "gemini", "grok"],
      features: [
        "Request logging",
        "Prompt replay",
        "Cost tracking",
        "Performance monitoring",
        "Error analysis",
        "Multi-provider support",
        "Real-time WebSocket updates",
        "LLM output evaluation",
      ],
    },
  });
});

module.exports = router;
