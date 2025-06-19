import React, { useState, useEffect } from "react";
import { PlayIcon, PauseIcon, SignalIcon } from "@heroicons/react/24/outline";
import { useWebSocket } from "../hooks/useWebSocket";

const LiveFeedMode = ({ onNewLog }) => {
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(false);
  const [liveLogCount, setLiveLogCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);

  // Set up WebSocket for live feed
  useWebSocket({
    "new-log": (log) => {
      if (isLiveFeedActive) {
        setLiveLogCount((prev) => prev + 1);
        setRecentLogs((prev) => [log, ...prev.slice(0, 4)]); // Keep only last 5 logs
        if (onNewLog) {
          onNewLog(log);
        }
      }
    },
  });

  useEffect(() => {
    if (!isLiveFeedActive) {
      setLiveLogCount(0);
      setRecentLogs([]);
    }
  }, [isLiveFeedActive]);

  const toggleLiveFeed = () => {
    setIsLiveFeedActive(!isLiveFeedActive);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Live Feed Toggle Button */}
      <div className="relative">
        <button
          onClick={toggleLiveFeed}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-200 ${
            isLiveFeedActive
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          {isLiveFeedActive ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isLiveFeedActive ? "Live Feed ON" : "Live Feed OFF"}
          </span>
          {isLiveFeedActive && (
            <div className="flex items-center space-x-1">
              <SignalIcon className="h-4 w-4 animate-pulse" />
              {liveLogCount > 0 && (
                <span className="bg-white text-green-600 text-xs px-2 py-1 rounded-full font-semibold">
                  {liveLogCount}
                </span>
              )}
            </div>
          )}
        </button>

        {/* Live Feed Panel */}
        {isLiveFeedActive && recentLogs.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">
                  Live Activity
                </span>
                <span className="text-xs text-gray-500">
                  ({recentLogs.length} recent)
                </span>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {recentLogs.map((log, index) => (
                <div
                  key={`${log._id}-${index}`}
                  className={`p-3 border-b border-gray-100 last:border-b-0 animate-slide-in-right ${
                    log.status === "success"
                      ? "bg-green-50"
                      : log.status === "error"
                      ? "bg-red-50"
                      : "bg-yellow-50"
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          log.status === "success"
                            ? "bg-green-400"
                            : log.status === "error"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {log.provider} • {log.model}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(log.createdAt)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>
                        Latency: {log.latency ? `${log.latency}ms` : "N/A"}
                      </span>
                      <span>Tokens: {log.tokenUsage?.totalTokens || 0}</span>
                    </div>
                    {log.prompt && (
                      <div className="bg-white rounded p-2 font-mono text-xs max-h-12 overflow-hidden">
                        {log.prompt.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 bg-gray-50 text-center">
              <span className="text-xs text-gray-500">
                Real-time log streaming active
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeedMode;
