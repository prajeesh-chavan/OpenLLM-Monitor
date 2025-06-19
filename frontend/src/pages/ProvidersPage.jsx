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
} from "@heroicons/react/24/outline";
import ProviderSwitcher from "../components/ProviderSwitcher";
import { useLogsStore } from "../store";
import ApiService from "../services/api";

const ProvidersPage = () => {
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const { logs } = useLogsStore();

  useEffect(() => {
    fetchProviders();
    fetchProviderStats();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get("/providers?testConnections=true");
      if (response.success) {
        setProviders(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      setError("Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderStats = async () => {
    try {
      const response = await ApiService.get("/providers/stats");
      if (response.success && response.data) {
        // Update providers with stats
        setProviders((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            const stats = response.data[key];
            if (stats) {
              updated[key] = {
                ...updated[key],
                requests: stats.totalRequests || 0,
                cost: stats.totalCost || 0,
                latency: stats.avgLatency || null,
                successRate: stats.successRate || 0,
              };
            }
          });
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to fetch provider stats:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case "disconnected":
      case "unknown":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case "error":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "text-green-400 bg-green-400/20";
      case "disconnected":
      case "unknown":
        return "text-yellow-400 bg-yellow-400/20";
      case "error":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const handleTestConnection = async (providerId) => {
    try {
      setProviders((prev) => ({
        ...prev,
        [providerId]: { ...prev[providerId], status: "testing" },
      }));

      const response = await ApiService.post("/providers/test-connection", {
        provider: providerId,
      });

      setProviders((prev) => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          status: response.success ? "connected" : "error",
          latency: response.data?.latency || null,
        },
      }));
    } catch (error) {
      console.error(`Failed to test ${providerId} connection:`, error);
      setProviders((prev) => ({
        ...prev,
        [providerId]: { ...prev[providerId], status: "error" },
      }));
    }
  };

  // Calculate stats from real provider data
  const getProviderStats = () => {
    const providerArray = Object.values(providers);
    const connectedProviders = providerArray.filter(
      (p) => p.status === "connected"
    ).length;
    const totalModels = providerArray.reduce(
      (sum, p) => sum + (p.models?.length || 0),
      0
    );
    const totalRequests = providerArray.reduce(
      (sum, p) => sum + (p.requests || 0),
      0
    );
    const connectedWithLatency = providerArray.filter(
      (p) => p.status === "connected" && p.latency
    );
    const avgLatency =
      connectedWithLatency.length > 0
        ? Math.round(
            connectedWithLatency.reduce((sum, p) => sum + p.latency, 0) /
              connectedWithLatency.length
          )
        : 0;

    return {
      connectedProviders,
      totalModels,
      totalRequests,
      avgLatency,
    };
  };

  const stats = getProviderStats();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Error Loading Providers
        </h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchProviders}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LLM Providers
          </h1>
          <p className="mt-2 text-gray-400">
            Manage and configure your AI model providers
          </p>
        </div>

        <button
          onClick={() => setShowAddProvider(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add Provider
        </button>
      </div>

      {/* Provider Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.connectedProviders}
              </div>
              <div className="text-sm text-gray-400">Connected</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CpuChipIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.totalModels}
              </div>
              <div className="text-sm text-gray-400">Models Available</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BoltIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.totalRequests.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Requests</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <ClockIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats.avgLatency}ms
              </div>
              <div className="text-sm text-gray-400">Avg Latency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(providers).map(([providerId, provider]) => (
          <div
            key={providerId}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-700/50 rounded-lg">
                  <CpuChipIcon className="h-6 w-6 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-gray-400">{provider.baseUrl}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(provider.status)}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    provider.status
                  )}`}
                >
                  {provider.status || "unknown"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-400">Models</div>
                <div className="text-lg font-semibold text-white">
                  {provider.models?.length || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Requests</div>
                <div className="text-lg font-semibold text-white">
                  {(provider.requests || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Latency</div>
                <div className="text-lg font-semibold text-white">
                  {provider.latency ? `${provider.latency}ms` : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Cost</div>
                <div className="text-lg font-semibold text-white">
                  ${(provider.cost || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {provider.models && provider.models.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">
                  Available Models
                </div>
                <div className="flex flex-wrap gap-1">
                  {provider.models.slice(0, 3).map((model) => (
                    <span
                      key={model}
                      className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded-md"
                    >
                      {model}
                    </span>
                  ))}
                  {provider.models.length > 3 && (
                    <span className="px-2 py-1 bg-gray-700/50 text-xs text-gray-400 rounded-md">
                      +{provider.models.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestConnection(providerId)}
                disabled={provider.status === "testing"}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                {provider.status === "testing" ? (
                  <>
                    <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <WifiIcon className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedProvider(provider)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                <CogIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Legacy Provider Switcher */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <CogIcon className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            Provider Configuration
          </h3>
        </div>
        <ProviderSwitcher />
      </div>
    </div>
  );
};

export default ProvidersPage;
