const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");
const ApiResponse = require("../utils/apiResponse");

router.get("/", (req, res) => providerController.getAllProviders(req, res));
router.get("/stats", (req, res) => providerController.getProviderStats(req, res));
router.get("/recommendations", (req, res) => providerController.getRecommendations(req, res));
router.get("/comparison", (req, res) => {
  ApiResponse.success(res, {
    comparison: [
      { provider: "openai", metrics: { performance: 95, cost: 0.02, reliability: 99 } },
      { provider: "ollama", metrics: { performance: 85, cost: 0.0, reliability: 90 } },
      { provider: "mistral", metrics: { performance: 90, cost: 0.015, reliability: 95 } },
      { provider: "openrouter", metrics: { performance: 88, cost: 0.018, reliability: 92 } },
    ],
  });
});

router.post("/test-connection", (req, res) => {
  const { provider } = req.body;
  if (!provider) return ApiResponse.badRequest(res, "Provider is required");
  const validProviders = ["openai", "ollama", "mistral", "openrouter"];
  if (!validProviders.includes(provider)) return ApiResponse.badRequest(res, "Invalid provider");
  req.params.provider = provider;
  return providerController.testConnection(req, res);
});

router.get("/:provider", (req, res) => providerController.getProvider(req, res));
router.put("/:provider", (req, res) => providerController.updateProvider(req, res));
router.post("/:provider/test", (req, res) => providerController.testConnection(req, res));
router.get("/:provider/models", (req, res) => providerController.getModels(req, res));
router.post("/:provider/complete", (req, res) => providerController.generateCompletion(req, res));

module.exports = router;
