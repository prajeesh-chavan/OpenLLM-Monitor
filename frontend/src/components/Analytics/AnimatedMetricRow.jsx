import React, { useState, useEffect } from "react";
import useAnimatedCounter from "./AnimatedCounter";

export default function AnimatedMetricRow({
  label, value, isNumeric, color, delay, isVisible, isExpanded = false,
}) {
  const numericValue = isNumeric ? parseInt(value.toString().replace(/[^0-9]/g, "")) : 0;
  const animatedValue = useAnimatedCounter(numericValue, 1500, delay);
  const [showValue, setShowValue] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isVisible) setTimeout(() => setShowValue(true), delay);
  }, [isVisible, delay]);

  const formatDisplayValue = () => {
    if (!isNumeric) return value;
    const originalStr = value.toString();
    if (originalStr.includes("%")) return `${animatedValue}%`;
    if (originalStr.includes("$")) {
      const decimalPart = originalStr.includes(".") ? originalStr.split(".")[1] : "";
      return `$${animatedValue}${decimalPart ? "." + decimalPart : ""}`;
    }
    if (originalStr.includes("ms")) return `${animatedValue}ms`;
    if (originalStr.includes("/1K")) return `$${(animatedValue / 1000).toFixed(4)}/1K`;
    return animatedValue.toLocaleString();
  };

  return (
    <div
      className={`flex justify-between items-center transition-all duration-500 hover:bg-gray-50 rounded-lg px-2 py-1 ${
        showValue ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`text-gray-600 transition-all duration-300 ${isHovered ? "text-gray-900 font-medium" : ""}`}>{label}</span>
      <span className={`font-mono font-semibold ${color} relative transition-all duration-300 ${isHovered ? "scale-110" : ""}`}>
        {showValue && formatDisplayValue()}
      </span>
    </div>
  );
}
