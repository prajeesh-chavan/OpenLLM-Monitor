import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useEvaluationStore } from "../store/evaluationStore";
import EvaluationScoreBadge from "../components/evaluation/EvaluationScoreBadge";
import EvaluationBreakdown from "../components/evaluation/EvaluationBreakdown";

const EvaluationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentEvaluation,
    loading,
    error,
    fetchEvaluationById,
    deleteEvaluation,
    clearCurrent,
  } = useEvaluationStore();

  useEffect(() => {
    if (id) {
      fetchEvaluationById(id);
    }
    return () => clearCurrent();
  }, [id, fetchEvaluationById, clearCurrent]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this evaluation?")) return;
    await deleteEvaluation(id);
    navigate("/evaluations");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading evaluation
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => navigate("/evaluations")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Evaluations
        </button>
      </div>
    );
  }

  if (!currentEvaluation) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Evaluation not found
        </h3>
        <button
          onClick={() => navigate("/evaluations")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Evaluations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/evaluations")}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Evaluation Detail
          </h1>
        </div>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete
        </button>
      </div>

      {/* Score Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <EvaluationScoreBadge
              score={currentEvaluation.score}
              type={currentEvaluation.type}
              size="lg"
              showLabel={true}
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentEvaluation.type.charAt(0).toUpperCase() +
                  currentEvaluation.type.slice(1)}
              </h2>
              <p className="text-sm text-gray-500">
                Evaluated{" "}
                {new Date(currentEvaluation.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              currentEvaluation.passed
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {currentEvaluation.passed ? "PASSED" : "FAILED"}
          </span>
        </div>

        {/* Link to source log */}
        {currentEvaluation.logId && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              to={`/logs/${currentEvaluation.logId}`}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeftIcon className="h-3 w-3 mr-1 rotate-135" />
              View source log
            </Link>
          </div>
        )}
      </div>

      {/* Full Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Score Breakdown
        </h3>
        <EvaluationBreakdown evaluation={currentEvaluation} />
      </div>

      {/* Raw Data */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Raw Data
        </h3>
        <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 overflow-x-auto max-h-96">
          {JSON.stringify(currentEvaluation, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EvaluationDetailPage;
