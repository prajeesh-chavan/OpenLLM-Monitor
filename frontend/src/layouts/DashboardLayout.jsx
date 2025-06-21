import React from "react";
import { Outlet } from "react-router-dom";
import TopHeader from "../components/TopHeader";
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <TopHeader />

      {/* Main content area */}
      <main className="flex-1">
        <Outlet />
      </main>
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
