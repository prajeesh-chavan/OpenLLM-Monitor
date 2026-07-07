import React from "react";

const EvaluationScoreBadge = ({ score, type, size = "sm", showLabel = true }) => {
  const getScoreColor = (score) => {
    if (score >= 0.8) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getScoreIcon = (score) => {
    if (score >= 0.8) return "✓";
    if (score >= 0.6) return "⚠";
    return "✗";
  };

  const sizeClasses = {
    xs: "text-xs px-1.5 py-0.5",
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${getScoreColor(score)} ${sizeClasses[size]}`}
      title={`${type ? type.charAt(0).toUpperCase() + type.slice(1) : "Evaluation"}: ${(score * 100).toFixed(0)}%`}
    >
      <span className="text-xs">{getScoreIcon(score)}</span>
      {showLabel && (
        <span>{(score * 100).toFixed(0)}%</span>
      )}
    </span>
  );
};

export default EvaluationScoreBadge;
