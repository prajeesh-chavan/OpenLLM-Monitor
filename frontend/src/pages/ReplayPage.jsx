import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PromptReplayZone from "../components/PromptReplayZone";
import InteractiveLogTable from "../components/InteractiveLogTable";
import { useLogsStore } from "../store";
import {
  PlayIcon,
  DocumentTextIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const ReplayPage = () => {
  const { id } = useParams();
  const { logs, fetchLogs, fetchLogById } = useLogsStore();
  const [selectedLog, setSelectedLog] = useState(null);
  const [showReplayZone, setShowReplayZone] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (id) {
      fetchLogById(id).then((log) => {
        setSelectedLog(log);
        setShowReplayZone(true);
      });
    }
  }, [id, fetchLogById]);

  useEffect(() => {
    let filtered = [...logs];
    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.provider?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredLogs(filtered);
  }, [logs, searchQuery]);

  const handleReplay = (log) => {
    setSelectedLog(log);
    setShowReplayZone(true);
  };

  const handleViewDetail = (log) => {
    window.location.href = `/logs/${log._id}`;
  };

  const recentLogs = logs.slice(0, 10);
  const successfulLogs = logs
    .filter((log) => log.status === "success")
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PlayIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Prompt Replay
              </h1>
              <p className="text-sm text-gray-500">
                Debug and replay LLM requests with different parameters
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{logs.length}</span> requests
              available
            </div>
            <button
              onClick={() => setShowReplayZone(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <PlayIcon className="h-4 w-4" />
              <span>Open Replay Zone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Requests
                  </h3>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {(searchQuery ? filteredLogs : recentLogs).length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {(searchQuery ? filteredLogs : recentLogs).map((log) => (
                      <div
                        key={log._id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleReplay(log)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                log.status === "success"
                                  ? "bg-green-400"
                                  : log.status === "error"
                                  ? "bg-red-400"
                                  : "bg-yellow-400"
                              }`}
                            ></div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {log.provider}
                                </span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-sm text-gray-600">
                                  {log.model}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(log.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-900">
                                {log.latency ? `${log.latency}ms` : "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {log.tokenUsage?.totalTokens || 0} tokens
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReplay(log);
                              }}
                              className="p-1 text-purple-400 hover:text-purple-600 rounded"
                              title="Replay this request"
                            >
                              <PlayIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {log.prompt && (
                          <div className="mt-3 bg-gray-50 rounded p-3">
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              Prompt Preview
                            </div>
                            <div className="text-sm text-gray-900 font-mono line-clamp-2">
                              {log.prompt.substring(0, 200)}...
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {searchQuery ? "No matching requests" : "No requests yet"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {searchQuery
                        ? "Try adjusting your search terms"
                        : "Start making LLM requests to see them here"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Total Requests
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {logs.length}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Successful</span>
                    <span className="text-lg font-semibold text-green-600">
                      {logs.filter((log) => log.status === "success").length}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Failed</span>
                    <span className="text-lg font-semibold text-red-600">
                      {logs.filter((log) => log.status === "error").length}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Latency</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {logs.length > 0
                        ? `${Math.round(
                            logs.reduce(
                              (acc, log) => acc + (log.latency || 0),
                              0
                            ) / logs.length
                          )}ms`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowReplayZone(true)}
                  className="w-full flex items-center space-x-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <PlayIcon className="h-4 w-4" />
                  <span>Open Replay Zone</span>
                </button>

                <button
                  onClick={() => (window.location.href = "/logs")}
                  className="w-full flex items-center space-x-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>View All Logs</span>
                </button>

                <button
                  onClick={() => (window.location.href = "/analytics")}
                  className="w-full flex items-center space-x-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ClockIcon className="h-4 w-4" />
                  <span>Performance Analytics</span>
                </button>
              </div>
            </div>

            {/* Recent Successful Requests */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Successful Requests
              </h3>
              <div className="space-y-3">
                {successfulLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => handleReplay(log)}
                  >
                    <div>
                      <div className="text-sm font-medium text-green-900">
                        {log.provider} • {log.model}
                      </div>
                      <div className="text-xs text-green-700">
                        {log.latency ? `${log.latency}ms` : "N/A"} •{" "}
                        {log.tokenUsage?.totalTokens || 0} tokens
                      </div>
                    </div>
                    <ArrowPathIcon className="h-4 w-4 text-green-600" />
                  </div>
                ))}
                {successfulLogs.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No successful requests yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Replay Zone Modal */}
      <PromptReplayZone
        isOpen={showReplayZone}
        onClose={() => setShowReplayZone(false)}
        log={selectedLog}
      />
    </div>
  );
};

export default ReplayPage;
