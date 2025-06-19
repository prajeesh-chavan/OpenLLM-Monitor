import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlayIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationTriangleIcon,
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
        code = `curl -X POST '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -d '${JSON.stringify(requestBody)}'`;
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
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProviderColor = (provider) => {
    const colors = {
      openai: "bg-blue-100 text-blue-800",
      ollama: "bg-purple-100 text-purple-800",
      openrouter: "bg-orange-100 text-orange-800",
      mistral: "bg-indigo-100 text-indigo-800",
    };
    return colors[provider] || "bg-gray-100 text-gray-800";
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Log not found
        </h3>
        <p className="text-gray-500 mb-4">
          The requested log entry could not be found.
        </p>
        <button
          onClick={() => navigate("/logs")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Logs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/logs")}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Logs
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>{" "}
          <p className="text-sm text-gray-500">
            {log.createdAt && !isNaN(new Date(log.createdAt).getTime())
              ? formatDistanceToNow(new Date(log.createdAt), {
                  addSuffix: true,
                })
              : "Unknown time"}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Provider</div>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProviderColor(
              log.provider
            )}`}
          >
            {log.provider}
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Model</div>
          <div className="text-lg font-semibold text-gray-900">{log.model}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Status</div>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              log.status
            )}`}
          >
            {log.status}
          </span>
        </div>{" "}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Duration</div>
          <div className="text-lg font-semibold text-gray-900">
            {log.latency}ms
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Request</h3>
              <button
                onClick={() => handleCopyAsCode("javascript")}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                {copying ? (
                  <CheckIcon className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                )}
                Copy as JS
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {" "}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endpoint
                </label>
                <code className="block w-full p-2 bg-gray-50 rounded text-sm">
                  {log.provider} API
                </code>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Body
                </label>
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headers
                  </label>
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                    {formatJSON(log.headers)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Response Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Response</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {log.error ? (
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Error
                  </label>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <pre className="text-sm text-red-800 whitespace-pre-wrap">
                      {typeof log.error === "string"
                        ? log.error
                        : formatJSON(log.error)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Body
                  </label>
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                    {log.completion && log.completion.trim()
                      ? formatJSON(log.completion)
                      : "No response content (may be an incomplete or interrupted request)"}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Metrics</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {log.tokenUsage?.prompt || 0}
              </div>
              <div className="text-sm text-gray-500">Prompt Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {log.tokenUsage?.completion || 0}
              </div>
              <div className="text-sm text-gray-500">Completion Tokens</div>
            </div>{" "}
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {log.tokenUsage?.totalTokens || 0}
              </div>
              <div className="text-sm text-gray-500">Total Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600">
                $
                {log.cost?.totalCost ? log.cost.totalCost.toFixed(4) : "0.0000"}
              </div>
              <div className="text-sm text-gray-500">Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {log.retryCount || 0}
              </div>
              <div className="text-sm text-gray-500">Retries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-indigo-600">
                {log.cacheHit ? "Yes" : "No"}
              </div>
              <div className="text-sm text-gray-500">Cache Hit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <div className="space-x-2">
          {" "}
          <button
            onClick={() => navigate(`/replay/${log._id}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Replay Request
          </button>
        </div>

        <div className="space-x-2">
          <button
            onClick={() => handleCopyAsCode("python")}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Copy as Python
          </button>
          <button
            onClick={() => handleCopyAsCode("curl")}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Copy as cURL
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailPage;
