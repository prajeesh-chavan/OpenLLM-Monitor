import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAppStore, useLogsStore, useStatsStore } from "../store";

const VisualizationSection = () => {
  const { stats, analytics } = useAppStore();
  const { logs } = useLogsStore();
  const { stats: analyticsStats, loading, fetchStats } = useStatsStore();
  const [timeRange, setTimeRange] = useState("24h");

  useEffect(() => {
    fetchStats(timeRange);
  }, [fetchStats, timeRange]);

  // Generate real-time data from logs
  const generateTimeSeriesData = () => {
    if (!logs || logs.length === 0) {
      return { tokenUsageData: [], latencyData: [], retryData: [] };
    }

    // Group logs by hour for the last 24 hours
    const now = new Date();
    const hours = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      hours.push({
        time: hour.getHours().toString().padStart(2, "0") + ":00",
        timestamp: hour.getTime(),
      });
    }

    const tokenUsageData = hours.map((hour) => {
      const hourLogs = logs.filter((log) => {
        const logTime = new Date(log.createdAt).getTime();
        return (
          logTime >= hour.timestamp && logTime < hour.timestamp + 60 * 60 * 1000
        );
      });

      const totalPrompt = hourLogs.reduce(
        (sum, log) => sum + (log.tokenUsage?.prompt || 0),
        0
      );
      const totalCompletion = hourLogs.reduce(
        (sum, log) => sum + (log.tokenUsage?.completion || 0),
        0
      );

      return {
        time: hour.time,
        prompt: totalPrompt,
        completion: totalCompletion,
        total: totalPrompt + totalCompletion,
      };
    });

    const latencyData = hours.map((hour) => {
      const hourLogs = logs.filter((log) => {
        const logTime = new Date(log.createdAt).getTime();
        return (
          logTime >= hour.timestamp && logTime < hour.timestamp + 60 * 60 * 1000
        );
      });

      const avgLatency =
        hourLogs.length > 0
          ? hourLogs.reduce((sum, log) => sum + (log.latency || 0), 0) /
            hourLogs.length
          : 0;

      return {
        time: hour.time,
        latency: Math.round(avgLatency),
        threshold: 2000,
      };
    });

    const retryData = hours.map((hour) => {
      const hourLogs = logs.filter((log) => {
        const logTime = new Date(log.createdAt).getTime();
        return (
          logTime >= hour.timestamp && logTime < hour.timestamp + 60 * 60 * 1000
        );
      });

      const totalRetries = hourLogs.reduce(
        (sum, log) => sum + (log.retryCount || 0),
        0
      );

      return {
        time: hour.time,
        retries: totalRetries,
      };
    });

    return { tokenUsageData, latencyData, retryData };
  };

  const generateCostBreakdownData = () => {
    if (!logs || logs.length === 0) {
      return [];
    }

    const modelCosts = logs.reduce((acc, log) => {
      const model = log.model || "Unknown";
      const cost = log.cost?.totalCost || 0;

      if (!acc[model]) {
        acc[model] = { requests: 0, cost: 0 };
      }
      acc[model].requests += 1;
      acc[model].cost += cost;
      return acc;
    }, {});

    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff7300",
      "#00C49F",
      "#FFBB28",
    ];

    return Object.entries(modelCosts)
      .map(([model, data], index) => ({
        name: model,
        value: data.requests,
        cost: data.cost,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 models
  };

  const generateModelUsageData = () => {
    if (!logs || logs.length === 0) {
      return [];
    }

    const modelCounts = logs.reduce((acc, log) => {
      const model = log.model || "Unknown";
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {});

    const totalRequests = logs.length;

    return Object.entries(modelCounts)
      .map(([model, requests]) => ({
        model,
        requests,
        percentage: Math.round((requests / totalRequests) * 100),
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5); // Top 5 models
  };

  const { tokenUsageData, latencyData, retryData } = generateTimeSeriesData();
  const costBreakdownData = generateCostBreakdownData();
  const modelUsageData = generateModelUsageData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  return (
    <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Token Usage Over Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
              Token Usage Over Time
            </h3>
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Prompt</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Completion</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer
            width="100%"
            height={200}
            className="sm:!h-[250px]"
          >
            <AreaChart data={analyticsStats.tokenUsage || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                hide={window.innerWidth < 640}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="inputTokens"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="outputTokens"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Latency Trends */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
              Latency Trends
            </h3>
            <div className="text-xs sm:text-sm text-gray-600">Target: 2s</div>
          </div>
          <ResponsiveContainer
            width="100%"
            height={200}
            className="sm:!h-[250px]"
          >
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                hide={window.innerWidth < 640}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: "#F59E0B", strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="threshold"
                stroke="#EF4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Retry Spike Alerts */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
              Retry Spike Alerts
            </h3>
            <div className="text-xs sm:text-sm text-red-600">
              Alert threshold: 5
            </div>
          </div>
          <ResponsiveContainer
            width="100%"
            height={200}
            className="sm:!h-[250px]"
          >
            <BarChart data={retryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                hide={window.innerWidth < 640}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="retries"
                fill={(entry) => (entry >= 5 ? "#EF4444" : "#6366F1")}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
              Cost Breakdown
            </h3>
            <div className="text-xs sm:text-sm text-gray-600">
              Total: $24.55
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center">
            <ResponsiveContainer
              width="100%"
              height={180}
              className="sm:!w-[60%] sm:!h-[200px]"
            >
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  className="sm:!innerRadius-[40] sm:!outerRadius-[80]"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 w-full sm:w-auto space-y-2 mt-4 sm:mt-0">
              {costBreakdownData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs sm:text-sm text-gray-700 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                    ${(item.cost || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Model Usage Stats */}
      <div className="mt-4 sm:mt-6 bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Model Usage Statistics
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {modelUsageData.map((model, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-xs sm:text-sm font-medium text-gray-900 w-16 sm:w-20 truncate">
                  {model.model}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${model.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4 text-xs sm:text-sm">
                <span className="text-gray-600">{model.requests} requests</span>
                <span className="font-medium text-gray-900">
                  {model.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisualizationSection;
