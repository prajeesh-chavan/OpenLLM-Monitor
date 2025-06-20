import React, { useEffect } from "react";
import {
  XMarkIcon,
  ClockIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";

const PerformanceModal = ({ isOpen, onClose, performanceData }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const {
    latency = {},
    tokens = {},
    costs = {},
    status = {},
  } = performanceData || {};

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 w-full max-w-4xl rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Performance Metrics
              </h2>
              <p className="text-sm text-gray-400">
                Detailed analysis of system performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Response Times */}
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <ClockIcon className="h-4 w-4 text-yellow-400" />
                </div>
                <h4 className="font-medium text-white">Response Times</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Average Latency</span>
                  <span className="text-white font-mono">
                    {latency.average || 0}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Peak Latency</span>
                  <span className="text-white font-mono">
                    {latency.peak || 0}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">95th Percentile</span>
                  <span className="text-white font-mono">
                    {latency.percentile95 || 0}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Token Usage */}
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <CpuChipIcon className="h-4 w-4 text-blue-400" />
                </div>
                <h4 className="font-medium text-white">Token Usage</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total Tokens</span>
                  <span className="text-white font-mono">
                    {tokens.total?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Prompt Tokens</span>
                  <span className="text-white font-mono">
                    {tokens.prompt?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">
                    Completion Tokens
                  </span>
                  <span className="text-white font-mono">
                    {tokens.completion?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Costs */}
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CurrencyDollarIcon className="h-4 w-4 text-green-400" />
                </div>
                <h4 className="font-medium text-white">Cost Analysis</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total Cost</span>
                  <span className="text-white font-mono">
                    ${costs.total?.toFixed(6) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">
                    Average Cost/Request
                  </span>
                  <span className="text-white font-mono">
                    ${costs.average?.toFixed(6) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-2">
                  <span className="text-gray-400 text-sm">
                    Monthly Estimate
                  </span>
                  <span className="text-white font-mono">
                    ${costs.monthlyEstimate?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>

            {/* Request Status */}
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <ServerIcon className="h-4 w-4 text-purple-400" />
                </div>
                <h4 className="font-medium text-white">Request Status</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Success Rate</span>
                  <span className="text-white font-mono">
                    {status.successRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Error Rate</span>
                  <span className="text-white font-mono">
                    {status.errorRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Total Requests</span>
                  <span className="text-white font-mono">
                    {status.totalRequests?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceModal;
