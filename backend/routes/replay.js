const express = require("express");
const router = express.Router();
const replayController = require("../controllers/replayController");
const { validate } = require("../middlewares/validate");
const { replayPromptSchema, compareReplaysSchema, costEstimateSchema } = require("../schemas/replaySchemas");

router.post("/", validate(replayPromptSchema), (req, res) => replayController.replayPrompt(req, res));
router.post("/stream", validate(replayPromptSchema), (req, res) => replayController.streamReplay(req, res));
router.post("/compare", validate(compareReplaysSchema), (req, res) => replayController.compareReplays(req, res));
router.post("/estimate", validate(costEstimateSchema), (req, res) => replayController.getCostEstimate(req, res));
router.get("/models", (req, res) => replayController.getAvailableModels(req, res));
router.post("/log/:logId", (req, res) => replayController.replayFromLog(req, res));
router.get("/connection/:provider", (req, res) => replayController.testConnection(req, res));

module.exports = router;
