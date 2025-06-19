import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useProvidersStore } from "../store";

const ProviderSwitcher = () => {
  const {
    providers,
    loading,
    error,
    fetchProviders,
    updateProvider,
    testConnection,
  } = useProvidersStore();
  const [testingProvider, setTestingProvider] = useState(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [configForm, setConfigForm] = useState({
    apiKey: "",
    baseUrl: "",
  });
  const [testingWithKey, setTestingWithKey] = useState(false);
  useEffect(() => {
    console.log("ProviderSwitcher: Fetching providers...");
    fetchProviders();
  }, [fetchProviders]);

  // Debug logging
  useEffect(() => {
    console.log("ProviderSwitcher: Providers data:", providers);
    console.log("ProviderSwitcher: Loading:", loading);
    console.log("ProviderSwitcher: Error:", error);
  }, [providers, loading, error]);

  const handleToggleProvider = async (providerId, enabled) => {
    try {
      await updateProvider(providerId, { enabled });
    } catch (error) {
      console.error("Failed to toggle provider:", error);
    }
  };
  const handleTestProvider = async (providerId) => {
    setTestingProvider(providerId);
    try {
      const result = await testConnection(providerId);
      console.log("Test result for", providerId, ":", result);

      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: result.connected, // Use the actual connection status
          message: result.connected
            ? `Connection successful (${result.latency}ms)`
            : `Connection failed: ${result.status}`,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error("Provider test failed:", error);
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: false,
          message: error.message || "Connection failed",
          timestamp: new Date().toISOString(),
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  };
  const handleConfigureProvider = (providerId) => {
    setSelectedProvider(providerId);
    setConfigForm({
      apiKey: "",
      baseUrl: providers[providerId]?.baseUrl || "",
    });
    setShowConfigModal(true);
  };

  const handleTestWithApiKey = async () => {
    if (!selectedProvider) return;

    setTestingWithKey(true);
    try {
      const result = await testConnection(selectedProvider, {
        apiKey: configForm.apiKey,
        baseUrl: configForm.baseUrl,
      });

      console.log("Test with API key result:", result);

      setTestResults((prev) => ({
        ...prev,
        [selectedProvider]: {
          success: result.connected,
          message: result.connected
            ? `Connection successful with your API key (${result.latency}ms)`
            : `Connection failed: ${result.status}`,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error("Provider test with API key failed:", error);
      setTestResults((prev) => ({
        ...prev,
        [selectedProvider]: {
          success: false,
          message: error.message || "Connection failed",
          timestamp: new Date().toISOString(),
        },
      }));
    } finally {
      setTestingWithKey(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!selectedProvider) return;

    try {
      await updateProvider(selectedProvider, {
        apiKey: configForm.apiKey,
        baseUrl: configForm.baseUrl,
        enabled: providers[selectedProvider]?.enabled ?? true,
      });

      setShowConfigModal(false);
      setSelectedProvider(null);
      setConfigForm({ apiKey: "", baseUrl: "" });

      // Refresh providers to get updated data
      fetchProviders();
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "offline":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "offline":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProviderLogo = (provider) => {
    // In a real app, you'd have actual logos
    const logos = {
      openai: "🤖",
      ollama: "🦙",
      openrouter: "🔄",
      mistral: "🌊",
    };
    return logos[provider] || "🔧";
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        {" "}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">LLM Providers</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                console.log("Manual refresh clicked");
                fetchProviders();
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setShowAddProvider(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Provider
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {Object.entries(providers || {}).map(([providerId, provider]) => (
          <div key={providerId} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getProviderLogo(providerId)}</div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {provider.name ||
                      providerId.charAt(0).toUpperCase() + providerId.slice(1)}
                  </h4>
                  <p className="text-sm text-gray-500">{provider.baseUrl}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Status */}
                <div className="flex items-center space-x-2">
                  {getStatusIcon(provider.status)}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                      provider.status
                    )}`}
                  >
                    {provider.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestProvider(providerId)}
                    disabled={testingProvider === providerId}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    {testingProvider === providerId ? "Testing..." : "Test"}
                  </button>

                  <button
                    onClick={() => handleConfigureProvider(providerId)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                    title="Configure"
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                  </button>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={provider.enabled ?? true}
                      onChange={(e) =>
                        handleToggleProvider(providerId, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Provider Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {provider.stats?.totalRequests || 0}
                </div>
                <div className="text-xs text-gray-500">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {provider.stats?.avgResponseTime
                    ? `${Math.round(provider.stats.avgResponseTime)}ms`
                    : "0ms"}
                </div>
                <div className="text-xs text-gray-500">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {provider.stats?.successRate
                    ? `${Math.round(provider.stats.successRate)}%`
                    : "0%"}
                </div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>

            {/* Test Results */}
            {testResults[providerId] && (
              <div
                className={`mt-4 p-3 rounded-md ${
                  testResults[providerId].success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center">
                  {testResults[providerId].success ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <p
                    className={`text-sm ${
                      testResults[providerId].success
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {testResults[providerId].message}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tested{" "}
                  {new Date(
                    testResults[providerId].timestamp
                  ).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Recent Models */}
            {provider.models && provider.models.length > 0 && (
              <div className="mt-4">
                <h5 className="text-xs font-medium text-gray-500 mb-2">
                  Available Models
                </h5>
                <div className="flex flex-wrap gap-2">
                  {provider.models.slice(0, 5).map((model) => (
                    <span
                      key={model}
                      className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md"
                    >
                      {model}
                    </span>
                  ))}
                  {provider.models.length > 5 && (
                    <span className="inline-flex px-2 py-1 text-xs text-gray-500">
                      +{provider.models.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>{" "}
      {Object.keys(providers || {}).length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No providers configured
          </h3>
          <p className="text-gray-500 mb-4">
            Add your first LLM provider to get started
          </p>
          <div className="text-xs text-gray-400 mb-4">
            Debug: providers = {JSON.stringify(providers)}, loading ={" "}
            {String(loading)}, error = {String(error)}
          </div>
          <button
            onClick={() => setShowAddProvider(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Provider
          </button>
        </div>
      )}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {/* Add Provider Modal - Coming Soon */}
      {showAddProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add Provider
              </h3>
              <button
                onClick={() => setShowAddProvider(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center py-8">
              <div className="text-6xl mb-4">🚧</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Coming Soon!
              </h4>
              <p className="text-gray-600 mb-6">
                Custom provider addition functionality is currently under
                development. For now, you can configure the existing providers
                (OpenAI, Ollama, Mistral, OpenRouter).
              </p>
              <button
                onClick={() => setShowAddProvider(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}{" "}
      {/* Configure Provider Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Configure{" "}
                {selectedProvider
                  ? providers[selectedProvider]?.name || selectedProvider
                  : "Provider"}
              </h3>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setSelectedProvider(null);
                  setConfigForm({ apiKey: "", baseUrl: "" });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* API Key Field */}
              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  API Key
                  {selectedProvider === "ollama" && (
                    <span className="text-gray-500">
                      {" "}
                      (Not required for Ollama)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={configForm.apiKey}
                  onChange={(e) =>
                    setConfigForm((prev) => ({
                      ...prev,
                      apiKey: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    selectedProvider === "ollama"
                      ? "Not required"
                      : "Enter your API key"
                  }
                  disabled={selectedProvider === "ollama"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedProvider === "openai" &&
                    "Get your API key from https://platform.openai.com/api-keys"}
                  {selectedProvider === "openrouter" &&
                    "Get your API key from https://openrouter.ai/keys"}
                  {selectedProvider === "mistral" &&
                    "Get your API key from https://console.mistral.ai/"}
                  {selectedProvider === "ollama" &&
                    "Ollama runs locally and does not require an API key"}
                </p>
              </div>

              {/* Base URL Field */}
              <div>
                <label
                  htmlFor="baseUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Base URL
                </label>
                <input
                  type="url"
                  id="baseUrl"
                  value={configForm.baseUrl}
                  onChange={(e) =>
                    setConfigForm((prev) => ({
                      ...prev,
                      baseUrl: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://api.example.com/v1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave default unless using a custom endpoint
                </p>
              </div>

              {/* Test Connection Button */}
              <div className="pt-2">
                <button
                  onClick={handleTestWithApiKey}
                  disabled={
                    testingWithKey ||
                    (selectedProvider !== "ollama" && !configForm.apiKey.trim())
                  }
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingWithKey ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                      Testing Connection...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </button>
              </div>

              {/* Test Results Display */}
              {testResults[selectedProvider] && (
                <div
                  className={`p-3 rounded-md ${
                    testResults[selectedProvider].success
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center">
                    {testResults[selectedProvider].success ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <p
                      className={`text-sm ${
                        testResults[selectedProvider].success
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {testResults[selectedProvider].message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setSelectedProvider(null);
                  setConfigForm({ apiKey: "", baseUrl: "" });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfiguration}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSwitcher;
