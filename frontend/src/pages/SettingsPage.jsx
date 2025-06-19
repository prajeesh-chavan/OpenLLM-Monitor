import React, { useState, useEffect } from "react";
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CircleStackIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ServerIcon,
  MoonIcon,
  SunIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      errorThreshold: 5,
      costAlerts: true,
      costThreshold: 10,
      retryAlerts: true,
      latencyAlerts: true,
      latencyThreshold: 3000,
    },
    monitoring: {
      logRetention: 30,
      realTimeUpdates: true,
      detailedLogging: true,
      anonymizeData: false,
      autoRefresh: true,
      refreshInterval: 30,
    },
    security: {
      apiKeyMasking: true,
      requestSanitization: true,
      auditLogging: true,
      encryptLogs: false,
    },
    performance: {
      cacheEnabled: true,
      cacheTTL: 300,
      rateLimitWarning: true,
      compressionEnabled: true,
      batchSize: 100,
    },
    ui: {
      darkMode: false,
      compactView: false,
      showKeyboardShortcuts: true,
      liveFeed: true,
    },
    providers: {
      openai: { enabled: true, priority: 1 },
      ollama: { enabled: true, priority: 2 },
      openrouter: { enabled: false, priority: 3 },
      mistral: { enabled: false, priority: 4 },
    },
  });

  const [activeTab, setActiveTab] = useState("notifications");
  const [saved, setSaved] = useState(false);
  const [loading, setSaving] = useState(false);

  const tabs = [
    {
      id: "notifications",
      name: "Notifications",
      icon: BellIcon,
      color: "blue",
    },
    {
      id: "monitoring",
      name: "Monitoring",
      icon: ChartBarIcon,
      color: "green",
    },
    { id: "security", name: "Security", icon: ShieldCheckIcon, color: "red" },
    {
      id: "performance",
      name: "Performance",
      icon: ServerIcon,
      color: "purple",
    },
    { id: "ui", name: "Interface", icon: MoonIcon, color: "indigo" },
    { id: "providers", name: "Providers", icon: GlobeAltIcon, color: "yellow" },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      localStorage.setItem(
        "openllm-monitor-settings",
        JSON.stringify(settings)
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      // Reset to defaults
      setSettings({
        notifications: {
          emailAlerts: true,
          errorThreshold: 5,
          costAlerts: true,
          costThreshold: 10,
          retryAlerts: true,
          latencyAlerts: true,
          latencyThreshold: 3000,
        },
        monitoring: {
          logRetention: 30,
          realTimeUpdates: true,
          detailedLogging: true,
          anonymizeData: false,
          autoRefresh: true,
          refreshInterval: 30,
        },
        security: {
          apiKeyMasking: true,
          requestSanitization: true,
          auditLogging: true,
          encryptLogs: false,
        },
        performance: {
          cacheEnabled: true,
          cacheTTL: 300,
          rateLimitWarning: true,
          compressionEnabled: true,
          batchSize: 100,
        },
        ui: {
          darkMode: false,
          compactView: false,
          showKeyboardShortcuts: true,
          liveFeed: true,
        },
        providers: {
          openai: { enabled: true, priority: 1 },
          ollama: { enabled: true, priority: 2 },
          openrouter: { enabled: false, priority: 3 },
          mistral: { enabled: false, priority: 4 },
        },
      });
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const getTabColor = (color) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50 border-blue-200",
      green: "text-green-600 bg-green-50 border-green-200",
      red: "text-red-600 bg-red-50 border-red-200",
      purple: "text-purple-600 bg-purple-50 border-purple-200",
      indigo: "text-indigo-600 bg-indigo-50 border-indigo-200",
      yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
    };
    return colors[color] || colors.blue;
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem("openllm-monitor-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const renderSettingsContent = () => {
    switch (activeTab) {
      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Alert Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notifications.emailAlerts}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "emailAlerts",
                          e.target.checked
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Error Threshold
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={settings.notifications.errorThreshold}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "errorThreshold",
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-900 w-12">
                      {settings.notifications.errorThreshold}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Alert when errors exceed this number per hour
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Cost Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Alert when daily costs exceed threshold
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notifications.costAlerts}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "costAlerts",
                          e.target.checked
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Cost Threshold ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={settings.notifications.costThreshold}
                    onChange={(e) =>
                      updateSetting(
                        "notifications",
                        "costThreshold",
                        parseFloat(e.target.value)
                      )
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Latency Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Alert when response time is high
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notifications.latencyAlerts}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "latencyAlerts",
                          e.target.checked
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case "monitoring":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data Collection
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Log Retention (days)
                  </label>
                  <select
                    value={settings.monitoring.logRetention}
                    onChange={(e) =>
                      updateSetting(
                        "monitoring",
                        "logRetention",
                        parseInt(e.target.value)
                      )
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Real-time Updates
                    </label>
                    <p className="text-sm text-gray-500">
                      Enable live data streaming
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.monitoring.realTimeUpdates}
                      onChange={(e) =>
                        updateSetting(
                          "monitoring",
                          "realTimeUpdates",
                          e.target.checked
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Detailed Logging
                    </label>
                    <p className="text-sm text-gray-500">
                      Store full request/response data
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.monitoring.detailedLogging}
                      onChange={(e) =>
                        updateSetting(
                          "monitoring",
                          "detailedLogging",
                          e.target.checked
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-refresh Interval (seconds)
                  </label>
                  <select
                    value={settings.monitoring.refreshInterval}
                    onChange={(e) =>
                      updateSetting(
                        "monitoring",
                        "refreshInterval",
                        parseInt(e.target.value)
                      )
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Security & Privacy
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      API Key Masking
                    </label>
                    <p className="text-sm text-gray-500">
                      Hide sensitive API keys in logs
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.security.apiKeyMasking}
                      onChange={(e) =>
                        updateSetting(
                          "security",
                          "apiKeyMasking",
                          e.target.checked
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Request Sanitization
                    </label>
                    <p className="text-sm text-gray-500">
                      Remove PII from request logs
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.security.requestSanitization}
                      onChange={(e) =>
                        updateSetting(
                          "security",
                          "requestSanitization",
                          e.target.checked
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Audit Logging
                    </label>
                    <p className="text-sm text-gray-500">
                      Track configuration changes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.security.auditLogging}
                      onChange={(e) =>
                        updateSetting(
                          "security",
                          "auditLogging",
                          e.target.checked
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case "ui":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Interface Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Dark Mode
                    </label>
                    <p className="text-sm text-gray-500">Use dark theme</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.ui.darkMode}
                      onChange={(e) =>
                        updateSetting("ui", "darkMode", e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Live Feed
                    </label>
                    <p className="text-sm text-gray-500">
                      Show real-time activity feed
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.ui.liveFeed}
                      onChange={(e) =>
                        updateSetting("ui", "liveFeed", e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Keyboard Shortcuts
                    </label>
                    <p className="text-sm text-gray-500">
                      Show keyboard shortcut hints
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.ui.showKeyboardShortcuts}
                      onChange={(e) =>
                        updateSetting(
                          "ui",
                          "showKeyboardShortcuts",
                          e.target.checked
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Settings content for {activeTab}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">
                Configure your monitoring preferences and system behavior
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {saved && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Settings saved!</span>
              </div>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? `${getTabColor(tab.color)} border`
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-2xl">{renderSettingsContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
