import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import DashboardCharts from "../components/DashboardCharts";
import { SummaryStatsPanel } from "../components";
import { useLogsStore } from "../store";

const Analytics = () => {
  const { logs, fetchLogs, stats } = useLogsStore();
  const [timeframe, setTimeframe] = useState("24h");
  const [selectedMetric, setSelectedMetric] = useState("requests");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchLogs();
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchLogs]);

  const timeframeOptions = [
    { value: "1h", label: "1 Hour" },
    { value: "24h", label: "24 Hours" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
  ];

  const metricOptions = [
    { value: "requests", label: "Requests", icon: ChartBarIcon },
    { value: "tokens", label: "Tokens", icon: CpuChipIcon },
    { value: "cost", label: "Cost", icon: CurrencyDollarIcon },
    { value: "latency", label: "Latency", icon: ClockIcon },
  ];

  const getAdvancedStats = () => {
    if (!logs || logs.length === 0) {
      return {
        avgTokensPerRequest: 0,
        avgCostPerToken: 0,
        successRate: 0,
        avgLatency: 0,
        popularModel: "N/A",
        topProvider: "N/A",
      };
    }

    const totalTokens = logs.reduce(
      (sum, log) => sum + (log.tokenUsage?.totalTokens || 0),
      0
    );
    const totalCost = logs.reduce(
      (sum, log) => sum + (log.cost?.totalCost || 0),
      0
    );
    const totalLatency = logs.reduce((sum, log) => sum + (log.latency || 0), 0);
    const successLogs = logs.filter((log) => log.status === "success");

    // Find most popular model and provider
    const modelCounts = logs.reduce((acc, log) => {
      acc[log.model] = (acc[log.model] || 0) + 1;
      return acc;
    }, {});
    const providerCounts = logs.reduce((acc, log) => {
      acc[log.provider] = (acc[log.provider] || 0) + 1;
      return acc;
    }, {});

    const popularModel = Object.keys(modelCounts).reduce(
      (a, b) => (modelCounts[a] > modelCounts[b] ? a : b),
      "N/A"
    );
    const topProvider = Object.keys(providerCounts).reduce(
      (a, b) => (providerCounts[a] > providerCounts[b] ? a : b),
      "N/A"
    );

    return {
      avgTokensPerRequest:
        logs.length > 0 ? Math.round(totalTokens / logs.length) : 0,
      avgCostPerToken: totalTokens > 0 ? totalCost / totalTokens : 0,
      successRate:
        logs.length > 0
          ? Math.round((successLogs.length / logs.length) * 100)
          : 0,
      avgLatency: logs.length > 0 ? Math.round(totalLatency / logs.length) : 0,
      popularModel,
      topProvider,
    };
  };

  const advancedStats = getAdvancedStats();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="relative mb-6">
            {/* Main spinning ring */}
            <div className="w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full animate-spin mx-auto shadow-lg"></div>
            {/* Secondary spinning ring */}
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-600 border-l-purple-500 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            ></div>
            {/* Inner pulsing core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 rounded-full animate-pulse shadow-lg"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Loading Analytics</h3>
            <p className="text-gray-600">Gathering insights and metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 px-3 sm:px-6 py-6">
        {/* Header with Controls */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Analytics
              </h1>
              <p className="mt-2 text-gray-600">
                Deep insights into your LLM usage patterns and performance metrics
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Timeframe Selector */}
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                  {timeframeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metric Selector */}
              <div className="flex items-center gap-2">
                <BeakerIcon className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                  {metricOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>        {/* Quick Stats Overview */}
        <SummaryStatsPanel />

        {/* Advanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <CpuChipIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Token Efficiency
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Tokens/Request</span>
                <span className="text-gray-900 font-mono font-semibold">
                  {advancedStats.avgTokensPerRequest.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Cost/Token</span>
                <span className="text-gray-900 font-mono font-semibold">
                  ${(advancedStats.avgCostPerToken * 1000).toFixed(4)}/1K
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <span className="text-emerald-600 font-mono font-semibold">
                  {advancedStats.successRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Latency</span>
                <span className="text-gray-900 font-mono font-semibold">
                  {advancedStats.avgLatency}ms
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <BeakerIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Popular Choices
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Top Model</span>
                <span className="text-gray-900 font-mono text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                  {advancedStats.popularModel}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Top Provider</span>
                <span className="text-gray-900 font-mono text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                  {advancedStats.topProvider}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Visual Analytics</h3>
          </div>
          <DashboardCharts />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
