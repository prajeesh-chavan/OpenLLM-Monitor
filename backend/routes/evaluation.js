const express = require("express");
const router = express.Router();
const evaluationController = require("../controllers/evaluationController");
const { authenticate } = require("../middlewares/auth");

router.get("/types", authenticate, (req, res) => evaluationController.getEvaluatorTypes(req, res));
router.get("/stats", authenticate, (req, res) => evaluationController.getEvaluationStats(req, res));
router.get("/trends", authenticate, (req, res) => evaluationController.getEvaluationTrends(req, res));
router.post("/run", authenticate, (req, res) => evaluationController.runEvaluation(req, res));
router.post("/run-batch", authenticate, (req, res) => evaluationController.runBatchEvaluation(req, res));
router.get("/", authenticate, (req, res) => evaluationController.getEvaluations(req, res));
router.get("/:id", authenticate, (req, res) => evaluationController.getEvaluationById(req, res));
router.delete("/:id", authenticate, (req, res) => evaluationController.deleteEvaluation(req, res));

module.exports = router;
