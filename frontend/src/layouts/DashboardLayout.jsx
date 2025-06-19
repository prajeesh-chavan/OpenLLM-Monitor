import React from "react";
import { Outlet } from "react-router-dom";
import TopHeader from "../components/TopHeader";
import ControlBar from "../components/ControlBar";
import SettingsModal from "../components/SettingsModal";
import LogDetailsModal from "../components/LogDetailsModal";
import { useAppStore } from "../store";

const DashboardLayout = () => {
  const {
    sidebarOpen,
    settingsModalOpen,
    setSettingsModalOpen,
    logDetailsModalOpen,
    selectedLog,
    closeLogDetailsModal,
  } = useAppStore();

  const handleSearch = (query) => {
    // Global search functionality
    console.log("Global search:", query);
  };

  const handleFilterChange = (filters) => {
    // Global filter functionality
    console.log("Global filters:", filters);
  };

  const handleDateRangeChange = (dateRange) => {
    // Global date range functionality
    console.log("Global date range:", dateRange);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <TopHeader />
      {/* Control Bar */}
      <ControlBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onDateRangeChange={handleDateRangeChange}
      />{" "}
      {/* Main content area */}
      <main className="flex-1">
        <Outlet />
      </main>{" "}
      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
      {/* Log Details Modal */}
      <LogDetailsModal
        isOpen={logDetailsModalOpen}
        onClose={closeLogDetailsModal}
        log={selectedLog}
      />
    </div>
  );
};

export default DashboardLayout;
