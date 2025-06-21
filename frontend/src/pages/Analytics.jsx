import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowsUpDownIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import DashboardCharts from "../components/DashboardCharts";
import { SummaryStatsPanel } from "../components";
import { useLogsStore } from "../store";

// Custom hook for animated counter
const useAnimatedCounter = (endValue, duration = 2000, startDelay = 0) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef();
  const startTimeRef = useRef();

  const startAnimation = () => {
    if (isAnimating) return;

    setTimeout(() => {
      setIsAnimating(true);
      startTimeRef.current = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const newValue = Math.floor(endValue * easeOutQuart);

        setCurrentValue(newValue);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, startDelay);
  };

  useEffect(() => {
    if (endValue > 0) {
      startAnimation();
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [endValue]);
  return currentValue;
};

// Animated Metric Card Component
const AnimatedMetricCard = ({
  icon: Icon,
  title,
  metrics,
  color = "blue",
  delay = 0,
  isVisible = true,
  onClick,
  isExpanded = false,
  index,
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isVisible]);

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      icon: "text-blue-600",
      accent: "text-blue-600",
      gradient: "from-blue-50 to-blue-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      icon: "text-emerald-600",
      accent: "text-emerald-600",
      gradient: "from-emerald-50 to-emerald-100",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-100",
      icon: "text-purple-600",
      accent: "text-purple-600",
      gradient: "from-purple-50 to-purple-100",
    },
  };
  const colors = colorClasses[color];

  return (
    <div
      data-card-index={index}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 cursor-pointer transition-all duration-500 transform ${
        hasAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] ${
        isExpanded ? "ring-2 ring-blue-300 shadow-lg" : ""
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        background: hasAnimated
          ? isHovered || isExpanded
            ? `linear-gradient(145deg, #ffffff 0%, ${colors.bg} 100%)`
            : "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)"
          : "#ffffff",
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 ${colors.bg} rounded-lg ${
              colors.border
            } border relative overflow-hidden transition-all duration-300 ${
              isHovered ? `bg-gradient-to-r ${colors.gradient} scale-110` : ""
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                colors.icon
              } relative z-10 transition-transform duration-300 ${
                isHovered ? "rotate-12" : ""
              }`}
            />
            {hasAnimated && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Expand/collapse indicator */}
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4 text-blue-600 animate-bounce" />
          ) : (
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-all duration-300 ${
                isHovered ? "text-blue-600 animate-bounce" : ""
              }`}
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <AnimatedMetricRow
            key={index}
            label={metric.label}
            value={metric.value}
            isNumeric={metric.isNumeric}
            color={metric.accent ? colors.accent : "text-gray-900"}
            delay={delay + index * 200}
            isVisible={hasAnimated}
            isExpanded={isExpanded}
          />
        ))}

        {/* Expanded content */}
        {isExpanded && (
          <div
            className={`mt-4 pt-4 border-t border-gray-100 space-y-3 transition-all duration-500 ${
              isExpanded ? "opacity-100 max-h-96" : "opacity-0 max-h-0"
            }`}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Trend</div>
                <div className="flex items-center gap-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">
                    +12.5%
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Peak Time</div>
                <div className="text-sm font-medium text-gray-900">2:00 PM</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Insights</div>
              <div className="text-sm text-gray-700">
                Performance is trending upward with consistent usage patterns
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Animated Metric Row Component
const AnimatedMetricRow = ({
  label,
  value,
  isNumeric,
  color,
  delay,
  isVisible,
  isExpanded = false,
}) => {
  const numericValue = isNumeric
    ? parseInt(value.toString().replace(/[^0-9]/g, ""))
    : 0;
  const animatedValue = useAnimatedCounter(numericValue, 1500, delay);
  const [showValue, setShowValue] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setShowValue(true), delay);
    }
  }, [isVisible, delay]);

  const formatDisplayValue = () => {
    if (!isNumeric) return value;

    const originalStr = value.toString();
    if (originalStr.includes("%")) {
      return `${animatedValue}%`;
    } else if (originalStr.includes("$")) {
      const decimalPart = originalStr.includes(".")
        ? originalStr.split(".")[1]
        : "";
      return `$${animatedValue}${decimalPart ? "." + decimalPart : ""}`;
    } else if (originalStr.includes("ms")) {
      return `${animatedValue}ms`;
    } else if (originalStr.includes("/1K")) {
      return `$${(animatedValue / 1000).toFixed(4)}/1K`;
    } else {
      return animatedValue.toLocaleString();
    }
  };

  return (
    <div
      className={`flex justify-between items-center transition-all duration-500 hover:bg-gray-50 rounded-lg px-2 py-1 ${
        showValue ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`text-gray-600 transition-all duration-300 ${
          isHovered ? "text-gray-900 font-medium" : ""
        }`}
      >
        {label}
      </span>
      <span
        className={`font-mono font-semibold ${color} relative transition-all duration-300 ${
          isHovered ? "scale-110" : ""
        }`}
      >
        {showValue && formatDisplayValue()}
        {/* {isNumeric && showValue && (
          <div className={`absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full transition-all duration-300 ${
            isHovered ? "animate-ping scale-125" : "animate-ping opacity-75"
          }`}></div>
        )} */}
      </span>
    </div>
  );
};

const Analytics = () => {
  const { logs, fetchLogs, stats } = useLogsStore();
  const [timeframe, setTimeframe] = useState("24h");
  const [selectedMetric, setSelectedMetric] = useState("requests");
  const [loading, setLoading] = useState(true);
  const [showAnimations, setShowAnimations] = useState(false);
  // New interactive states
  const [expandedCard, setExpandedCard] = useState(null);
  const [showToast, setShowToast] = useState(null);

  // Interactive functions (defined early to avoid hoisting issues)
  const showToastMessage = (message) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleCardClick = (cardIndex) => {
    const wasExpanded = expandedCard === cardIndex;
    setExpandedCard(wasExpanded ? null : cardIndex);
    showToastMessage(wasExpanded ? "Card collapsed" : "Card expanded");

    // Add visual feedback with a subtle flash
    if (!wasExpanded) {
      const cardElement = document.querySelector(
        `[data-card-index="${cardIndex}"]`
      );
      if (cardElement) {
        cardElement.style.transform = "scale(1.05)";
        setTimeout(() => {
          cardElement.style.transform = "";
        }, 200);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchLogs();
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setTimeout(() => {
          // Analytics pages typically need more time to process complex data
          setLoading(false);
          // Start animations after a short delay
          setTimeout(() => setShowAnimations(true), 300);
        }, 1500); // Increased for analytics processing feel
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

  // Create metric cards data
  const metricCards = [
    {
      icon: CpuChipIcon,
      title: "Token Efficiency",
      color: "blue",
      delay: 100,
      metrics: [
        {
          label: "Avg Tokens/Request",
          value: advancedStats.avgTokensPerRequest,
          isNumeric: true,
        },
        {
          label: "Avg Cost/Token",
          value: `$${(advancedStats.avgCostPerToken * 1000).toFixed(4)}/1K`,
          isNumeric: true,
        },
      ],
    },
    {
      icon: ArrowTrendingUpIcon,
      title: "Performance",
      color: "emerald",
      delay: 300,
      metrics: [
        {
          label: "Success Rate",
          value: `${advancedStats.successRate}%`,
          isNumeric: true,
          accent: true,
        },
        {
          label: "Avg Latency",
          value: `${advancedStats.avgLatency}ms`,
          isNumeric: true,
        },
      ],
    },
    {
      icon: BeakerIcon,
      title: "Popular Choices",
      color: "purple",
      delay: 500,
      metrics: [
        {
          label: "Top Model",
          value: advancedStats.popularModel,
          isNumeric: false,
        },
        {
          label: "Top Provider",
          value: advancedStats.topProvider,
          isNumeric: false,
        },
      ],
    },
  ];

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
            <h3 className="text-lg font-semibold text-gray-900">
              Loading Analytics
            </h3>
            <p className="text-gray-600">Gathering insights and metrics...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {" "}
      {/* Analytics Header Bar - Full Width */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-3 sm:px-6 py-6">
          {/* Breadcrumb Navigation */}
          <div className="mb-4">
            <Link
              to="/dashboard"
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="mt-1 text-gray-600 text-lg">
                  Comprehensive insights into your LLM usage patterns and
                  performance metrics
                </p>
              </div>
            </div>{" "}
            <div className="flex items-center gap-4">
              {/* Timeframe Selector */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-transparent border-none text-sm text-gray-900 focus:ring-0 focus:outline-none font-medium"
                >
                  {timeframeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metric Selector */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <BeakerIcon className="h-5 w-5 text-gray-500" />
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="bg-transparent border-none text-sm text-gray-900 focus:ring-0 focus:outline-none font-medium"
                >
                  {metricOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Analytics Content */}
      <div className="px-3 sm:px-6 pb-6">
        <div className="space-y-6">
          {" "}
          {/* Quick Stats Overview */}
          <div
            className={`transition-all duration-500 transform ${
              showAnimations
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <SummaryStatsPanel />
          </div>{" "}
          {/* Advanced Metrics Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500">
              {metricCards.map((card, index) => (
                <AnimatedMetricCard
                  key={`${card.title}-${index}`}
                  icon={card.icon}
                  title={card.title}
                  color={card.color}
                  delay={card.delay}
                  isVisible={showAnimations}
                  metrics={card.metrics}
                  onClick={() => handleCardClick(index)}
                  isExpanded={expandedCard === index}
                  index={index}
                />
              ))}
            </div>
          </div>{" "}
          {/* Charts Section */}
          <div
            className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-700 transform ${
              showAnimations
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-8 opacity-0 scale-95"
            }`}
            style={{ transitionDelay: "700ms" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-2 bg-blue-50 rounded-lg border border-blue-100 relative overflow-hidden ${
                  showAnimations ? "animate-pulse" : ""
                }`}
              >
                <ChartBarIcon className="h-5 w-5 text-blue-600 relative z-10" />
                {showAnimations && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent animate-pulse"></div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                Visual Analytics
                {showAnimations && (
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                )}
              </h3>
            </div>
            <div
              className={`transition-all duration-500 ${
                showAnimations ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: "900ms" }}
            >
              <DashboardCharts />
            </div>{" "}
          </div>
        </div>
      </div>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        {" "}
        {/* Quick Insights Button */}
        <button
          onClick={() => {
            showToastMessage("Quick insights feature coming soon!");
            // Add a little animation feedback
            const button = document.querySelector('[title="Quick Insights"]');
            if (button) {
              button.style.transform = "scale(1.1) rotate(5deg)";
              setTimeout(() => {
                button.style.transform = "";
              }, 200);
            }
          }}
          className={`p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group ${
            showAnimations
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "1400ms" }}
          title="Quick Insights"
        >
          <ChartPieIcon className="h-5 w-5 text-white group-hover:animate-spin transition-transform" />
        </button>{" "}
      </div>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 transform transition-all duration-300 animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">
                {showToast}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
