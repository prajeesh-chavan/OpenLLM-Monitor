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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="mt-2 text-gray-400">
            Deep insights into your LLM usage patterns and performance metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <BeakerIcon className="h-4 w-4 text-gray-400" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Quick Stats Overview */}
      <SummaryStatsPanel />

      {/* Advanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CpuChipIcon className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Token Efficiency
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Tokens/Request</span>
              <span className="text-white font-mono">
                {advancedStats.avgTokensPerRequest.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Cost/Token</span>
              <span className="text-white font-mono">
                ${(advancedStats.avgCostPerToken * 1000).toFixed(4)}/1K
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Success Rate</span>
              <span className="text-green-400 font-mono">
                {advancedStats.successRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Latency</span>
              <span className="text-white font-mono">
                {advancedStats.avgLatency}ms
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BeakerIcon className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Popular Choices
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Top Model</span>
              <span className="text-white font-mono text-xs bg-gray-700 px-2 py-1 rounded">
                {advancedStats.popularModel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Top Provider</span>
              <span className="text-white font-mono text-xs bg-gray-700 px-2 py-1 rounded">
                {advancedStats.topProvider}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <ChartBarIcon className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Visual Analytics</h3>
        </div>
        <DashboardCharts />
      </div>
    </div>
  );
};

export default Analytics;
