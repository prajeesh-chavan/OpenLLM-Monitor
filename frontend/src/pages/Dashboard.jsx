import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BeakerIcon,
  PlayIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  SparklesIcon,
  CpuChipIcon,
  ClockIcon,
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
  const { fetchStats, openLogDetailsModal, loading } = useAppStore();
  const { logs, fetchLogs } = useLogsStore();
  const [showReplayZone, setShowReplayZone] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Set up WebSocket for real-time updates
  useWebSocket({
    "new-log": () => {
      // Refresh stats when new log is received
      fetchStats();
      fetchLogs(); // Also refresh logs for real-time updates
    },
  });
  useEffect(() => {
    const initializeDashboard = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([fetchStats(), fetchLogs()]);
      } catch (error) {
        console.error("Failed to initialize dashboard:", error);
      } finally {
        // Add a minimum loading time for better UX and to showcase the animation
        setTimeout(() => {
          setInitialLoading(false);
        }, 2500); // Increased to 2.5 seconds to show the full animation
      }
    };

    initializeDashboard();

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
  // Show loading screen during initial load
  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-50/10 to-purple-50/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative text-center p-8 max-w-md mx-auto z-10">
          {/* Main Loading Animation */}
          <div className="relative mb-8">
            {/* Outer glow ring */}
            <div className="w-28 h-28 border-2 border-blue-100/50 rounded-full mx-auto blur-sm"></div>
            {/* Main spinning ring */}
            <div className="absolute inset-0 w-28 h-28 border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full animate-spin mx-auto shadow-lg"></div>
            {/* Secondary spinning ring */}
            <div
              className="absolute inset-0 w-28 h-28 border-4 border-transparent border-b-purple-600 border-l-purple-500 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            ></div>
            {/* Inner pulsing core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 rounded-full animate-pulse shadow-xl"></div>
            </div>
            {/* Orbiting data points */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-28 h-28 relative animate-spin"
                style={{ animationDuration: "6s" }}
              >
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transform -translate-x-1/2 animate-pulse shadow-lg"></div>
                <div
                  className="absolute right-0 top-1/2 w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transform -translate-y-1/2 animate-pulse shadow-lg"
                  style={{ animationDelay: "1.5s" }}
                ></div>
                <div
                  className="absolute bottom-0 left-1/2 w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transform -translate-x-1/2 animate-pulse shadow-lg"
                  style={{ animationDelay: "3s" }}
                ></div>
                <div
                  className="absolute left-0 top-1/2 w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transform -translate-y-1/2 animate-pulse shadow-lg"
                  style={{ animationDelay: "4.5s" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-3">
                <SparklesIcon className="h-8 w-8 text-blue-600 animate-pulse" />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                  OpenLLM Monitor
                </span>
              </h2>
              <p className="text-gray-600 font-medium text-lg">
                Initializing your AI monitoring dashboard...
              </p>
            </div>

            {/* Loading Steps with enhanced animations */}
            <div className="space-y-3 mt-8">
              <div
                className="flex items-center justify-center space-x-3 text-sm text-gray-600 opacity-0 animate-pulse"
                style={{ animation: "fadeInUp 0.8s ease-out 0.2s forwards" }}
              >
                <CpuChipIcon className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Loading analytics data</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              </div>
              <div
                className="flex items-center justify-center space-x-3 text-sm text-gray-600 opacity-0"
                style={{ animation: "fadeInUp 0.8s ease-out 0.6s forwards" }}
              >
                <ClockIcon className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">Fetching recent logs</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
              <div
                className="flex items-center justify-center space-x-3 text-sm text-gray-600 opacity-0"
                style={{ animation: "fadeInUp 0.8s ease-out 1s forwards" }}
              >
                <ChartBarIcon className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Preparing visualizations</span>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Enhanced Progress Dots */}
            <div className="flex items-center justify-center space-x-2 mt-8">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce shadow-lg"></div>
              <div
                className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Custom CSS animations */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

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
          </h2>{" "}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/test"
              className="flex flex-col items-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors group"
            >
              <div className="p-2 bg-emerald-100 rounded-lg mb-2 group-hover:bg-emerald-200 transition-colors">
                <BeakerIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Test Models
              </span>
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
              <span className="text-sm font-medium text-gray-900">
                Analytics
              </span>
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
              <span className="text-sm font-medium text-gray-900">
                Providers
              </span>
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
