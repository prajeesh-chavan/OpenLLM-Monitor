const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

/**
 * @route   GET /api/analytics/stats
 * @desc    Get comprehensive analytics statistics
 * @access  Public
 */
router.get("/stats", (req, res) => analyticsController.getStats(req, res));

/**
 * @route   GET /api/analytics/usage
 * @desc    Get usage analytics over time
 * @access  Public
 */
router.get("/usage", (req, res) =>
  analyticsController.getRequestVolume(req, res)
);

/**
 * @route   GET /api/analytics/performance
 * @desc    Get performance analytics
 * @access  Public
 */
router.get("/performance", (req, res) =>
  analyticsController.getModelPerformance(req, res)
);

/**
 * @route   GET /api/analytics/costs
 * @desc    Get cost analytics
 * @access  Public
 */
router.get("/costs", (req, res) =>
  analyticsController.getCostAnalysis(req, res)
);

/**
 * @route   GET /api/analytics/providers
 * @desc    Get provider comparison analytics
 * @access  Public
 */
router.get("/providers", (req, res) =>
  analyticsController.getProviderDistribution(req, res)
);

/**
 * @route   GET /api/analytics/errors
 * @desc    Get error analytics
 * @access  Public
 */
router.get("/errors", (req, res) =>
  analyticsController.getErrorAnalytics(req, res)
);

/**
 * @route   GET /api/analytics/trends
 * @desc    Get trend analysis
 * @access  Public
 */
router.get("/trends", (req, res) => analyticsController.getTrends(req, res));

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data
 * @access  Public
 */
router.get("/export", (req, res) =>
  analyticsController.exportAnalytics(req, res)
);

module.exports = router;
