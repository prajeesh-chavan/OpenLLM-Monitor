import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useEvaluationStore } from "../store/evaluationStore";
import EvaluationScoreBadge from "../components/evaluation/EvaluationScoreBadge";

const timeframes = [
  { label: "24h", value: "24h" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
];

const EvaluationsPage = () => {
  const {
    evaluations,
    stats,
    trends,
    loading,
    pagination,
    filters,
    fetchEvaluations,
    fetchStats,
    fetchTrends,
    fetchEvaluatorTypes,
    evaluatorTypes,
    setFilters,
    clearFilters,
  } = useEvaluationStore();

  const [timeframe, setTimeframe] = useState("7d");
  const [selectedType, setSelectedType] = useState(null);

  const loadData = useCallback(async () => {
    const params = { page: pagination.page, limit: pagination.limit };
    if (selectedType) params.type = selectedType;
    await fetchEvaluations(params);
    await fetchStats({ timeRange: timeframe });
    await fetchTrends({ timeRange: timeframe });
  }, [pagination.page, pagination.limit, selectedType, timeframe, fetchEvaluations, fetchStats, fetchTrends]);

  useEffect(() => {
    fetchEvaluatorTypes();
  }, [fetchEvaluatorTypes]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type === selectedType ? null : type);
    setFilters({ type: type === selectedType ? null : type });
  };

  const getEvaluationsForLog = (logId) => {
    return evaluations.filter((e) => e.logId === logId);
  };

  const summaryCards = [
    {
      label: "Total Evaluations",
      value: stats?.summary?.totalEvaluations || 0,
      icon: ChartBarIcon,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Average Score",
      value: stats?.summary?.overallAvgScore
        ? `${(stats.summary.overallAvgScore * 100).toFixed(1)}%`
        : "N/A",
      icon: ArrowTrendingUpIcon,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Pass Rate",
      value: stats?.summary?.overallPassRate
        ? `${stats.summary.overallPassRate.toFixed(1)}%`
        : "N/A",
      icon: CheckCircleIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Failed",
      value: stats?.byType
        ? stats.byType.reduce((acc, t) => acc + (t.failCount || 0), 0)
        : 0,
      icon: XCircleIcon,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            LLM Output Evaluations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quality scores for your LLM responses across multiple dimensions
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeframe & Type filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {evaluatorTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeFilter(type)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type
                    ? "bg-blue-100 text-blue-700 ring-1 ring-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => handleTimeframeChange(tf.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats by type */}
      {stats?.byType && stats.byType.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Scores by Type
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.byType.map((stat) => (
                <div
                  key={stat.type}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {stat.type.charAt(0).toUpperCase() + stat.type.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {stat.count} samples
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Avg Score</span>
                      <EvaluationScoreBadge score={stat.avgScore} size="xs" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Pass Rate</span>
                      <span className="text-xs font-medium text-gray-700">
                        {stat.passRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          stat.avgScore >= 0.8
                            ? "bg-green-500"
                            : stat.avgScore >= 0.6
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${stat.avgScore * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Evaluations List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Evaluations
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No evaluations yet
            </h3>
            <p className="text-gray-500">
              Evaluations are automatically generated when LLM requests are logged.
              Try sending a test request or triggering evaluation manually.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {evaluations.map((evaluation) => (
              <Link
                key={evaluation._id}
                to={`/evaluations/${evaluation._id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <EvaluationScoreBadge
                      score={evaluation.score}
                      type={evaluation.type}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {evaluation.type.charAt(0).toUpperCase() +
                          evaluation.type.slice(1)}
                      </p>
                      {evaluation.rationale && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-md">
                          {evaluation.rationale}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Log: {evaluation.logId?.slice(-6) || "N/A"}</span>
                    <span>
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => {
                  const store = useEvaluationStore.getState();
                  store.fetchEvaluations({ page: pagination.page - 1, limit: pagination.limit });
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => {
                  const store = useEvaluationStore.getState();
                  store.fetchEvaluations({ page: pagination.page + 1, limit: pagination.limit });
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationsPage;
