const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const logStatsController = require("../controllers/logStatsController");
const { validate, validateQuery } = require("../middlewares/validate");
const {
  createLogSchema,
  updateLogSchema,
  bulkDeleteSchema,
  logQuerySchema,
} = require("../schemas/logSchemas");

router.get("/", validateQuery(logQuerySchema), (req, res) => logController.getLogs(req, res));
router.post("/", validate(createLogSchema), (req, res) => logController.createLog(req, res));
router.get("/stats", (req, res) => logStatsController.getStats(req, res));
router.get("/models/comparison", (req, res) => logStatsController.getModelComparison(req, res));
router.get("/errors/analysis", (req, res) => logStatsController.getErrorAnalysis(req, res));
router.get("/export", (req, res) => logController.exportLogs(req, res));
router.delete("/bulk", validate(bulkDeleteSchema), (req, res) => logController.deleteLogs(req, res));
router.get("/:id", (req, res) => logController.getLogById(req, res));
router.put("/:id", validate(updateLogSchema), (req, res) => logController.updateLog(req, res));
router.delete("/:id", (req, res) => logController.deleteLog(req, res));

module.exports = router;
