import React from "react";
import DashboardCharts from "../components/DashboardCharts";

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyze your LLM usage patterns and performance metrics
        </p>
      </div>

      <DashboardCharts />
    </div>
  );
};

export default Analytics;
