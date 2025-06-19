import React, { useEffect, useState } from "react";
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
      <SummaryStatsPanel /> {/* Visualization Section and Replay Zone */}
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
    </div>
  );
};

export default Dashboard;
