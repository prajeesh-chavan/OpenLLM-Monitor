import React, { useState, useEffect } from "react";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  BellIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store";

const SmartAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { stats } = useAppStore();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showDetailModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDetailModal]);

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
        details: {
          currentRate: `${(stats.retryRate || 0).toFixed(1)}%`,
          threshold: "20%",
          impact: "Increased response times and costs",
          suggestions: [
            "Check provider status and connectivity",
            "Review timeout configurations",
            "Consider using fallback providers",
          ],
        },
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
        details: {
          currentRate: `${(stats.errorRate || 0).toFixed(1)}%`,
          threshold: "15%",
          impact: "Failed requests affecting user experience",
          suggestions: [
            "Review recent error patterns",
            "Check provider health status",
            "Implement circuit breaker patterns",
          ],
        },
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
        details: {
          currentCost: `$${(stats.totalCost || 0).toFixed(2)}`,
          threshold: "$50.00",
          impact: "Budget threshold exceeded",
          suggestions: [
            "Review high-cost requests",
            "Optimize prompt lengths",
            "Consider cheaper model alternatives",
          ],
        },
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
        details: {
          currentLatency: `${((stats.avgResponseTime || 0) / 1000).toFixed(
            1
          )}s`,
          threshold: "2.0s",
          impact: "Slower user experience",
          suggestions: [
            "Check network connectivity",
            "Review model selection",
            "Consider request batching",
          ],
        },
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
  const toggleAlertExpansion = (alertId) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      setSelectedAlert(alert);
      setShowDetailModal(true);
    }
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
                {" "}
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border-l-4 ${getAlertStyles(
                      alert.type
                    )} relative p-4`}
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
                          <button
                            onClick={() => toggleAlertExpansion(alert.id)}
                            className="flex items-center space-x-1 text-xs font-medium hover:underline text-blue-600 transition-colors"
                          >
                            <span>Show Details</span>
                            <ChevronRightIcon className="h-3 w-3" />
                          </button>
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
      )}{" "}
      {/* Overlay to close alerts when clicking outside */}
      {showAlerts && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAlerts(false)}
        />
      )}
      {/* Alert Details Modal */}
      {showDetailModal && selectedAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDetailModal(false)}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div
                    className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                      selectedAlert.type === "error"
                        ? "bg-red-100"
                        : selectedAlert.type === "warning"
                        ? "bg-yellow-100"
                        : selectedAlert.type === "success"
                        ? "bg-green-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {getAlertIcon(selectedAlert.type)}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                      {selectedAlert.title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-4">
                        {selectedAlert.message}
                      </p>

                      {selectedAlert.details && (
                        <div className="space-y-4">
                          {/* Metrics */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Current Metrics
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">
                                  Current:
                                </span>
                                <div className="text-gray-900 font-semibold">
                                  {selectedAlert.details.currentRate ||
                                    selectedAlert.details.currentCost ||
                                    selectedAlert.details.currentLatency}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">
                                  Threshold:
                                </span>
                                <div className="text-gray-900 font-semibold">
                                  {selectedAlert.details.threshold}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Impact */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Impact
                            </h4>
                            <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded-md border-l-4 border-orange-200">
                              {selectedAlert.details.impact}
                            </p>
                          </div>

                          {/* Suggestions */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Recommendations
                            </h4>
                            <ul className="text-sm text-gray-700 space-y-2">
                              {selectedAlert.details.suggestions.map(
                                (suggestion, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start bg-blue-50 p-3 rounded-md"
                                  >
                                    <span className="text-blue-500 mr-2 font-bold">
                                      •
                                    </span>
                                    <span>{suggestion}</span>
                                  </li>
                                )
                              )}
                            </ul>{" "}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    dismissAlert(selectedAlert.id);
                    setShowDetailModal(false);
                  }}
                >
                  Dismiss Alert
                </button>
              </div>
            </div>{" "}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAlerts;
