import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BeakerIcon,
  PlayIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import SummaryStatsPanel from "../components/SummaryStatsPanel";
import VisualizationSection from "../components/VisualizationSection";
import LogTable from "../components/LogTable";
import PromptReplayZone from "../components/PromptReplayZone";
import KeyboardShortcuts from "../components/KeyboardShortcuts";
import LiveFeedMode from "../components/LiveFeedMode";
import { useAppStore, useLogsStore } from "../store";
import { useWebSocket } from "../hooks/useWebSocket";

const Dashboard = () => {
  const { fetchStats, openLogDetailsModal } = useAppStore();
  const { logs, fetchLogs } = useLogsStore();
  const [showReplayZone, setShowReplayZone] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Set up WebSocket for real-time updates
  useWebSocket({
    "new-log": () => {
      // Refresh stats when new log is received
      fetchStats();
      fetchLogs(); // Also refresh logs for real-time updates
    },
  });

  useEffect(() => {
    fetchStats();
    fetchLogs();

    // Listen for close-modals event from keyboard shortcuts
    const handleCloseModals = () => {
      setShowReplayZone(false);
    };

    window.addEventListener("close-modals", handleCloseModals);

    return () => {
      window.removeEventListener("close-modals", handleCloseModals);
    };
  }, [fetchStats, fetchLogs]);

  const handleReplay = (log) => {
    setSelectedLog(log);
    setShowReplayZone(true);
  };
  const handleViewDetail = (log) => {
    // Open log details modal
    openLogDetailsModal(log);
  };

  const handleGlobalSearch = () => {
    // Focus on the global search input in the control bar
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
    }
  };

  const handleKeyboardReplay = () => {
    // Open replay zone with the most recent log
    if (logs.length > 0) {
      handleReplay(logs[0]);
    }
  };

  const handleLiveFeedLog = (log) => {
    // Handle new log from live feed
    console.log("New live log received:", log);
    // You could add special handling here, like notifications or highlighting
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Keyboard Shortcuts Handler */}
      <KeyboardShortcuts
        onGlobalSearch={handleGlobalSearch}
        onReplay={handleKeyboardReplay}
      />
      {/* Live Feed Mode */}
      <LiveFeedMode onNewLog={handleLiveFeedLog} />
      {/* Summary Stats Panel */}
      <SummaryStatsPanel />
      
      {/* Quick Actions */}
      <div className="px-3 sm:px-6 py-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/test"
              className="flex flex-col items-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors group"
            >
              <div className="p-2 bg-emerald-100 rounded-lg mb-2 group-hover:bg-emerald-200 transition-colors">
                <BeakerIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Test Models</span>
              <span className="text-xs text-gray-500 text-center mt-1">
                Test prompts directly
              </span>
            </Link>
            
            <Link
              to="/replay"
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group"
            >
              <div className="p-2 bg-purple-100 rounded-lg mb-2 group-hover:bg-purple-200 transition-colors">
                <PlayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Replay</span>
              <span className="text-xs text-gray-500 text-center mt-1">
                Debug logged requests
              </span>
            </Link>
            
            <Link
              to="/analytics"
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
            >
              <div className="p-2 bg-blue-100 rounded-lg mb-2 group-hover:bg-blue-200 transition-colors">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Analytics</span>
              <span className="text-xs text-gray-500 text-center mt-1">
                View detailed metrics
              </span>
            </Link>
            
            <Link
              to="/providers"
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
            >
              <div className="p-2 bg-gray-100 rounded-lg mb-2 group-hover:bg-gray-200 transition-colors">
                <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">Providers</span>
              <span className="text-xs text-gray-500 text-center mt-1">
                Manage connections
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Visualization Section and Replay Zone */}
      <div className="flex flex-col lg:flex-row">
        {/* Left side - Charts */}
        <div className="flex-1">
          <VisualizationSection />
        </div>
      </div>
      {/* Enhanced Log Table */}
      <div className="px-3 sm:px-6 pb-6">
        <LogTable onReplay={handleReplay} />
      </div>
      {/* Prompt Replay Zone Modal */}
      <PromptReplayZone
        isOpen={showReplayZone}
        onClose={() => setShowReplayZone(false)}
        log={selectedLog}
      />
      {/* Keyboard shortcuts help - Hidden on mobile */}
      <div className="hidden sm:block fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg opacity-75 hover:opacity-100 transition-opacity">
        <div className="text-xs text-gray-600 space-y-1">
          <div>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">⌘K</kbd>{" "}
            Global Search
          </div>
          <div>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">R</kbd>{" "}
            Replay
          </div>
          <div>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd>{" "}
            Close
          </div>
        </div>
      </div>
      {/* Quick Actions - Hidden on mobile */}
      <div className="hidden lg:flex justify-between p-4 bg-white shadow-md rounded-lg border border-gray-200 mb-4">
        <Link
          to="/tests"
          className="flex-1 flex items-center justify-center p-2 mx-2 text-sm font-medium text-center text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all"
        >
          <BeakerIcon className="w-5 h-5 mr-2" />
          Test Runner
        </Link>
        <Link
          to="/replay"
          className="flex-1 flex items-center justify-center p-2 mx-2 text-sm font-medium text-center text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-all"
        >
          <PlayIcon className="w-5 h-5 mr-2" />
          Replay Zone
        </Link>
        <Link
          to="/analytics"
          className="flex-1 flex items-center justify-center p-2 mx-2 text-sm font-medium text-center text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-all"
        >
          <ChartBarIcon className="w-5 h-5 mr-2" />
          Analytics
        </Link>
        <Link
          to="/settings"
          className="flex-1 flex items-center justify-center p-2 mx-2 text-sm font-medium text-center text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
        >
          <Cog6ToothIcon className="w-5 h-5 mr-2" />
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
