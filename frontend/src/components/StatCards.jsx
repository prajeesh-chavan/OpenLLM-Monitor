import React from "react";
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store";

const StatCards = ({ stats: propStats }) => {
  const { stats: storeStats, loading, error } = useAppStore();
  // Use prop stats if provided, otherwise use store stats
  const stats = propStats || storeStats;

  // Provide default values to prevent undefined errors
  const safeStats = stats || {
    totalRequests: 0,
    requestsChange: 0,
    avgResponseTime: 0,
    responseTimeChange: 0,
    totalCost: 0,
    costChange: 0,
    activeProviders: 0,
    successRate: 0,
    successRateChange: 0,
    errorRate: 0,
    errorRateChange: 0,
  };

  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return num.toLocaleString();
  };

  const statCards = [
    {
      title: "Total Requests",
      value: formatNumber(safeStats.totalRequests),
      change: safeStats.requestsChange,
      icon: ChartBarIcon,
      color: "blue",
    },
    {
      title: "Avg Response Time",
      value: safeStats.avgResponseTime
        ? `${formatNumber(Math.round(safeStats.avgResponseTime))}ms`
        : "0ms",
      change: safeStats.responseTimeChange,
      icon: ClockIcon,
      color: "green",
    },
    {
      title: "Total Cost",
      value: safeStats.totalCost
        ? `$${(safeStats.totalCost || 0).toFixed(2)}`
        : "$0.00",
      change: safeStats.costChange,
      icon: CurrencyDollarIcon,
      color: "yellow",
    },
    {
      title: "Active Providers",
      value: safeStats.activeProviders,
      change: null,
      icon: ServerIcon,
      color: "purple",
    },
    {
      title: "Success Rate",
      value: safeStats.successRate
        ? `${Math.round(safeStats.successRate)}%`
        : "0%",
      change: safeStats.successRateChange,
      icon: CheckCircleIcon,
      color: "green",
    },
    {
      title: "Error Rate",
      value: safeStats.errorRate ? `${Math.round(safeStats.errorRate)}%` : "0%",
      change: safeStats.errorRateChange,
      icon: ExclamationTriangleIcon,
      color: "red",
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-500 text-blue-600 bg-blue-50",
      green: "bg-green-500 text-green-600 bg-green-50",
      yellow: "bg-yellow-500 text-yellow-600 bg-yellow-50",
      purple: "bg-purple-500 text-purple-600 bg-purple-50",
      red: "bg-red-500 text-red-600 bg-red-50",
    };
    return colorMap[color] || colorMap.blue;
  };

  const formatChange = (change) => {
    if (change === null || change === undefined || change === 0) return null;
    const isPositive = change > 0;
    const prefix = isPositive ? "+" : "";
    const color = isPositive ? "text-green-600" : "text-red-600";
    return (
      <span className={`text-sm font-medium ${color}`}>
        {prefix}
        {(change || 0).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card) => {
        const [iconBg, textColor, cardBg] = getColorClasses(card.color).split(
          " "
        );

        return (
          <div
            key={card.title}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`inline-flex items-center justify-center h-8 w-8 rounded-md ${iconBg}`}
                  >
                    <card.icon
                      className={`h-5 w-5 text-white`}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {card.value}
                      </div>
                      {card.change !== null && (
                        <div className="ml-2 flex items-baseline text-sm font-semibold">
                          {formatChange(card.change)}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${cardBg} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${textColor}`}>
                  {card.title === "Total Requests" && "Last 24 hours"}
                  {card.title === "Avg Response Time" && "Last hour average"}
                  {card.title === "Total Cost" && "This month"}
                  {card.title === "Active Providers" && "Currently online"}
                  {card.title === "Success Rate" && "Last 24 hours"}
                  {card.title === "Error Rate" && "Last 24 hours"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
