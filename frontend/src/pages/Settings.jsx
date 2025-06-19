import React, { useState, useEffect } from "react";
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CircleStackIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      errorThreshold: 5,
      costAlerts: true,
      costThreshold: 10,
    },
    monitoring: {
      logRetention: 30,
      realTimeUpdates: true,
      detailedLogging: true,
      anonymizeData: false,
    },
    security: {
      apiKeyMasking: true,
      requestSanitization: true,
      auditLogging: true,
    },
    performance: {
      cacheEnabled: true,
      cacheTTL: 300,
      rateLimitWarning: true,
      compressionEnabled: true,
    },
  });

  const [activeTab, setActiveTab] = useState("notifications");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      // In a real app, you'd save to your API
      localStorage.setItem(
        "openllm-monitor-settings",
        JSON.stringify(settings)
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      setSettings({
        notifications: {
          emailAlerts: true,
          errorThreshold: 5,
          costAlerts: true,
          costThreshold: 10,
        },
        monitoring: {
          logRetention: 30,
          realTimeUpdates: true,
          detailedLogging: true,
          anonymizeData: false,
        },
        security: {
          apiKeyMasking: true,
          requestSanitization: true,
          auditLogging: true,
        },
        performance: {
          cacheEnabled: true,
          cacheTTL: 300,
          rateLimitWarning: true,
          compressionEnabled: true,
        },
      });
    }
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all logs? This action cannot be undone."
      )
    ) {
      // In a real app, you'd call your API to clear data
      console.log("Clearing all data...");
    }
  };

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("openllm-monitor-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  const tabs = [
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "monitoring", name: "Monitoring", icon: ChartBarIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
    { id: "performance", name: "Performance", icon: Cog6ToothIcon },
    { id: "data", name: "Data Management", icon: CircleStackIcon },
  ];

  const updateSetting = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your OpenLLM Monitor preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeTab === tab.id
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Notification Preferences
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Email Alerts
                      </label>
                      <p className="text-sm text-gray-500">
                        Receive email notifications for important events
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailAlerts}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "emailAlerts",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Error Threshold (errors per hour)
                    </label>
                    <input
                      type="number"
                      value={settings.notifications.errorThreshold}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "errorThreshold",
                          parseInt(e.target.value)
                        )
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Cost Alerts
                      </label>
                      <p className="text-sm text-gray-500">
                        Get notified when costs exceed threshold
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.costAlerts}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "costAlerts",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Threshold ($)
                    </label>
                    <input
                      type="number"
                      value={settings.notifications.costThreshold}
                      onChange={(e) =>
                        updateSetting(
                          "notifications",
                          "costThreshold",
                          parseFloat(e.target.value)
                        )
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Monitoring Settings
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
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={365}>1 year</option>
                      <option value={-1}>Forever</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Real-time Updates
                      </label>
                      <p className="text-sm text-gray-500">
                        Enable WebSocket for live dashboard updates
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.monitoring.realTimeUpdates}
                      onChange={(e) =>
                        updateSetting(
                          "monitoring",
                          "realTimeUpdates",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Detailed Logging
                      </label>
                      <p className="text-sm text-gray-500">
                        Log request/response bodies and headers
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.monitoring.detailedLogging}
                      onChange={(e) =>
                        updateSetting(
                          "monitoring",
                          "detailedLogging",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Anonymize Data
                      </label>
                      <p className="text-sm text-gray-500">
                        Remove personally identifiable information
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.monitoring.anonymizeData}
                      onChange={(e) =>
                        updateSetting(
                          "monitoring",
                          "anonymizeData",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Security Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        API Key Masking
                      </label>
                      <p className="text-sm text-gray-500">
                        Hide API keys in logs and UI
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.apiKeyMasking}
                      onChange={(e) =>
                        updateSetting(
                          "security",
                          "apiKeyMasking",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Request Sanitization
                      </label>
                      <p className="text-sm text-gray-500">
                        Remove sensitive data from request logs
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.requestSanitization}
                      onChange={(e) =>
                        updateSetting(
                          "security",
                          "requestSanitization",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Audit Logging
                      </label>
                      <p className="text-sm text-gray-500">
                        Log all configuration changes
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.auditLogging}
                      onChange={(e) =>
                        updateSetting(
                          "security",
                          "auditLogging",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Performance Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Enable Caching
                      </label>
                      <p className="text-sm text-gray-500">
                        Cache responses to improve performance
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.performance.cacheEnabled}
                      onChange={(e) =>
                        updateSetting(
                          "performance",
                          "cacheEnabled",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cache TTL (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.performance.cacheTTL}
                      onChange={(e) =>
                        updateSetting(
                          "performance",
                          "cacheTTL",
                          parseInt(e.target.value)
                        )
                      }
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min="60"
                      max="3600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Rate Limit Warnings
                      </label>
                      <p className="text-sm text-gray-500">
                        Show warnings when approaching rate limits
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.performance.rateLimitWarning}
                      onChange={(e) =>
                        updateSetting(
                          "performance",
                          "rateLimitWarning",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Compression
                      </label>
                      <p className="text-sm text-gray-500">
                        Enable gzip compression for responses
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.performance.compressionEnabled}
                      onChange={(e) =>
                        updateSetting(
                          "performance",
                          "compressionEnabled",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Data Management
                </h3>

                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Clear All Data
                    </h4>
                    <p className="text-sm text-yellow-700 mb-4">
                      This will permanently delete all logs, analytics data, and
                      cached information. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleClearData}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Clear All Data
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Export Data
                    </h4>
                    <p className="text-sm text-blue-700 mb-4">
                      Export your data for backup or analysis purposes.
                    </p>
                    <div className="space-x-2">
                      <button className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50">
                        Export as JSON
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50">
                        Export as CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset to Defaults
          </button>

          <div className="flex items-center space-x-3">
            {saved && (
              <span className="text-sm text-green-600">Settings saved!</span>
            )}
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
