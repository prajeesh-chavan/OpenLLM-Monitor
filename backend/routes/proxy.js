const express = require("express");
const router = express.Router();
const proxyController = require("../controllers/proxyController");

/**
 * OpenAI-compatible proxy routes
 * These routes accept standard OpenAI API format and route to the appropriate provider
 *
 * Usage: Point any OpenAI-compatible client to http://<host>:3001/v1
 * Example: curl -X POST http://localhost:3001/v1/chat/completions \
 *   -H "Content-Type: application/json" \
 *   -d '{"model":"llama3","messages":[{"role":"user","content":"Hello"}]}'
 */

/**
 * @route   POST /v1/chat/completions
 * @desc    OpenAI-compatible chat completion (routes to detected provider)
 * @access  Public (no JWT - clients authenticate via provider API keys)
 */
router.post("/chat/completions", (req, res) =>
  proxyController.chatCompletion(req, res)
);

/**
 * @route   GET /v1/models
 * @desc    List available models from all configured providers
 * @access  Public
 */
router.get("/models", (req, res) => proxyController.listModels(req, res));

module.exports = router;
