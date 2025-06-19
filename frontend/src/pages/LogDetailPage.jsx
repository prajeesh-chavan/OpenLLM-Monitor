import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlayIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useLogsStore } from "../store";
import { formatDistanceToNow } from "date-fns";

const LogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchLogById } = useLogsStore();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [activeTab, setActiveTab] = useState("request");

  useEffect(() => {
    const loadLog = async () => {
      try {
        const logData = await fetchLogById(id);
        setLog(logData);
      } catch (error) {
        console.error("Failed to load log:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadLog();
    }
  }, [id, fetchLogById]);

  const handleCopyAsCode = async (language = "javascript") => {
    if (!log) return;

    setCopying(true);
    try {
      let code = "";

      // Construct the request object from log data
      const requestBody = {
        prompt: log.prompt,
        model: log.model,
        systemMessage: log.systemMessage,
        ...log.parameters,
      };

      // Determine API endpoint based on provider
      const getEndpoint = (provider) => {
        switch (provider) {
          case "openai":
            return "https://api.openai.com/v1/chat/completions";
          case "ollama":
            return "http://localhost:11434/api/generate";
          case "openrouter":
            return "https://openrouter.ai/api/v1/chat/completions";
          case "mistral":
            return "https://api.mistral.ai/v1/chat/completions";
          default:
            return "API_ENDPOINT";
        }
      };

      const endpoint = getEndpoint(log.provider);

      if (language === "javascript") {
        code = `// ${log.provider.toUpperCase()} API Request
const response = await fetch('${endpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify(${JSON.stringify(requestBody, null, 2)})
});

const data = await response.json();
console.log(data);`;
      } else if (language === "python") {
        code = `import requests
import json

# ${log.provider.toUpperCase()} API Request
response = requests.post(
    '${endpoint}',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json=${JSON.stringify(requestBody, null, 4)}
)

data = response.json()
print(json.dumps(data, indent=2))`;
      } else if (language === "curl") {
        const cmdData = JSON.stringify(requestBody);
        code = `curl -X POST '${endpoint}' -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_API_KEY' -d '${cmdData}'`;
      }

      await navigator.clipboard.writeText(code);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setCopying(false);
    }
  };

  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-400 bg-green-400/20";
      case "error":
        return "text-red-400 bg-red-400/20";
      case "pending":
        return "text-yellow-400 bg-yellow-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getProviderColor = (provider) => {
    const colors = {
      openai: "text-blue-400 bg-blue-400/20",
      ollama: "text-purple-400 bg-purple-400/20",
      openrouter: "text-orange-400 bg-orange-400/20",
      mistral: "text-indigo-400 bg-indigo-400/20",
    };
    return colors[provider] || "text-gray-400 bg-gray-400/20";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Log not found</h3>
        <p className="text-gray-400 mb-4">
          The requested log entry could not be found.
        </p>
        <button
          onClick={() => navigate("/logs")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Logs
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "request", label: "Request", icon: CodeBracketIcon },
    { id: "response", label: "Response", icon: DocumentDuplicateIcon },
    { id: "metrics", label: "Metrics", icon: CpuChipIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/logs")}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Logs
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Request Details
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {log.createdAt && !isNaN(new Date(log.createdAt).getTime())
                ? formatDistanceToNow(new Date(log.createdAt), {
                    addSuffix: true,
                  })
                : "Unknown time"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/replay/${log._id}`)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Replay
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CpuChipIcon className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Provider</div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProviderColor(
                  log.provider
                )}`}
              >
                {log.provider}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <EyeIcon className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Model</div>
              <div className="text-sm font-semibold text-white">
                {log.model}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckIcon className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Status</div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  log.status
                )}`}
              >
                {log.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <ClockIcon className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Duration</div>
              <div className="text-sm font-semibold text-white">
                {log.latency || 0}ms
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl">
        <div className="flex border-b border-gray-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "request" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Request Details
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyAsCode("javascript")}
                    className="inline-flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    {copying ? (
                      <CheckIcon className="h-4 w-4 mr-2 text-green-400" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    )}
                    Copy as JS
                  </button>
                  <button
                    onClick={() => handleCopyAsCode("python")}
                    className="inline-flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Copy as Python
                  </button>
                  <button
                    onClick={() => handleCopyAsCode("curl")}
                    className="inline-flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Copy as cURL
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Endpoint
                  </label>
                  <code className="block w-full p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-sm text-gray-300">
                    {log.provider} API
                  </code>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Request Body
                  </label>
                  <pre className="bg-gray-900/50 border border-gray-700/50 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto max-h-96">
                    {formatJSON({
                      prompt: log.prompt,
                      model: log.model,
                      systemMessage: log.systemMessage,
                      parameters: log.parameters,
                    })}
                  </pre>
                </div>

                {log.headers && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Headers
                    </label>
                    <pre className="bg-gray-900/50 border border-gray-700/50 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto">
                      {formatJSON(log.headers)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "response" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                Response Details
              </h3>

              <div className="space-y-4">
                {log.error ? (
                  <div>
                    <label className="block text-sm font-medium text-red-400 mb-2">
                      Error
                    </label>
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                      <pre className="text-sm text-red-300 whitespace-pre-wrap">
                        {typeof log.error === "string"
                          ? log.error
                          : formatJSON(log.error)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Response Body
                    </label>
                    <pre className="bg-gray-900/50 border border-gray-700/50 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto max-h-96">
                      {log.completion && log.completion.trim()
                        ? formatJSON(log.completion)
                        : "No response content (may be an incomplete or interrupted request)"}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "metrics" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                Performance Metrics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <CpuChipIcon className="h-4 w-4 text-blue-400" />
                    </div>
                    <h4 className="font-medium text-white">Token Usage</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Prompt</span>
                      <span className="text-white font-mono">
                        {(log.tokenUsage?.prompt || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Completion</span>
                      <span className="text-white font-mono">
                        {(log.tokenUsage?.completion || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-2">
                      <span className="text-gray-400 text-sm">Total</span>
                      <span className="text-white font-mono font-semibold">
                        {(log.tokenUsage?.totalTokens || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <CurrencyDollarIcon className="h-4 w-4 text-yellow-400" />
                    </div>
                    <h4 className="font-medium text-white">Cost Breakdown</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Prompt Cost</span>
                      <span className="text-white font-mono">
                        ${(log.cost?.promptCost || 0).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">
                        Completion Cost
                      </span>
                      <span className="text-white font-mono">
                        ${(log.cost?.completionCost || 0).toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-2">
                      <span className="text-gray-400 text-sm">Total Cost</span>
                      <span className="text-white font-mono font-semibold">
                        ${(log.cost?.totalCost || 0).toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <ClockIcon className="h-4 w-4 text-green-400" />
                    </div>
                    <h4 className="font-medium text-white">Performance</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Latency</span>
                      <span className="text-white font-mono">
                        {log.latency || 0}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Retries</span>
                      <span className="text-white font-mono">
                        {log.retryCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Cache Hit</span>
                      <span
                        className={`font-mono ${
                          log.cacheHit ? "text-green-400" : "text-gray-400"
                        }`}
                      >
                        {log.cacheHit ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDetailPage;
