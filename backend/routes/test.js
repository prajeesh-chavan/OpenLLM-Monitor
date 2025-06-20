const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");

/**
 * @route   POST /api/test/prompt
 * @desc    Test a prompt directly with any provider and model
 * @access  Public
 */
router.post("/prompt", (req, res) => testController.testPrompt(req, res));

/**
 * @route   POST /api/test/compare
 * @desc    Test the same prompt with multiple models and compare results
 * @access  Public
 */
router.post("/compare", (req, res) => testController.compareModels(req, res));

/**
 * @route   GET /api/test/models
 * @desc    Get available models for all configured providers
 * @access  Public
 */
router.get("/models", (req, res) => testController.getAvailableModels(req, res));

/**
 * @route   POST /api/test/estimate
 * @desc    Get cost estimate for a test prompt
 * @access  Public
 */
router.post("/estimate", (req, res) => testController.getCostEstimate(req, res));

/**
 * @route   POST /api/test/validate
 * @desc    Validate test configuration before running
 * @access  Public
 */
router.post("/validate", (req, res) => testController.validateConfig(req, res));

module.exports = router;
