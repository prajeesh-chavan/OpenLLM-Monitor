import React, { useState, useEffect } from "react";
import InteractiveLogTable from "../components/InteractiveLogTable";
import ControlBar from "../components/ControlBar";
import PromptReplayZone from "../components/PromptReplayZone";
import LiveFeedMode from "../components/LiveFeedMode";
import { useLogsStore, useAppStore } from "../store";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const LogsPage = () => {
  const { logs, fetchLogs, loading } = useLogsStore();
  const { openLogDetailsModal } = useAppStore();
  const [showReplayZone, setShowReplayZone] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    let filtered = [...logs];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log._id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter((log) => activeFilters.includes(log.status));
    }

    setFilteredLogs(filtered);
  }, [logs, searchQuery, activeFilters]);

  const handleReplay = (log) => {
    setSelectedLog(log);
    setShowReplayZone(true);
  };
  const handleViewDetail = (log) => {
    openLogDetailsModal(log);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleDateRangeChange = (dateRange) => {
    // Implement date range filtering
    console.log("Date range:", dateRange);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Request Logs
                </h1>
                <p className="text-sm text-gray-500">
                  View, search, and analyze all your LLM API requests
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredLogs.length}</span> of{" "}
              <span className="font-medium">{logs.length}</span> logs
            </div>
            {activeFilters.length > 0 && (
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">
                  {activeFilters.length} filter
                  {activeFilters.length > 1 ? "s" : ""} active
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <ControlBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Live Feed Mode */}
      <LiveFeedMode onNewLog={(log) => console.log("New log:", log)} />

      {/* Main Content */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading logs...</span>
            </div>
          </div>
        ) : (
          <InteractiveLogTable
            logs={filteredLogs}
            onReplay={handleReplay}
            onViewDetail={handleViewDetail}
            loading={loading}
          />
        )}
      </div>

      {/* Prompt Replay Zone Modal */}
      <PromptReplayZone
        isOpen={showReplayZone}
        onClose={() => setShowReplayZone(false)}
        log={selectedLog}
      />
    </div>
  );
};

export default LogsPage;
