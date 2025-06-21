const express = require("express");
const router = express.Router();

// Import route modules
const logsRoutes = require("./logs");
const replayRoutes = require("./replay");
const testRoutes = require("./test");
const providersRoutes = require("./providers");
const analyticsRoutes = require("./analytics");

// Mount routes
router.use("/logs", logsRoutes);
router.use("/replay", replayRoutes);
router.use("/test", testRoutes);
router.use("/providers", providersRoutes);
router.use("/analytics", analyticsRoutes);

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

module.exports = router;
