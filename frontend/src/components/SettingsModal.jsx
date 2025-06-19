import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  CogIcon,
  KeyIcon,
  ServerIcon,
  BellIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckIcon,
  SpeakerWaveIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store";
import ApiService from "../services/api";
import notificationService from "../services/notificationService";

const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, setTheme, notificationSettings, updateNotificationSettings } =
    useAppStore();
  const [activeTab, setActiveTab] = useState("general");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResults, setTestResults] = useState({});
  // Settings state
  const [settings, setSettings] = useState({
    theme: theme,
    notifications: notificationSettings,
    api: {
      rateLimit: 100,
      timeout: 30000,
      retryAttempts: 3,
    },
    providers: {},
  });

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get("/providers");
      console.log("Providers API response:", response); // Debug log

      // Backend returns providers as an object, convert to array
      if (response.data && typeof response.data === "object") {
        const providersArray = Object.entries(response.data).map(
          ([key, provider]) => ({
            id: key,
            name: provider.name || key,
            description: `${provider.name} - ${
              provider.features?.join(", ") || "LLM Provider"
            }`,
            status: provider.hasApiKey ? "active" : "inactive",
            baseUrl: provider.baseUrl,
            hasApiKey: provider.hasApiKey,
            models: provider.models || [],
            features: provider.features || [],
            enabled: provider.enabled,
          })
        );
        setProviders(providersArray);
      } else {
        // Fallback: set empty array
        setProviders([]);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      // Set empty array on error
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const testProviderConnection = async (providerId, apiKey = null) => {
    try {
      setTestingProvider(providerId);
      console.log(`Testing connection for ${providerId}...`);

      // Call the backend test endpoint
      const response = await ApiService.post(`/providers/test-connection`, {
        provider: providerId,
        apiKey: apiKey || undefined,
      });

      console.log(`Test result for ${providerId}:`, response);

      // Update test results
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: response.success || response.data?.success,
          message:
            response.message ||
            response.data?.message ||
            "Connection successful",
          timestamp: new Date().toLocaleTimeString(),
        },
      }));

      // Show toast notification
      if (response.success || response.data?.success) {
        console.log(`✅ ${providerId} connection successful`);
      } else {
        console.log(
          `❌ ${providerId} connection failed: ${
            response.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error(`Failed to test ${providerId}:`, error);
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: false,
          message:
            error.response?.data?.message ||
            error.message ||
            "Connection failed",
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      setSaveStatus("saving");

      // Update theme
      setTheme(settings.theme);

      // Update notification settings in store and service
      updateNotificationSettings(settings.notifications);
      notificationService.updateSettings(settings.notifications);

      // Save other settings to backend if needed
      // await ApiService.post('/settings', settings);

      // Show success notification
      notificationService.showSettingsSaved();

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: CogIcon },
    { id: "providers", name: "Providers", icon: ServerIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "appearance", name: "Appearance", icon: PaintBrushIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
    { id: "api", name: "API Settings", icon: DocumentTextIcon },
  ];

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-2xl mx-2 sm:mx-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg sm:rounded-xl">
                <CogIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Settings
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm truncate">
                  Configure your OpenLLM Monitor
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          {/* Mobile Tab Navigation */}
          <div className="sm:hidden border-b border-gray-200">
            <div className="p-4">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex max-h-[calc(100vh-120px)] sm:max-h-[600px]">
            {/* Desktop Sidebar */}
            <div className="hidden sm:block w-64 border-r border-gray-200 p-4 bg-gray-50">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {" "}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      General Settings
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Application Name
                        </label>
                        <input
                          type="text"
                          value="OpenLLM Monitor"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Auto-refresh Interval (seconds)
                        </label>
                        <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500">
                          <option value="5">5 seconds</option>
                          <option value="10">10 seconds</option>
                          <option value="30">30 seconds</option>
                          <option value="60">1 minute</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}{" "}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Appearance
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Theme
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() =>
                              setSettings((prev) => ({
                                ...prev,
                                theme: "light",
                              }))
                            }
                            className={`p-4 rounded-xl border-2 transition-colors ${
                              settings.theme === "light"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <div className="w-full h-16 bg-white border border-gray-200 rounded-lg mb-3"></div>
                            <p className="text-gray-900 font-medium">
                              Light Mode
                            </p>
                            <p className="text-gray-600 text-xs">
                              Current theme
                            </p>
                          </button>

                          <button
                            onClick={() =>
                              setSettings((prev) => ({
                                ...prev,
                                theme: "dark",
                              }))
                            }
                            className={`p-4 rounded-xl border-2 transition-colors ${
                              settings.theme === "dark"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <div className="w-full h-16 bg-gray-900 rounded-lg mb-3"></div>
                            <p className="text-gray-900 font-medium">
                              Dark Mode
                            </p>
                            <p className="text-gray-600 text-xs">Coming soon</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}{" "}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Notification Settings
                    </h3>

                    <div className="space-y-6">
                      {/* Main toggle */}
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-900 font-semibold">
                              Enable Notifications
                            </p>
                            <p className="text-blue-700 text-sm">
                              Master switch for all notifications
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setSettings((prev) => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  enabled: !prev.notifications.enabled,
                                },
                              }))
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.notifications.enabled
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.notifications.enabled
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Notification types */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                            Activity Notifications
                          </h4>

                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-900 font-medium">
                                  New Requests
                                </p>
                                <p className="text-gray-600 text-sm">
                                  Notify when new LLM requests are logged
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    notifications: {
                                      ...prev.notifications,
                                      newRequestNotifications:
                                        !prev.notifications
                                          .newRequestNotifications,
                                    },
                                  }))
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings.notifications.newRequestNotifications
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.notifications
                                      .newRequestNotifications
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-900 font-medium">
                                  Error Notifications
                                </p>
                                <p className="text-gray-600 text-sm">
                                  Get notified about API errors and failures
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    notifications: {
                                      ...prev.notifications,
                                      errorNotifications:
                                        !prev.notifications.errorNotifications,
                                    },
                                  }))
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings.notifications.errorNotifications
                                    ? "bg-red-500"
                                    : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.notifications.errorNotifications
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-900 font-medium">
                                  Warning Notifications
                                </p>
                                <p className="text-gray-600 text-sm">
                                  High latency, cost, and performance warnings
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    notifications: {
                                      ...prev.notifications,
                                      warningNotifications:
                                        !prev.notifications
                                          .warningNotifications,
                                    },
                                  }))
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings.notifications.warningNotifications
                                    ? "bg-yellow-500"
                                    : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.notifications.warningNotifications
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                            Settings & Thresholds
                          </h4>

                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <SpeakerWaveIcon className="h-5 w-5 text-gray-500 mr-2" />
                                <div>
                                  <p className="text-gray-900 font-medium">
                                    Sound Alerts
                                  </p>
                                  <p className="text-gray-600 text-sm">
                                    Play sounds for notifications
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    notifications: {
                                      ...prev.notifications,
                                      soundEnabled:
                                        !prev.notifications.soundEnabled,
                                    },
                                  }))
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings.notifications.soundEnabled
                                    ? "bg-purple-500"
                                    : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.notifications.soundEnabled
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                            {settings.notifications.soundEnabled && (
                              <button
                                onClick={() =>
                                  notificationService.playSound("success")
                                }
                                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                              >
                                🔊 Test Sound
                              </button>
                            )}
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="mb-4">
                              {" "}
                              <label className="flex items-center text-gray-900 font-medium mb-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
                                Error Threshold
                              </label>
                              <p className="text-gray-600 text-sm mb-3">
                                Show error notification after this many
                                consecutive errors
                              </p>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={settings.notifications.errorThreshold}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    notifications: {
                                      ...prev.notifications,
                                      errorThreshold: parseInt(e.target.value),
                                    },
                                  }))
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>1</span>
                                <span className="font-medium text-gray-700">
                                  {settings.notifications.errorThreshold}
                                </span>
                                <span>10</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="mb-4">
                              <label className="block text-gray-900 font-medium mb-2">
                                Latency Threshold (ms)
                              </label>
                              <p className="text-gray-600 text-sm mb-3">
                                Alert when response time exceeds this value
                              </p>
                              <input
                                type="number"
                                min="1000"
                                max="30000"
                                step="500"
                                value={settings.notifications.latencyThreshold}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    notifications: {
                                      ...prev.notifications,
                                      latencyThreshold: parseInt(
                                        e.target.value
                                      ),
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="mb-4">
                              <label className="block text-gray-900 font-medium mb-2">
                                Cost Threshold ($)
                              </label>
                              <p className="text-gray-600 text-sm mb-3">
                                Alert when request cost exceeds this amount
                              </p>
                              <input
                                type="number"
                                min="0.01"
                                max="10"
                                step="0.01"
                                value={settings.notifications.costThreshold}
                                onChange={(e) =>
                                  setSettings((prev) => ({
                                    ...prev,
                                    notifications: {
                                      ...prev.notifications,
                                      costThreshold: parseFloat(e.target.value),
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Test notification button */}
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            notificationService.updateSettings(
                              settings.notifications
                            );
                            notificationService.showNewRequest({
                              provider: "openai",
                              status: "success",
                              latency: 1200,
                              cost: { totalCost: 0.05 },
                            });
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
                        >
                          🧪 Test Notification
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}{" "}
              {activeTab === "providers" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Provider Configuration
                    </h3>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-600 mt-2">
                          Loading providers...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Array.isArray(providers) && providers.length > 0 ? (
                          providers.map((provider) => (
                            <div
                              key={provider.id}
                              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <ServerIcon className="h-4 w-4 text-blue-600" />
                                  </div>{" "}
                                  <div>
                                    <h4 className="text-gray-900 font-medium">
                                      {provider.name}
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                      {provider.description}
                                    </p>
                                  </div>{" "}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      provider.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : provider.id === "ollama"
                                        ? "bg-blue-100 text-blue-700" // Ollama doesn't need API key
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {provider.status === "active"
                                      ? "Configured"
                                      : provider.id === "ollama"
                                      ? "Local"
                                      : "No API Key"}
                                  </div>
                                  {testResults[provider.id] && (
                                    <div
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        testResults[provider.id].success
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {testResults[provider.id].success
                                        ? "✅ Connected"
                                        : "❌ Failed"}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {provider.id === "ollama"
                                    ? "Base URL"
                                    : "API Key"}
                                </label>
                                <div className="flex gap-2">
                                  {" "}
                                  <input
                                    id={`${provider.id}-input`}
                                    type={
                                      provider.id === "ollama"
                                        ? "text"
                                        : "password"
                                    }
                                    placeholder={
                                      provider.id === "ollama"
                                        ? provider.baseUrl ||
                                          "http://localhost:11434"
                                        : "Enter API key..."
                                    }
                                    defaultValue={
                                      provider.id === "ollama"
                                        ? provider.baseUrl
                                        : ""
                                    }
                                    disabled={provider.id === "ollama"}
                                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 ${
                                      provider.id === "ollama"
                                        ? "bg-gray-50 cursor-not-allowed"
                                        : "bg-white"
                                    }`}
                                  />
                                  <button
                                    onClick={() => {
                                      const input = document.getElementById(
                                        `${provider.id}-input`
                                      );
                                      const apiKey =
                                        provider.id === "ollama"
                                          ? null
                                          : input.value;
                                      testProviderConnection(
                                        provider.id,
                                        apiKey
                                      );
                                    }}
                                    disabled={testingProvider === provider.id}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                                    title={
                                      provider.id === "ollama"
                                        ? "Test Ollama connection"
                                        : "Test API key"
                                    }
                                  >
                                    {testingProvider === provider.id ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Testing...
                                      </>
                                    ) : (
                                      "Test"
                                    )}
                                  </button>
                                </div>{" "}
                                {provider.id === "ollama" && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Ollama runs locally and doesn't require an
                                    API key
                                  </p>
                                )}
                                {testResults[provider.id] && (
                                  <div
                                    className={`mt-2 p-2 rounded text-xs ${
                                      testResults[provider.id].success
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                                  >
                                    <div className="font-medium">
                                      {testResults[provider.id].success
                                        ? "Connection Successful"
                                        : "Connection Failed"}
                                    </div>
                                    <div>
                                      {testResults[provider.id].message}
                                    </div>
                                    <div className="text-gray-500 mt-1">
                                      Tested at{" "}
                                      {testResults[provider.id].timestamp}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <ServerIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">
                              No providers configured
                            </p>
                            <p className="text-gray-500 text-sm">
                              Providers will appear here when available
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}{" "}
              {activeTab === "api" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      API Configuration
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rate Limit (requests per minute)
                        </label>
                        <input
                          type="number"
                          value={settings.api.rateLimit}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              api: {
                                ...prev.api,
                                rateLimit: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Request Timeout (milliseconds)
                        </label>
                        <input
                          type="number"
                          value={settings.api.timeout}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              api: {
                                ...prev.api,
                                timeout: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Retry Attempts
                        </label>
                        <select
                          value={settings.api.retryAttempts}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              api: {
                                ...prev.api,
                                retryAttempts: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="5">5</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}{" "}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Security Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <ShieldCheckIcon className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="text-yellow-800 font-medium">
                              Security Notice
                            </p>
                            <p className="text-yellow-700 text-sm">
                              API keys are stored securely and encrypted.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500">
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                          <option value="0">Never</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>{" "}
          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              {saveStatus === "saved" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckIcon className="h-4 w-4" />
                  <span className="text-sm">Settings saved</span>
                </div>
              )}
              {saveStatus === "error" && (
                <span className="text-red-600 text-sm">
                  Failed to save settings
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
