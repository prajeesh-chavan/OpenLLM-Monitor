import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store";
import SmartAlerts from "./SmartAlerts";

const TopHeader = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { fetchStats, stats, setSettingsModalOpen } = useAppStore();

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchStats();
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchStats]);

  const handleManualRefresh = () => {
    fetchStats();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // You can implement dark mode theme switching here
    document.documentElement.classList.toggle("dark", !darkMode);
  };
  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">
                🧠
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              <span className="hidden sm:inline">OpenLLM Monitor</span>
              <span className="sm:hidden">LLM Monitor</span>
            </h1>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 hidden lg:block">
            Real-time LLM Dev Console
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {" "}
          {/* Auto Refresh Toggle */}
          <div className="hidden sm:flex items-center space-x-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                  autoRefresh ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <div
                  className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    autoRefresh
                      ? "translate-x-5 sm:translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </div>
              <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-700">
                Auto
              </span>
            </label>
          </div>
          {/* Manual Refresh */}
          <button
            onClick={handleManualRefresh}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Manual Refresh"
          >
            <ArrowPathIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          {/* Smart Alerts */}
          <div className="hidden sm:block">
            <SmartAlerts />
          </div>
          {/* Dark Mode Toggle */}
          {/* <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle Dark Mode"
          >
            {darkMode ? (
              <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button> */}
          {/* Settings */}
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
