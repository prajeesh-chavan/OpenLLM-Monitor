import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlayIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useReplayStore, useLogsStore } from "../store";

const Replay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { replay, loading, error, replayRequest } = useReplayStore();
  const { logs, fetchLogs, fetchLogById } = useLogsStore();
  const [selectedLog, setSelectedLog] = useState(null);
  const [replayResult, setReplayResult] = useState(null);
  const [copying, setCopying] = useState(false);
  useEffect(() => {
    // Fetch logs when component mounts (if not already loaded)
    if (logs.length === 0) {
      fetchLogs();
    }
  }, [logs.length, fetchLogs]);

  useEffect(() => {
    if (id) {
      fetchLogById(id).then(setSelectedLog);
    }
  }, [id, fetchLogById]);

  const handleReplay = async (logId) => {
    try {
      const result = await replayRequest(logId);
      setReplayResult(result);
    } catch (error) {
      console.error("Replay failed:", error);
    }
  };
  const handleCopyAsCode = async (log, language = "javascript") => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Replay</h1>
        <p className="mt-1 text-sm text-gray-500">
          Debug and replay previous LLM requests
        </p>
      </div>

      {!selectedLog ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Select a Request to Replay
            </h3>{" "}
          </div>
          <div className="p-6">
            {" "}
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No logs available for replay</p>
                </div>
              ) : (
                logs.slice(0, 10).map((log) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          log.status === "success"
                            ? "bg-green-400"
                            : log.status === "error"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {log.provider} • {log.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{log.latency}ms</p>{" "}
                      <p className="text-xs text-gray-500">
                        {log.tokenUsage?.totalTokens || 0} tokens
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Request */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Original Request
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to List
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Provider
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLog.provider}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLog.model}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedLog.status === "success"
                          ? "bg-green-100 text-green-800"
                          : selectedLog.status === "error"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedLog.status}
                    </span>
                  </div>{" "}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLog.latency}ms
                    </p>
                  </div>
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Body
                  </label>
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                    {formatJSON({
                      prompt: selectedLog.prompt,
                      systemMessage: selectedLog.systemMessage,
                      parameters: selectedLog.parameters,
                    })}
                  </pre>
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response
                  </label>
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                    {selectedLog.completion && selectedLog.completion.trim()
                      ? formatJSON(selectedLog.completion)
                      : "No response content (may be an incomplete or interrupted request)"}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  {" "}
                  <button
                    onClick={() => handleReplay(selectedLog._id)}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <PlayIcon className="h-4 w-4 mr-2" />
                    )}
                    Replay Request
                  </button>
                  <div className="relative">
                    <button
                      onClick={() =>
                        handleCopyAsCode(selectedLog, "javascript")
                      }
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {copying ? (
                        <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                      )}
                      Copy as Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Replay Result */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Replay Result
              </h3>
            </div>
            <div className="p-6">
              {replayResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          replayResult.status === "success"
                            ? "bg-green-100 text-green-800"
                            : replayResult.status === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {replayResult.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Duration
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {replayResult.duration}ms
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Response
                    </label>
                    <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                      {formatJSON(replayResult.response)}
                    </pre>
                  </div>

                  {replayResult.error && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Error
                      </label>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-800">
                          {replayResult.error}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Comparison
                    </h4>{" "}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">
                          Original Duration:
                        </span>{" "}
                        {selectedLog.latency}ms
                      </div>
                      <div>
                        <span className="text-blue-700">New Duration:</span>{" "}
                        {replayResult.duration || replayResult.latency}ms
                      </div>
                      <div>
                        <span className="text-blue-700">Original Tokens:</span>{" "}
                        {selectedLog.tokenUsage?.totalTokens || 0}
                      </div>
                      <div>
                        <span className="text-blue-700">New Tokens:</span>{" "}
                        {replayResult.tokenUsage?.totalTokens ||
                          replayResult.tokenUsage?.total ||
                          0}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Click "Replay Request" to see the new response
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Replay;
