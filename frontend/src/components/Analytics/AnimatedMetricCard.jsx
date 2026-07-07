import React, { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import AnimatedMetricRow from "./AnimatedMetricRow";

const COLOR_CLASSES = {
  blue: { bg: "bg-blue-50", border: "border-blue-100", icon: "text-blue-600", accent: "text-blue-600", gradient: "from-blue-50 to-blue-100" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600", accent: "text-emerald-600", gradient: "from-emerald-50 to-emerald-100" },
  purple: { bg: "bg-purple-50", border: "border-purple-100", icon: "text-purple-600", accent: "text-purple-600", gradient: "from-purple-50 to-purple-100" },
};

export default function AnimatedMetricCard({
  icon: Icon, title, metrics, insights, color = "blue", delay = 0, isVisible = true, onClick, isExpanded = false, index,
}) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const colors = COLOR_CLASSES[color] || COLOR_CLASSES.blue;

  useEffect(() => {
    if (isVisible && !hasAnimated) setHasAnimated(true);
  }, [isVisible]);

  return (
    <div
      data-card-index={index}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 cursor-pointer transition-all duration-500 transform ${
        hasAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } hover:shadow-md hover:-translate-y-1 hover:scale-[1.02] ${isExpanded ? "ring-2 ring-blue-300 shadow-lg" : ""}`}
      style={{
        transitionDelay: `${delay}ms`,
        background: hasAnimated
          ? isHovered || isExpanded ? `linear-gradient(145deg, #ffffff 0%, ${colors.bg} 100%)` : "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)"
          : "#ffffff",
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${colors.bg} rounded-lg ${colors.border} border relative overflow-hidden transition-all duration-300 ${isHovered ? `bg-gradient-to-r ${colors.gradient} scale-110` : ""}`}>
            <Icon className={`h-5 w-5 ${colors.icon} relative z-10 transition-transform duration-300 ${isHovered ? "rotate-12" : ""}`} />
            {hasAnimated && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4 text-blue-600 animate-bounce" />
          ) : (
            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-all duration-300 ${isHovered ? "text-blue-600 animate-bounce" : ""}`} />
          )}
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((metric, i) => (
          <AnimatedMetricRow
            key={i}
            label={metric.label}
            value={metric.value}
            isNumeric={metric.isNumeric}
            color={metric.accent ? colors.accent : "text-gray-900"}
            delay={delay + i * 200}
            isVisible={hasAnimated}
            isExpanded={isExpanded}
          />
        ))}
        {isExpanded && (
          <div className={`mt-4 pt-4 border-t border-gray-100 space-y-3 transition-all duration-500 ${isExpanded ? "opacity-100 max-h-96" : "opacity-0 max-h-0"}`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Trend</div>
                <div className="flex items-center gap-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">{insights?.trend || "+12.5%"}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Peak Time</div>
                <div className="text-sm font-medium text-gray-900">{insights?.peakTime || "2:00 PM"}</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">AI Insights</div>
              <div className="text-sm text-gray-700">{insights?.suggestion || "Performance is trending upward with consistent usage patterns"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
