const express = require("express");
const router = express.Router();
const replayController = require("../controllers/replayController");

/**
 * @route   POST /api/replay
 * @desc    Replay a prompt with specified provider and model
 * @access  Public
 */
router.post("/", (req, res) => replayController.replayPrompt(req, res));

/**
 * @route   POST /api/replay/stream
 * @desc    Stream a replay (Server-Sent Events)
 * @access  Public
 */
router.post("/stream", (req, res) => replayController.streamReplay(req, res));

/**
 * @route   POST /api/replay/compare
 * @desc    Compare multiple replays of the same prompt
 * @access  Public
 */
router.post("/compare", (req, res) =>
  replayController.compareReplays(req, res)
);

/**
 * @route   POST /api/replay/estimate
 * @desc    Get cost estimate for a prompt
 * @access  Public
 */
router.post("/estimate", (req, res) =>
  replayController.getCostEstimate(req, res)
);

/**
 * @route   GET /api/replay/models
 * @desc    Get available models for all providers
 * @access  Public
 */
router.get("/models", (req, res) =>
  replayController.getAvailableModels(req, res)
);

/**
 * @route   POST /api/replay/log/:logId
 * @desc    Replay a prompt from an existing log entry
 * @access  Public
 */
router.post("/log/:logId", (req, res) =>
  replayController.replayFromLog(req, res)
);

/**
 * @route   GET /api/replay/connection/:provider
 * @desc    Test connection to a specific provider
 * @access  Public
 */
router.get("/connection/:provider", (req, res) =>
  replayController.testConnection(req, res)
);

module.exports = router;
