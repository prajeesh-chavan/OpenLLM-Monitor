import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  CloudIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useProvidersStore } from "../store";

const Providers = () => {
  const {
    providers,
    loading,
    error,
    fetchProviders,
    updateProvider,
    testConnection,
  } = useProvidersStore();
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [showAnimations, setShowAnimations] = useState(false);

  useEffect(() => {
    fetchProviders();
    // Start animations after a short delay
    setTimeout(() => setShowAnimations(true), 300);
  }, [fetchProviders]);

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
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: result.connected,
          message: result.connected
            ? `Connected (${result.latency}ms)`
            : `Failed: ${result.status}`,
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

  const getStatusInfo = (status) => {
    switch (status) {
      case "online":
        return {
          icon: CheckCircleIcon,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          label: "Online",
        };
      case "warning":
        return {
          icon: ExclamationTriangleIcon,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          label: "Warning",
        };
      case "offline":
        return {
          icon: XCircleIcon,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          label: "Offline",
        };
      default:
        return {
          icon: CloudIcon,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          label: "Unknown",
        };
    }
  };

  const getProviderInfo = (providerId) => {
    const info = {
      openai: {
        name: "OpenAI",
        emoji: "🤖",
        description: "GPT models and embeddings",
        color: "blue",
      },
      ollama: {
        name: "Ollama",
        emoji: "🦙",
        description: "Local LLM inference",
        color: "purple",
      },
      openrouter: {
        name: "OpenRouter",
        emoji: "🔄",
        description: "Multi-provider API gateway",
        color: "emerald",
      },
      mistral: {
        name: "Mistral AI",
        emoji: "🌊",
        description: "European AI models",
        color: "orange",
      },
    };
    return (
      info[providerId] || {
        name: providerId.charAt(0).toUpperCase() + providerId.slice(1),
        emoji: "🔧",
        description: "LLM Provider",
        color: "gray",
      }
    );
  };
  const ProviderCard = ({ providerId, provider, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const providerInfo = getProviderInfo(providerId);
    const statusInfo = getStatusInfo(provider.status);
    const testResult = testResults[providerId];    const colorClasses = {
      blue: {
        iconBg: "bg-blue-50 border-blue-200",
        iconColor: "text-blue-600",
        hoverColor: "#dbeafe", // blue-50
        iconHoverBg: "#eff6ff", // blue-50
      },
      purple: {
        iconBg: "bg-purple-50 border-purple-200",
        iconColor: "text-purple-600", 
        hoverColor: "#f3e8ff", // purple-50
        iconHoverBg: "#faf5ff", // purple-50
      },
      emerald: {
        iconBg: "bg-emerald-50 border-emerald-200",
        iconColor: "text-emerald-600",
        hoverColor: "#ecfdf5", // emerald-50
        iconHoverBg: "#f0fdf4", // emerald-50
      },
      orange: {
        iconBg: "bg-orange-50 border-orange-200", 
        iconColor: "text-orange-600",
        hoverColor: "#fff7ed", // orange-50
        iconHoverBg: "#fffbeb", // orange-50
      },
      gray: {
        iconBg: "bg-gray-50 border-gray-200",
        iconColor: "text-gray-600",
        hoverColor: "#f9fafb", // gray-50
        iconHoverBg: "#f9fafb", // gray-50
      },
    };return (
      <div
        className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 cursor-pointer transition-all duration-500 transform ${
          showAnimations ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        } hover:shadow-md hover:-translate-y-1 hover:scale-[1.02]`}
        style={{
          transitionDelay: `${index * 100}ms`,
          background: showAnimations
            ? isHovered
              ? `linear-gradient(145deg, #ffffff 0%, ${colorClasses[providerInfo.color].hoverColor} 100%)`
              : "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)"
            : "#ffffff",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">            <div
              className={`p-3 ${colorClasses[providerInfo.color].iconBg} border rounded-xl transition-all duration-300 relative overflow-hidden ${
                isHovered ? "scale-110 rotate-3" : ""
              }`}
              style={{
                background: isHovered 
                  ? `linear-gradient(135deg, ${colorClasses[providerInfo.color].iconHoverBg} 0%, ${colorClasses[providerInfo.color].hoverColor} 100%)`
                  : undefined
              }}
            >
              <span className="text-2xl relative z-10">{providerInfo.emoji}</span>
              {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {providerInfo.name}
              </h3>
              <p className="text-sm text-gray-600">{providerInfo.description}</p>
              {provider.baseUrl && (
                <p className="text-xs text-gray-500 mt-1">{provider.baseUrl}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.border}`}>
              <statusInfo.icon className={`h-4 w-4 ${statusInfo.color}`} />
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={provider.enabled ?? true}
                onChange={(e) => handleToggleProvider(providerId, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`mb-4 p-3 rounded-lg border ${
              testResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            } transition-all duration-300`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircleIcon className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">{testResult.message}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTestProvider(providerId)}
            disabled={testingProvider === providerId}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
              testingProvider === providerId
                ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${
                testingProvider === providerId ? "animate-spin" : ""
              }`}
            />
            <span className="text-sm font-medium">
              {testingProvider === providerId ? "Testing..." : "Test Connection"}
            </span>
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm"
            title="Configure Provider"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Configure</span>
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full animate-spin mx-auto shadow-lg"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-600 border-l-purple-500 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 rounded-full animate-pulse shadow-lg"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Loading Providers</h3>
            <p className="text-gray-600">Checking provider configurations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-3 sm:px-6 py-6">
          {/* Breadcrumb Navigation */}
          <div className="mb-4">
            <Link
              to="/dashboard"
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <CloudIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  LLM Providers
                </h1>
                <p className="mt-1 text-gray-600 text-lg">
                  Manage and configure your AI model providers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchProviders()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircleIcon className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Error loading providers</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(providers || {}).map(([providerId, provider], index) => (
            <ProviderCard
              key={providerId}
              providerId={providerId}
              provider={provider}
              index={index}
            />
          ))}
        </div>

        {(!providers || Object.keys(providers).length === 0) && !loading && (
          <div className="text-center py-12">
            <CloudIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers configured</h3>
            <p className="text-gray-600">Add your first LLM provider to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Providers;
