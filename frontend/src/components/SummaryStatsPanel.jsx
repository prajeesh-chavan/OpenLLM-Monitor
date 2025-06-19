import React from "react";
import {
  ClockIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store";

const SummaryStatsPanel = () => {
  const { stats, loading } = useAppStore();

  // Provide default values to prevent undefined errors
  const safeStats = stats || {
    avgResponseTime: 0,
    responseTimeChange: 0,
    totalCost: 0,
    costChange: 0,
    tokenUsage: { total: 0, prompt: 0, completion: 0 },
    retryRate: 0,
    retryRateChange: 0,
    errorCount24h: 0,
    errorCountChange: 0,
    mostActiveUser: null,
    mostActiveUserPercentage: 0,
  };
  const formatLatency = (ms) => {
    if (!ms && ms !== 0) return "0ms";
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.round(ms)}ms`;
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "$0.00";
    return `$${amount.toFixed(2)}`;
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };
  const ChangeIndicator = ({ change, className = "" }) => {
    if (!change && change !== 0) return null;
    if (change === 0) return null;
    const isPositive = change > 0;
    return (
      <div className={`flex items-center ${className}`}>
        {isPositive ? (
          <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />
        ) : (
          <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />
        )}
        <span
          className={`text-sm ${
            isPositive ? "text-red-600" : "text-green-600"
          }`}
        >
          {Math.abs(change)}%
        </span>
      </div>
    );
  };
  const statCards = [
    {
      id: "latency",
      title: "Avg Latency",
      value: formatLatency(safeStats.avgResponseTime || 0),
      subtitle:
        safeStats.responseTimeChange !== 0
          ? `${safeStats.responseTimeChange > 0 ? "↑" : "↓"}${Math.abs(
              safeStats.responseTimeChange
            )}% today`
          : "Stable",
      icon: ClockIcon,
      color: "blue",
      trend: safeStats.responseTimeChange || 0,
    },
    {
      id: "cost",
      title: "Cost Today",
      value: formatCurrency(safeStats.totalCost || 0),
      subtitle: "estimated",
      icon: CurrencyDollarIcon,
      color: "green",
      trend: safeStats.costChange || 0,
    },
    {
      id: "tokens",
      title: "Token Usage",
      value: formatNumber(safeStats.tokenUsage?.total || 0),
      subtitle: `${formatNumber(
        safeStats.tokenUsage?.prompt || 0
      )} prompt / ${formatNumber(
        safeStats.tokenUsage?.completion || 0
      )} completion`,
      icon: CpuChipIcon,
      color: "purple",
    },
    {
      id: "retry",
      title: "Retry Rate",
      value: `${(safeStats.retryRate || 0).toFixed(1)}%`,
      subtitle: "5xx or timeout issues",
      icon: ArrowPathIcon,
      color: "orange",
      trend: safeStats.retryRateChange || 0,
    },
    {
      id: "errors",
      title: "Errors in Last 24h",
      value: (safeStats.errorCount24h || 0).toString(),
      subtitle: "mostly OpenRouter timeouts",
      icon: ExclamationTriangleIcon,
      color: "red",
      trend: safeStats.errorCountChange || 0,
    },
    {
      id: "active-user",
      title: "Most Active User",
      value: safeStats.mostActiveUser || "N/A",
      subtitle: safeStats.mostActiveUserPercentage
        ? `${safeStats.mostActiveUserPercentage}% of traffic`
        : "No data",
      icon: UserIcon,
      color: "indigo",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      red: "bg-red-50 border-red-200 text-red-700",
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    };
    return colors[color] || colors.blue;
  };

  const getIconBgClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600",
    };
    return colors[color] || colors.blue;
  };
  if (loading) {
    return (
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 animate-pulse"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-lg"></div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-5 sm:w-16 sm:h-6 bg-gray-200 rounded mb-1"></div>
              <div className="w-16 h-3 sm:w-24 sm:h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md sm:hover:scale-105 cursor-pointer ${getColorClasses(
                card.color
              )}`}
            >
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div
                    className={`p-1.5 sm:p-2 rounded-lg ${getIconBgClasses(
                      card.color
                    )}`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  {card.trend !== undefined && (
                    <ChangeIndicator change={card.trend} />
                  )}
                </div>

                <div className="space-y-0.5 sm:space-y-1">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                    {card.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
                    {card.title}
                  </div>
                  <div className="text-xs text-gray-500 leading-tight line-clamp-2">
                    {card.subtitle}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SummaryStatsPanel;
