import React, { useState, useEffect } from "react";
import {
  PlayIcon,
  DocumentTextIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store";
import notificationService from "../services/notificationService";
import { ApiService } from "../services/api";

const PromptReplayZone = ({ isOpen, onClose, log = null }) => {
  const [selectedLog, setSelectedLog] = useState(log);
  const { notificationSettings } = useAppStore();
  const [providers, setProviders] = useState({});
  const [availableModels, setAvailableModels] = useState([]);
  const [replayParams, setReplayParams] = useState({
    temperature: 0.7,
    maxTokens: 1000,
    provider: "ollama",
    model: "mistral:latest",
  });
  const [replayResult, setReplayResult] = useState(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

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

  // Update selectedLog when log prop changes
  useEffect(() => {
    if (log) {
      setSelectedLog(log);
    }
  }, [log]);

  // Fetch all providers and their availableModels on mount
  useEffect(() => {
    ApiService.getProviders().then((res) => {
      if (res.success && res.data) {
        setProviders(res.data);
      }
    });
  }, []);

  // Update availableModels when provider changes
  useEffect(() => {
    if (providers[replayParams.provider]) {
      const models = providers[replayParams.provider].availableModels || [];
      setAvailableModels(models);
      // If current model is not in the list, default to the first
      if (!models.includes(replayParams.model)) {
        setReplayParams((prev) => ({ ...prev, model: models[0] || "" }));
      }
    } else {
      setAvailableModels([]);
      setReplayParams((prev) => ({ ...prev, model: "" }));
    }
  }, [replayParams.provider, providers]);

  const handleReplay = async () => {
    if (!selectedLog) return;

    setIsReplaying(true);
    try {
      // Use the correct endpoint for replaying from log
      const response = await fetch(`/api/replay/log/${selectedLog._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: replayParams.provider,
          model: replayParams.model,
          parameters: {
            temperature: replayParams.temperature,
            maxTokens: replayParams.maxTokens, // Changed from max_tokens to maxTokens
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Replay failed");
      }

      // Extract the actual result data from the response
      const replayData = result.data || result;
      setReplayResult(replayData);
      setShowComparison(true);

      // Show replay completion notification
      notificationService.updateSettings(notificationSettings);
      const similarity = calculateSimilarity(
        selectedLog?.completion,
        replayData?.completion
      );
      notificationService.showReplayComplete(similarity);
    } catch (error) {
      console.error("Replay failed:", error);

      // Show error notification with specific handling for memory issues
      notificationService.updateSettings(notificationSettings);

      let errorMessage = error.message || "Replay failed";
      let helpText = "";

      if (
        errorMessage.includes("system memory") ||
        errorMessage.includes("CUDA") ||
        errorMessage.includes("memory")
      ) {
        helpText =
          "Try using a smaller model like phi3:mini or close other applications to free up memory.";
      } else if (errorMessage.includes("model requires more")) {
        helpText =
          "The selected model is too large for available system resources.";
      } else if (errorMessage.includes("runner process has terminated")) {
        helpText =
          "Model loading failed. Try restarting Ollama or using a different model.";
      }

      notificationService.showError(errorMessage, helpText);

      // Set an error state for the replay result to show in UI
      setReplayResult({
        status: "error",
        error: {
          message: errorMessage,
          helpText: helpText,
        },
        provider: replayParams.provider,
        model: replayParams.model,
        isReplay: true,
      });
      setShowComparison(true);
    } finally {
      setIsReplaying(false);
    }
  };

  // Improved similarity: Jaccard index on unique words, punctuation removed
  const calculateSimilarity = (original, replayed) => {
    if (!original || !replayed) return 0;
    // Remove punctuation and lowercase
    const clean = (str) =>
      str
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\\\-_`~()\[\]\"']/g, "")
        .split(/\s+/)
        .filter(Boolean);
    const set1 = new Set(clean(original));
    const set2 = new Set(clean(replayed));
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : Math.round((intersection.size / union.size) * 100);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatLatency = (ms) => {
    if (!ms && ms !== 0) return "0ms";
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.round(ms)}ms`;
  };

  const formatCost = (cost) => {
    if (!cost || cost === 0) return "Free";
    return `$${cost.toFixed(4)}`;
  };

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden border border-gray-100 transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {isReplaying && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-purple-50/90 to-indigo-50/90 backdrop-blur-sm rounded-xl sm:rounded-2xl z-50 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="relative mb-6">
                {/* Outer rotating ring */}
                <div className="w-20 h-20 border-4 border-gray-200 rounded-full mx-auto"></div>
                {/* Main spinning ring */}
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-600 border-r-purple-600 rounded-full animate-spin mx-auto"></div>
                {/* Inner pulsing core */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-pulse shadow-lg"></div>
                </div>
                {/* Orbiting dots */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-20 h-20 relative animate-spin"
                    style={{
                      animationDuration: "3s",
                      animationDirection: "reverse",
                    }}
                  >
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full transform -translate-x-1/2 animate-pulse shadow-md"></div>
                    <div
                      className="absolute bottom-0 left-1/2 w-2 h-2 bg-indigo-400 rounded-full transform -translate-x-1/2 animate-pulse shadow-md"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-gray-900 flex items-center justify-center space-x-2">
                  <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Processing Replay...
                  </span>
                </h4>
                <p className="text-sm text-gray-700 max-w-xs mx-auto font-medium">
                  Running your prompt with{" "}
                  <span className="font-bold text-purple-600">
                    {replayParams.model}
                  </span>{" "}
                  via {replayParams.provider}
                </p>
                <div className="flex items-center justify-center space-x-1 text-xs text-gray-600 mt-4">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce shadow-sm"></div>
                    <div
                      className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce shadow-sm"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce shadow-sm"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="ml-2 font-semibold">
                    Generating response
                  </span>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-300/50">
                  <p className="text-xs text-gray-600 flex items-center justify-center space-x-1 font-medium">
                    <ClockIcon className="h-3 w-3" />
                    <span>
                      This may take up to 2 minutes for complex prompts
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Enhanced Header with Gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="p-2 sm:p-3 rounded-full bg-purple-500/20 border border-purple-400">
                <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
                  Prompt Replay Zone
                </h2>
                <p className="text-purple-100 text-xs sm:text-sm mt-1 truncate">
                  Debug and compare LLM requests with different parameters
                </p>
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
        <div className="overflow-y-auto max-h-[calc(98vh-80px)] sm:max-h-[calc(95vh-200px)]">
          <div className="flex flex-col lg:flex-row bg-gray-50/30">
            {/* Left Panel - Original Log */}
            <div className="flex-1 p-4 sm:p-8 lg:border-r border-gray-200">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 h-full">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg mr-2 sm:mr-3">
                    <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  Original Request
                </h3>{" "}
                {selectedLog ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                            <CpuChipIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <span className="text-base sm:text-lg font-bold text-blue-900">
                            {selectedLog.tokenUsage?.totalTokens || 0}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-blue-700 mt-1 sm:mt-2">
                          Tokens
                        </p>
                        <p className="text-xs text-blue-600 truncate">
                          {selectedLog.tokenUsage?.promptTokens || 0} in +{" "}
                          {selectedLog.tokenUsage?.completionTokens || 0} out
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-green-100">
                        <div className="flex items-center justify-between">
                          <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                            <CurrencyDollarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          </div>
                          <span className="text-base sm:text-lg font-bold text-green-900">
                            {formatCost(selectedLog.cost?.totalCost || 0)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-green-700 mt-1 sm:mt-2">
                          Cost
                        </p>
                        <p className="text-xs text-green-600">
                          Original request
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 sm:p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                            <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                          </div>
                          <span className="text-base sm:text-lg font-bold text-purple-900">
                            {formatLatency(selectedLog.latency)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-purple-700 mt-1 sm:mt-2">
                          Latency
                        </p>
                        <p className="text-xs text-purple-600">Response time</p>
                      </div>

                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 sm:p-4 rounded-xl border border-orange-100">
                        <div className="flex items-center justify-between">
                          <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                            <Cog6ToothIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                          </div>
                          <span className="text-sm font-bold text-orange-900 truncate">
                            {selectedLog.provider}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-orange-700 mt-1 sm:mt-2">
                          Provider
                        </p>
                        <p className="text-xs text-orange-600 truncate">
                          {selectedLog.model}
                        </p>
                      </div>
                    </div>

                    {/* Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-2"></span>
                          Original Prompt
                        </label>
                        <button
                          onClick={() => copyToClipboard(selectedLog.prompt)}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <DocumentDuplicateIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Copy</span>
                        </button>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-100 max-h-32 sm:max-h-48 overflow-y-auto">
                        <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">
                          {selectedLog.prompt ||
                            selectedLog.request?.prompt ||
                            "No prompt available"}
                        </pre>
                      </div>
                    </div>

                    {/* Completion */}
                    <div>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2"></span>
                          Original Response
                        </label>
                        <button
                          onClick={() =>
                            copyToClipboard(selectedLog.completion)
                          }
                          className="text-xs sm:text-sm text-green-600 hover:text-green-800 flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <DocumentDuplicateIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Copy</span>
                        </button>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-green-100 max-h-32 sm:max-h-48 overflow-y-auto">
                        <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">
                          {selectedLog.completion ||
                            selectedLog.response?.completion ||
                            "No completion available"}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <DocumentTextIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-500 mb-2 sm:mb-4 text-sm sm:text-base">
                      No log selected for replay
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Select a log from the table to begin replaying
                    </p>
                  </div>
                )}
              </div>
            </div>{" "}
            {/* Right Panel - Replay Configuration */}
            <div className="flex-1 p-4 sm:p-8">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 h-full">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg mr-2 sm:mr-3">
                    <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  Replay Configuration
                </h3>

                <div className="space-y-4 sm:space-y-6">
                  {" "}
                  {/* Provider Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Provider
                    </label>
                    <select
                      value={replayParams.provider}
                      onChange={(e) =>
                        setReplayParams({
                          ...replayParams,
                          provider: e.target.value,
                          // Reset model to first available for new provider
                          model:
                            providers[e.target.value]?.availableModels?.[0] ||
                            "",
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium text-sm sm:text-base"
                    >
                      {Object.keys(providers).map((prov) => (
                        <option key={prov} value={prov}>
                          {providers[prov].name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Model
                    </label>
                    <select
                      value={replayParams.model}
                      onChange={(e) =>
                        setReplayParams({
                          ...replayParams,
                          model: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium text-sm sm:text-base"
                      disabled={availableModels.length === 0}
                    >
                      {availableModels.length === 0 ? (
                        <option value="" disabled>
                          No models available – check API key
                        </option>
                      ) : (
                        availableModels.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))
                      )}
                    </select>
                  </div>{" "}
                  {/* Temperature */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Temperature: {replayParams.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={replayParams.temperature}
                      onChange={(e) =>
                        setReplayParams({
                          ...replayParams,
                          temperature: parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Conservative</span>
                      <span className="hidden sm:inline">Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>{" "}
                  {/* Max Tokens */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={replayParams.maxTokens}
                      onChange={(e) =>
                        setReplayParams({
                          ...replayParams,
                          maxTokens: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium text-sm sm:text-base"
                      min="1"
                      max="4000"
                    />
                  </div>{" "}
                  {/* Replay Button */}
                  <button
                    onClick={handleReplay}
                    disabled={!selectedLog || isReplaying || !replayParams.model || availableModels.length === 0}
                    className="w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                  >
                    {isReplaying ? (
                      <ArrowsRightLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <PlayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    <span>
                      {isReplaying ? "Replaying..." : "Replay Prompt"}
                    </span>
                  </button>{" "}
                  {/* Replay Result */}
                  {replayResult && (
                    <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                          <div
                            className={`p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 ${
                              replayResult.status === "error"
                                ? "bg-red-50"
                                : "bg-green-50"
                            }`}
                          >
                            {replayResult.status === "error" ? (
                              <ExclamationCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                            ) : (
                              <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            )}
                          </div>
                          {replayResult.status === "error"
                            ? "Replay Failed"
                            : "Replay Result"}
                        </h4>
                        {replayResult.status !== "error" && (
                          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                            <span className="text-gray-500">Similarity:</span>
                            <span
                              className={`font-bold ${
                                calculateSimilarity(
                                  selectedLog?.completion,
                                  replayResult?.completion
                                ) > 70
                                  ? "text-green-600"
                                  : calculateSimilarity(
                                      selectedLog?.completion,
                                      replayResult?.completion
                                    ) > 40
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {calculateSimilarity(
                                selectedLog?.completion,
                                replayResult?.completion
                              )}
                              %
                            </span>
                          </div>
                        )}
                      </div>{" "}
                      {/* Error Display */}
                      {replayResult.status === "error" && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <ExclamationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs sm:text-sm font-semibold text-red-800 mb-1">
                                {replayResult.model ||
                                  replayResult.provider ||
                                  "Replay"}{" "}
                                failed
                              </h5>
                              <p className="text-xs sm:text-sm text-red-700 mb-2 break-words">
                                {replayResult.error?.message ||
                                  "Unknown error occurred"}
                              </p>
                              {replayResult.error?.helpText && (
                                <p className="text-xs text-red-600 bg-red-100 p-2 rounded-lg break-words">
                                  💡 {replayResult.error.helpText}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}{" "}
                      {/* Success Stats */}
                      {replayResult.status !== "error" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-green-100">
                            <div className="flex items-center justify-between">
                              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                                <CpuChipIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                              </div>
                              <span className="text-base sm:text-lg font-bold text-green-900">
                                {replayResult.tokenUsage?.totalTokens || 0}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-green-700 mt-1 sm:mt-2">
                              New Tokens
                            </p>
                            <p className="text-xs text-green-600">
                              {replayResult.tokenUsage?.promptTokens || 0} in +{" "}
                              {replayResult.tokenUsage?.completionTokens || 0}{" "}
                              out
                            </p>
                          </div>

                          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 sm:p-4 rounded-xl border border-purple-100">
                            <div className="flex items-center justify-between">
                              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                                <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                              </div>
                              <span className="text-base sm:text-lg font-bold text-purple-900">
                                {formatLatency(replayResult.latency)}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-purple-700 mt-1 sm:mt-2">
                              New Latency
                            </p>
                            <p className="text-xs text-purple-600">
                              Replay response time
                            </p>
                          </div>
                        </div>
                      )}{" "}
                      {/* New Response */}
                      {replayResult.status !== "error" && (
                        <div>
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <label className="text-sm font-semibold text-gray-700 flex items-center">
                              <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full mr-2"></span>
                              New Response
                            </label>
                            <button
                              onClick={() =>
                                copyToClipboard(replayResult.completion)
                              }
                              className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              <DocumentDuplicateIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Copy</span>
                            </button>
                          </div>
                          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 sm:p-4 rounded-xl border border-purple-100 max-h-32 sm:max-h-48 overflow-y-auto">
                            <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">
                              {replayResult.completion ||
                                "No response available"}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptReplayZone;
