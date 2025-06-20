import React, { useEffect } from "react";
import {
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";

const LogDetailsModal = ({ isOpen, onClose, log }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Listen for close-modals event from keyboard shortcuts
  useEffect(() => {
    const handleCloseModals = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener("close-modals", handleCloseModals);
    return () => {
      window.removeEventListener("close-modals", handleCloseModals);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !log) return null;

  const formatLatency = (ms) => {
    if (!ms && ms !== 0) return "0ms";
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
    if (!tokenUsage) return "N/A";
    return `${tokenUsage.totalTokens || 0} total (${
      tokenUsage.promptTokens || 0
    } prompt + ${tokenUsage.completionTokens || 0} completion)`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return CheckCircleIcon;
      case "error":
        return ExclamationCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getProviderColor = (provider) => {
    switch (provider?.toLowerCase()) {
      case "openai":
        return "text-green-700 bg-green-100 border-green-200";
      case "ollama":
        return "text-blue-700 bg-blue-100 border-blue-200";
      case "mistral":
        return "text-purple-700 bg-purple-100 border-purple-200";
      case "openrouter":
        return "text-orange-700 bg-orange-100 border-orange-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const StatusIcon = getStatusIcon(log.status);
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm"
      onClick={(e) => {
        // Close modal when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden border border-gray-100 transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        {/* Enhanced Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div
                className={`p-2 sm:p-3 rounded-full ${
                  log.status === "success"
                    ? "bg-green-500/20 border border-green-400"
                    : log.status === "error"
                    ? "bg-red-500/20 border border-red-400"
                    : "bg-yellow-500/20 border border-yellow-400"
                }`}
              >
                <StatusIcon
                  className={`h-4 w-4 sm:h-6 sm:w-6 ${
                    log.status === "success"
                      ? "text-green-300"
                      : log.status === "error"
                      ? "text-red-300"
                      : "text-yellow-300"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
                  Request Details
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1">
                  <span className="text-blue-100 text-xs sm:text-sm">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="text-blue-200 text-xs bg-blue-800/30 px-2 py-1 rounded-full mt-1 sm:mt-0 w-fit">
                    ID: {log.requestId?.slice(-8) || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-full flex-shrink-0"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(98vh-120px)] sm:max-h-[calc(95vh-200px)]">
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-8 bg-gray-50/30">
            {/* Enhanced Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              {" "}
              <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 sm:p-3 rounded-lg ${getStatusColor(
                      log.status
                    )} border`}
                  >
                    <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                      log.status
                    )}`}
                  >
                    {log.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mt-2 sm:mt-3">
                  Status
                </p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                  Request execution result
                </p>
              </div>
              <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatLatency(log.latency)}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600 mt-3">
                  Duration
                </p>
                <p className="text-xs text-gray-500 mt-1">Response time</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
                    <CpuChipIcon className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {(log.tokenUsage?.totalTokens || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600 mt-3">Tokens</p>
                <p className="text-xs text-gray-500 mt-1">
                  {log.tokenUsage?.promptTokens || 0} in +{" "}
                  {log.tokenUsage?.completionTokens || 0} out
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-green-50 text-green-600 border border-green-200">
                    <CurrencyDollarIcon className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCost(log.cost)}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600 mt-3">Cost</p>
                <p className="text-xs text-gray-500 mt-1">
                  {log.cost?.totalCost === 0 ? "Local model" : "API usage"}
                </p>
              </div>
            </div>{" "}
            {/* Enhanced Request Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <DocumentDuplicateIcon className="h-5 w-5 text-blue-600" />
                </div>
                Request Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Provider
                    </label>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${getProviderColor(
                          log.provider
                        )}`}
                      >
                        {log.provider}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Model
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border font-mono">
                      {log.model}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Request ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border flex-1 font-mono">
                        {log.requestId}
                      </p>
                      <button
                        onClick={() => copyToClipboard(log.requestId)}
                        className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                        title="Copy to clipboard"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Token Breakdown
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-blue-600">
                            {log.tokenUsage?.promptTokens || 0}
                          </div>
                          <div className="text-xs text-gray-500">Input</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">
                            {log.tokenUsage?.completionTokens || 0}
                          </div>
                          <div className="text-xs text-gray-500">Output</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-purple-600">
                            {log.tokenUsage?.totalTokens || 0}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>{" "}
            </div>
            {/* Enhanced Prompt & Completion */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  <DocumentDuplicateIcon className="h-5 w-5 text-green-600" />
                </div>
                Conversation
              </h3>
              <div className="space-y-6">
                {/* Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {" "}
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      User Prompt
                    </label>
                    <button
                      onClick={() => copyToClipboard(log.prompt)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 max-h-48 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">
                      {log.prompt}
                    </pre>
                  </div>
                </div>

                {/* Completion */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {" "}
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      AI Response
                    </label>
                    <button
                      onClick={() => copyToClipboard(log.completion)}
                      className="text-sm text-green-600 hover:text-green-800 flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 max-h-48 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">
                      {log.completion}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            {/* Additional Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Parameters */}
              {log.parameters && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="p-2 bg-purple-50 rounded-lg mr-3">
                      <CpuChipIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    Parameters
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-900 font-mono">
                      {JSON.stringify(log.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Retry Information */}
              {log.retryAttempts > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                      <ArrowPathIcon className="h-4 w-4 text-yellow-600" />
                    </div>
                    Retry History
                  </h4>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <ArrowPathIcon className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        {log.retryAttempts} retry attempts
                      </span>
                    </div>
                    {log.retryHistory && log.retryHistory.length > 0 && (
                      <div className="space-y-2">
                        {log.retryHistory.map((retry, index) => (
                          <div
                            key={index}
                            className="text-sm text-yellow-700 p-2 bg-yellow-100 rounded border"
                          >
                            <span className="font-medium">
                              Attempt {index + 1}:
                            </span>{" "}
                            {retry.error || "Unknown error"}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Error Details */}
            {log.status === "error" && log.error && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
                <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                  <div className="p-2 bg-red-50 rounded-lg mr-3">
                    <ExclamationCircleIcon className="h-4 w-4 text-red-600" />
                  </div>
                  Error Details
                </h4>
                <div className="bg-red-50 p-5 rounded-lg border border-red-200">
                  <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {log.error}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetailsModal;
