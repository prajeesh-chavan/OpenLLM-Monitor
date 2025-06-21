import React, { useState, useEffect } from "react";
import {
  CpuChipIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useProvidersStore } from "../store";

const ProvidersPage = () => {
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

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const getProviderLogo = (providerId) => {
    const logos = {
      openai: "🤖",
      anthropic: "🧠",
      mistral: "🌪️",
      ollama: "🦙",
      openrouter: "🛣️",
      google: "🔍",
      cohere: "🌊",
    };
    return logos[providerId] || "🔧";
  };

  const getProviderColor = (providerId) => {
    const colors = {
      openai: "from-green-500 to-teal-600",
      anthropic: "from-orange-500 to-red-600",
      mistral: "from-purple-500 to-indigo-600",
      ollama: "from-yellow-500 to-orange-600",
      openrouter: "from-blue-500 to-cyan-600",
      google: "from-red-500 to-pink-600",
      cohere: "from-indigo-500 to-purple-600",
    };
    return colors[providerId] || "from-gray-500 to-gray-600";
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "connected":
      case "active":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "error":
      case "failed":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "testing":
        return (
          <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />
        );
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleTestProvider = async (providerId) => {
    setTestingProvider(providerId);
    try {
      const result = await testConnection(providerId);
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: result.connected,
          message: result.connected
            ? `Connected successfully (${result.latency}ms)`
            : `Connection failed: ${result.status}`,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
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

  const handleToggleProvider = async (providerId, enabled) => {
    try {
      await updateProvider(providerId, { enabled });
    } catch (error) {
      console.error("Failed to toggle provider:", error);
    }
  };

  const handleConfigureProvider = (providerId) => {
    const provider = providers[providerId];
    setSelectedProvider(providerId);
    setConfigForm({
      apiKey: provider?.apiKey || "",
      baseUrl: provider?.baseUrl || "",
    });
    setShowConfigModal(true);
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
    } catch (error) {
      console.error("Failed to save configuration:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading providers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={fetchProviders}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <CpuChipIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  LLM Providers
                </h1>
                <p className="mt-1 text-gray-600 text-lg">
                  Manage and configure your AI model providers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={fetchProviders}
                className="flex items-center gap-2 px-4 py-2 bg-white/50 text-gray-700 rounded-lg hover:bg-white/70 transition-all duration-200 font-medium border border-white/30 shadow-sm backdrop-blur-sm"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>

              <button
                onClick={() => setShowAddProvider(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
              >
                <PlusIcon className="h-4 w-4" />
                Add Provider
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(providers || {}).map(([providerId, provider]) => {
            const testResult = testResults[providerId];
            const isActive = provider.enabled !== false;
            const isTesting = testingProvider === providerId;

            return (
              <div
                key={providerId}
                className={`group relative bg-white/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/30 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                  isActive ? "ring-2 ring-blue-500/20" : "opacity-75"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-3 bg-gradient-to-br ${getProviderColor(
                        providerId
                      )} rounded-lg text-white text-xl shadow-lg`}
                    >
                      {getProviderLogo(providerId)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {provider.name ||
                          providerId.charAt(0).toUpperCase() +
                            providerId.slice(1)}
                      </h3>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {provider.baseUrl || "Default endpoint"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(provider.status)}
                  </div>
                </div>

                {/* Test Result */}
                {testResult && (
                  <div
                    className={`mb-4 p-3 rounded-lg border ${
                      testResult.success
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    <div className="flex items-center">
                      {testResult.success ? (
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 mr-2" />
                      )}
                      <p className="text-sm">{testResult.message}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTestProvider(providerId)}
                      disabled={isTesting}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        isTesting
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      {isTesting ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <BoltIcon className="h-4 w-4" />
                      )}
                      {isTesting ? "Testing..." : "Test"}
                    </button>

                    <button
                      onClick={() => handleConfigureProvider(providerId)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Configure"
                    >
                      <CogIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) =>
                        handleToggleProvider(providerId, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {(!providers || Object.keys(providers).length === 0) && (
          <div className="text-center py-12">
            <CpuChipIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No providers configured
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by adding your first AI provider
            </p>
            <button
              onClick={() => setShowAddProvider(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
            >
              <PlusIcon className="h-4 w-4" />
              Add Your First Provider
            </button>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Configure{" "}
                {providers[selectedProvider]?.name || selectedProvider}
              </h3>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setSelectedProvider(null);
                  setConfigForm({ apiKey: "", baseUrl: "" });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={configForm.apiKey}
                  onChange={(e) =>
                    setConfigForm((prev) => ({
                      ...prev,
                      apiKey: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL (Optional)
                </label>
                <input
                  type="url"
                  value={configForm.baseUrl}
                  onChange={(e) =>
                    setConfigForm((prev) => ({
                      ...prev,
                      baseUrl: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://api.example.com"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setSelectedProvider(null);
                  setConfigForm({ apiKey: "", baseUrl: "" });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfiguration}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors shadow-lg"
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

export default ProvidersPage;
