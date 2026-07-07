import React from "react";
import EvaluationScoreBadge from "./EvaluationScoreBadge";

const EvaluationBreakdown = ({ evaluation }) => {
  if (!evaluation) return null;

  const { score, type, rationale, details, passed } = evaluation;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-gray-900">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </h4>
          <EvaluationScoreBadge score={score} type={type} size="md" />
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            passed
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {passed ? "PASSED" : "FAILED"}
        </span>
      </div>

      {rationale && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">{rationale}</p>
        </div>
      )}

      {details && details.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Dimension Scores
          </h5>
          <div className="space-y-2">
            {details.map((detail, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {detail.dimension
                      ? detail.dimension.replace(/_/g, " ")
                      : `Dimension ${index + 1}`}
                  </span>
                  {detail.rationale && (
                    <span
                      className="text-xs text-gray-400 cursor-help"
                      title={detail.rationale}
                    >
                      ⓘ
                    </span>
                  )}
                </div>
                <EvaluationScoreBadge
                  score={detail.score}
                  size="xs"
                  showLabel={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {evaluation.evaluatorConfig && (
        <div className="text-xs text-gray-400">
          Judge: {evaluation.evaluatorConfig.judgeModel || "default"}
        </div>
      )}
    </div>
  );
};

export default EvaluationBreakdown;
