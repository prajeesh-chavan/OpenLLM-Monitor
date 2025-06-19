import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronUpDownIcon,
  FunnelIcon,
  EyeIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { useLogsStore, useAppStore } from "../store";
import { formatDistanceToNow } from "date-fns";
import { useWebSocket } from "../hooks/useWebSocket";
import notificationService from "../services/notificationService";

const LogTable = ({ onReplay = null }) => {
  const navigate = useNavigate();
  const { logs, loading, error, fetchLogs, filters, setFilters, addLog } =
    useLogsStore();
  const { openLogDetailsModal, notificationSettings } = useAppStore();
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  // Set up WebSocket for real-time log updates
  useWebSocket({
    "new-log": (data) => {
      console.log("📥 New log received via WebSocket:", data);

      const logData = data.data || data;

      // Show enhanced notification
      notificationService.updateSettings(notificationSettings);
      notificationService.showNewRequest(logData);

      // Check for warnings
      if (logData.latency) {
        notificationService.showHighLatency(logData.latency, logData);
      }

      if (logData.cost) {
        notificationService.showHighCost(logData.cost, logData);
      }

      // Show error notification if request failed
      if (logData.status === "error" && logData.error) {
        notificationService.showError(new Error(logData.error), logData);
      } else {
        // Reset error count on successful request
        notificationService.resetErrorCount();
      }

      // Add the new log to the store if addLog function exists
      if (addLog && logData) {
        addLog(logData);
      } else {
        // Fallback: refresh the logs
        fetchLogs();
      }
    },
  });

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Enhanced filtering and search
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.completion?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProvider =
      selectedProvider === "all" || log.provider === selectedProvider;
    const matchesStatus =
      selectedStatus === "all" || log.status === selectedStatus;

    return matchesSearch && matchesProvider && matchesStatus;
  });

  // Get unique providers and statuses for filters
  const uniqueProviders = [...new Set(logs.map((log) => log.provider))];
  const uniqueStatuses = [...new Set(logs.map((log) => log.status))];

  const truncateText = (text, maxLength = 60) => {
    if (!text) return "N/A";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return CheckCircleIconSolid;
      case "error":
        return XCircleIcon;
      case "pending":
        return ClockIcon;
      default:
        return ExclamationCircleIcon;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProviderColor = (provider) => {
    const colors = {
      openai: "bg-green-100 text-green-800 border-green-200",
      ollama: "bg-blue-100 text-blue-800 border-blue-200",
      openrouter: "bg-purple-100 text-purple-800 border-purple-200",
      mistral: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
      colors[provider?.toLowerCase()] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const formatDuration = (ms) => {
    if (!ms && ms !== 0) return "N/A";
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.round(ms)}ms`;
  };

  const formatCost = (cost) => {
    if (!cost || cost.totalCost === 0) return "Free";
    return `$${cost.totalCost.toFixed(4)}`;
  };
  const formatTokens = (tokenUsage) => {
    if (!tokenUsage || !tokenUsage.totalTokens) return "0";
    return tokenUsage.totalTokens.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading logs: {error}</p>
        <button
          onClick={() => fetchLogs()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-100">
      {/* Enhanced Header */}
      <div className="px-3 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Request Logs
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {filteredLogs.length} of {logs.length} requests
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
                  showFilters
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FunnelIcon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                onClick={() => fetchLogs()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        {showFilters && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mobile-input"
                >
                  <option value="all">All Providers</option>
                  {uniqueProviders.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mobile-input"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end sm:col-span-1 lg:col-span-1">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedProvider("all");
                    setSelectedStatus("all");
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Table/Cards Container */}
      <div className="p-3 sm:p-6">
        {" "}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <DocumentTextIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-base sm:text-lg font-medium">
              No logs found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery ||
              selectedProvider !== "all" ||
              selectedStatus !== "all"
                ? "Try adjusting your filters"
                : "Logs will appear here as requests are made"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredLogs.map((log, index) => {
              const StatusIcon = getStatusIcon(log.status);
              return (
                <div
                  key={log._id}
                  className="group relative bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => openLogDetailsModal(log)}
                >
                  {/* Status indicator line */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                      log.status === "success"
                        ? "bg-green-500"
                        : log.status === "error"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  />

                  <div className="p-3 sm:p-4 pl-4 sm:pl-6">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      {/* First Row: Status and Provider */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <StatusIcon
                            className={`h-4 w-4 ${
                              log.status === "success"
                                ? "text-green-500"
                                : log.status === "error"
                                ? "text-red-500"
                                : "text-yellow-500"
                            }`}
                          />
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              log.status
                            )}`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getProviderColor(
                            log.provider
                          )}`}
                        >
                          {log.provider}
                        </span>
                      </div>

                      {/* Second Row: Model and Time */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 font-mono truncate flex-1 mr-2">
                          {log.model}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {/* Third Row: Prompt */}
                      <div className="mb-2">
                        <p className="text-sm text-gray-800 font-medium line-clamp-2">
                          {truncateText(log.prompt, 100)}
                        </p>
                      </div>

                      {/* Fourth Row: Metrics */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-3 w-3" />
                            <span className="font-medium">
                              {formatDuration(log.latency)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CpuChipIcon className="h-3 w-3" />
                            <span className="font-medium">
                              {formatTokens(log.tokenUsage)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CurrencyDollarIcon className="h-3 w-3" />
                            <span className="font-medium">
                              {formatCost(log.cost)}
                            </span>
                          </div>
                        </div>
                        {/* Mobile Action buttons */}
                        <div className="flex items-center space-x-1">
                          {onReplay && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReplay(log);
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                              title="Replay request"
                            >
                              <PlayIcon className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openLogDetailsModal(log);
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View details"
                          >
                            <EyeIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="flex items-center justify-between">
                        {/* Left side - Main info */}
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Status with icon */}
                          <div className="flex items-center space-x-2">
                            <StatusIcon
                              className={`h-5 w-5 ${
                                log.status === "success"
                                  ? "text-green-500"
                                  : log.status === "error"
                                  ? "text-red-500"
                                  : "text-yellow-500"
                              }`}
                            />
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                log.status
                              )}`}
                            >
                              {log.status}
                            </span>
                          </div>

                          {/* Provider and Model */}
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getProviderColor(
                                log.provider
                              )}`}
                            >
                              {log.provider}
                            </span>
                            <span className="text-sm text-gray-600 font-mono">
                              {log.model}
                            </span>
                          </div>

                          {/* Prompt preview */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate font-medium">
                              {truncateText(log.prompt, 80)}
                            </p>
                          </div>
                        </div>

                        {/* Right side - Metrics */}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          {/* Duration */}
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span className="font-medium">
                              {formatDuration(log.latency)}
                            </span>
                          </div>
                          {/* Tokens */}
                          <div className="flex items-center space-x-1">
                            <CpuChipIcon className="h-4 w-4" />
                            <span className="font-medium">
                              {formatTokens(log.tokenUsage)}
                            </span>
                          </div>
                          {/* Cost */}
                          <div className="flex items-center space-x-1">
                            <CurrencyDollarIcon className="h-4 w-4" />
                            <span className="font-medium">
                              {formatCost(log.cost)}
                            </span>
                          </div>
                          {/* Time */}
                          <div className="text-xs text-gray-400 min-w-0">
                            {formatDistanceToNow(new Date(log.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                          {/* Action buttons */}
                          <div className="flex items-center space-x-2">
                            {/* Replay button */}
                            {onReplay && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onReplay(log);
                                }}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors group-hover:bg-purple-100"
                                title="Replay request"
                              >
                                <PlayIcon className="h-4 w-4" />
                              </button>
                            )}

                            {/* View button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openLogDetailsModal(log);
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors group-hover:bg-blue-100"
                              title="View details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Completion preview - shows on hover */}
                      {log.completion && (
                        <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex items-start space-x-2">
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {truncateText(log.completion, 120)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogTable;
