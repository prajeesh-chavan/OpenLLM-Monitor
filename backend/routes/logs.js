const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");

/**
 * @route   GET /api/logs
 * @desc    Get all logs with filtering and pagination
 * @access  Private (JWT required)
 */
router.get("/", (req, res) => logController.getLogs(req, res));

/**
 * @route   POST /api/logs
 * @desc    Create a new log entry
 * @access  Private (JWT required)
 */
router.post("/", (req, res) => logController.createLog(req, res));

/**
 * @route   GET /api/logs/stats
 * @desc    Get dashboard statistics
 * @access  Private (JWT required)
 */
router.get("/stats", (req, res) => logController.getStats(req, res));

/**
 * @route   GET /api/logs/models/comparison
 * @desc    Get model performance comparison
 * @access  Private (JWT required)
 */
router.get("/models/comparison", (req, res) =>
  logController.getModelComparison(req, res)
);

/**
 * @route   GET /api/logs/errors/analysis
 * @desc    Get error analysis
 * @access  Private (JWT required)
 */
router.get("/errors/analysis", (req, res) =>
  logController.getErrorAnalysis(req, res)
);

/**
 * @route   GET /api/logs/export
 * @desc    Export logs to CSV
 * @access  Private (JWT required)
 */
router.get("/export", (req, res) => logController.exportLogs(req, res));

/**
 * @route   DELETE /api/logs/bulk
 * @desc    Delete multiple logs
 * @access  Private (JWT required)
 */
router.delete("/bulk", (req, res) => logController.deleteLogs(req, res));

/**
 * @route   GET /api/logs/:id
 * @desc    Get a single log by ID
 * @access  Private (JWT required)
 */
router.get("/:id", (req, res) => logController.getLogById(req, res));

/**
 * @route   PUT /api/logs/:id
 * @desc    Update a log entry
 * @access  Private (JWT required)
 */
router.put("/:id", (req, res) => logController.updateLog(req, res));

/**
 * @route   DELETE /api/logs/:id
 * @desc    Delete a single log
 * @access  Private (JWT required)
 */
router.delete("/:id", (req, res) => logController.deleteLog(req, res));

module.exports = router;
