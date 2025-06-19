const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");

/**
 * @route   GET /api/logs
 * @desc    Get all logs with filtering and pagination
 * @access  Public
 */
router.get("/", (req, res) => logController.getLogs(req, res));

/**
 * @route   POST /api/logs
 * @desc    Create a new log entry
 * @access  Public
 */
router.post("/", (req, res) => logController.createLog(req, res));

/**
 * @route   GET /api/logs/stats
 * @desc    Get dashboard statistics
 * @access  Public
 */
router.get("/stats", (req, res) => logController.getStats(req, res));

/**
 * @route   GET /api/logs/models/comparison
 * @desc    Get model performance comparison
 * @access  Public
 */
router.get("/models/comparison", (req, res) =>
  logController.getModelComparison(req, res)
);

/**
 * @route   GET /api/logs/errors/analysis
 * @desc    Get error analysis
 * @access  Public
 */
router.get("/errors/analysis", (req, res) =>
  logController.getErrorAnalysis(req, res)
);

/**
 * @route   GET /api/logs/export
 * @desc    Export logs to CSV
 * @access  Public
 */
router.get("/export", (req, res) => logController.exportLogs(req, res));

/**
 * @route   DELETE /api/logs/bulk
 * @desc    Delete multiple logs
 * @access  Public
 */
router.delete("/bulk", (req, res) => logController.deleteLogs(req, res));

/**
 * @route   GET /api/logs/:id
 * @desc    Get a single log by ID
 * @access  Public
 */
router.get("/:id", (req, res) => logController.getLogById(req, res));

/**
 * @route   PUT /api/logs/:id
 * @desc    Update a log entry
 * @access  Public
 */
router.put("/:id", (req, res) => logController.updateLog(req, res));

/**
 * @route   DELETE /api/logs/:id
 * @desc    Delete a single log
 * @access  Public
 */
router.delete("/:id", (req, res) => logController.deleteLog(req, res));

module.exports = router;
