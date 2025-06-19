import React, { useEffect } from "react";
import StatCards from "../components/StatCards";
import DashboardCharts from "../components/DashboardCharts";
import LogTable from "../components/LogTable";
import { useAppStore, useLogsStore } from "../store";
import { useWebSocket } from "../hooks/useWebSocket";

const Dashboard = () => {
  const { fetchStats } = useAppStore();
  const { logs, fetchLogs } = useLogsStore();

  // Set up WebSocket for real-time updates
  useWebSocket({
    "new-log": () => {
      // Refresh stats when new log is received
      fetchStats();
    },
  });

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [fetchStats, fetchLogs]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your LLM API usage and performance in real-time
        </p>
      </div>

      {/* Stats Cards */}
      <StatCards />

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {logs.length > 0 ? (
            <div className="space-y-4">
              {" "}
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        log.status === "success"
                          ? "bg-green-400"
                          : log.status === "error"
                          ? "bg-red-400"
                          : "bg-yellow-400"
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.provider} • {log.model}
                      </p>{" "}
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>{" "}
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {log.latency
                        ? `${(log.latency / 1000).toFixed(2)}s`
                        : "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {log.tokenUsage?.totalTokens || 0} tokens
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-gray-500">
                Start making LLM requests to see activity here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/logs"
              className="group block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="text-blue-600 text-2xl mb-2">📝</div>
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                View All Logs
              </h4>
              <p className="text-sm text-gray-500">
                Browse and filter your request history
              </p>
            </a>

            <a
              href="/replay"
              className="group block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="text-blue-600 text-2xl mb-2">🔄</div>
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                Replay Requests
              </h4>
              <p className="text-sm text-gray-500">
                Debug and replay previous requests
              </p>
            </a>

            <a
              href="/providers"
              className="group block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="text-blue-600 text-2xl mb-2">⚙️</div>
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                Manage Providers
              </h4>
              <p className="text-sm text-gray-500">
                Configure your LLM providers
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
