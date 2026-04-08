const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");

// Import route modules
const logsRoutes = require("./logs");
const replayRoutes = require("./replay");
const testRoutes = require("./test");
const providersRoutes = require("./providers");
const analyticsRoutes = require("./analytics");

// Public endpoints (no auth required)
// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "OpenLLM Monitor API is running",
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
      endpoints: {
        logs: "/api/logs",
        replay: "/api/replay",
        test: "/api/test",
        providers: "/api/providers",
      },
      supportedProviders: ["openai", "openrouter", "mistral", "ollama"],
      features: [
        "Request logging",
        "Prompt replay",
        "Cost tracking",
        "Performance monitoring",
        "Error analysis",
        "Multi-provider support",
      ],
    },
  });
});

// Protected endpoints (auth required)
router.use("/logs", authenticate, logsRoutes);
router.use("/replay", authenticate, replayRoutes);
router.use("/test", authenticate, testRoutes);
router.use("/providers", authenticate, providersRoutes);
router.use("/analytics", authenticate, analyticsRoutes);

module.exports = router;
