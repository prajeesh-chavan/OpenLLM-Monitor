import React, { useState, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store";

const SmartAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const { stats } = useAppStore();

  useEffect(() => {
    if (!stats) return;

    const newAlerts = []; // Check for retry rate spike
    if ((stats.retryRate || 0) > 20) {
      newAlerts.push({
        id: "retry-spike",
        type: "warning",
        title: "High Retry Rate Detected",
        message: `Your retry rate spiked to ${(stats.retryRate || 0).toFixed(
          1
        )}% in the last hour. This might indicate provider issues.`,
        timestamp: new Date(),
        action: "View Logs",
        actionUrl: "/logs?status=retry",
      });
    }

    // Check for high error rate
    if ((stats.errorRate || 0) > 15) {
      newAlerts.push({
        id: "error-spike",
        type: "error",
        title: "High Error Rate Alert",
        message: `Error rate is ${(stats.errorRate || 0).toFixed(
          1
        )}%. Most errors are from provider timeouts.`,
        timestamp: new Date(),
        action: "Check Providers",
        actionUrl: "/providers",
      });
    }

    // Check for cost threshold
    if ((stats.totalCost || 0) > 50) {
      newAlerts.push({
        id: "cost-threshold",
        type: "info",
        title: "Daily Cost Threshold Reached",
        message: `You've spent $${(stats.totalCost || 0).toFixed(
          2
        )} today. Consider monitoring usage.`,
        timestamp: new Date(),
        action: "View Analytics",
        actionUrl: "/analytics",
      });
    }

    // Check for latency issues
    if ((stats.avgResponseTime || 0) > 3000) {
      newAlerts.push({
        id: "latency-high",
        type: "warning",
        title: "High Latency Detected",
        message: `Average response time is ${(
          (stats.avgResponseTime || 0) / 1000
        ).toFixed(1)}s. This is above the recommended 2s threshold.`,
        timestamp: new Date(),
        action: "View Performance",
        actionUrl: "/analytics?tab=performance",
      });
    }

    setAlerts(newAlerts);
  }, [stats]);

  const getAlertIcon = (type) => {
    switch (type) {
      case "error":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Alert Bell Icon */}
      <button
        onClick={() => setShowAlerts(!showAlerts)}
        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Smart Alerts"
      >
        <BellIcon className="h-6 w-6" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Alerts Panel */}
      {showAlerts && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Smart Alerts
              </h3>
              <button
                onClick={() => setShowAlerts(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {alerts.length > 0 ? (
              <div className="space-y-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border-l-4 ${getAlertStyles(
                      alert.type
                    )} relative`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{alert.title}</h4>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm mt-1 text-opacity-90">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-75">
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                          {alert.action && (
                            <a
                              href={alert.actionUrl}
                              className="text-xs font-medium hover:underline"
                            >
                              {alert.action} →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No alerts
                </h3>
                <p className="text-sm text-gray-500">
                  Your system is running smoothly
                </p>
              </div>
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setAlerts([])}
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Dismiss all alerts
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close alerts when clicking outside */}
      {showAlerts && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAlerts(false)}
        />
      )}
    </div>
  );
};

export default SmartAlerts;
