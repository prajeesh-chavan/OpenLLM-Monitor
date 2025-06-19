import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store";

const ControlBar = ({ onSearch, onFilterChange, onDateRangeChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [selectedProvider, setSelectedProvider] = useState("all");

  const { providers } = useAppStore();

  // Filter options
  const filterOptions = [
    { id: "success", label: "Success", color: "green" },
    { id: "error", label: "Error", color: "red" },
    { id: "pending", label: "Pending", color: "yellow" },
    { id: "retry", label: "Retry", color: "orange" },
  ];

  const providerOptions = [
    { value: "all", label: "All Providers" },
    { value: "openai", label: "OpenAI" },
    { value: "ollama", label: "Ollama" },
    { value: "openrouter", label: "OpenRouter" },
    { value: "mistral", label: "Mistral" },
    { value: "anthropic", label: "Anthropic" },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const toggleFilter = (filterId) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter((f) => f !== filterId)
      : [...activeFilters, filterId];

    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const removeFilter = (filterId) => {
    const newFilters = activeFilters.filter((f) => f !== filterId);
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    // Add provider to filters logic here
  };
  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        {/* Left side - Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1 min-w-0">
          {/* Global Search */}
          <div className="relative flex-1 sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search logs..."
              className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Mobile Controls Row */}
          <div className="flex items-center justify-between sm:contents">
            {/* Date Range Picker */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Date Range</span>
                <span className="sm:hidden">Date</span>
              </button>

              {showDatePicker && (
                <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 sm:p-4 z-20 w-[280px] sm:min-w-[300px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        From
                      </label>
                      <input
                        type="datetime-local"
                        value={dateRange.start}
                        onChange={(e) =>
                          handleDateRangeChange({
                            ...dateRange,
                            start: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        To
                      </label>
                      <input
                        type="datetime-local"
                        value={dateRange.end}
                        onChange={(e) =>
                          handleDateRangeChange({
                            ...dateRange,
                            end: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between sm:justify-end space-x-2 mt-3">
                    <button
                      onClick={() => {
                        setDateRange({ start: "", end: "" });
                        handleDateRangeChange({ start: "", end: "" });
                      }}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <button className="flex items-center space-x-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                <FunnelIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    activeFilters.includes(filter.id)
                      ? `bg-${filter.color}-100 text-${filter.color}-800 border border-${filter.color}-200`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Provider Switcher */}
        <div className="flex items-center justify-end sm:justify-start">
          <select
            value={selectedProvider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
          >
            {providerOptions.map((provider) => (
              <option key={provider.value} value={provider.value}>
                <span className="hidden sm:inline">{provider.label}</span>
                <span className="sm:hidden">
                  {provider.label.replace("All Providers", "All")}
                </span>
              </option>
            ))}
          </select>
        </div>
      </div>{" "}
      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs sm:text-sm text-gray-500">
            Active filters:
          </span>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {activeFilters.map((filterId) => {
              const filter = filterOptions.find((f) => f.id === filterId);
              return (
                <span
                  key={filterId}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-${filter.color}-100 text-${filter.color}-800`}
                >
                  <span>{filter.label}</span>
                  <button
                    onClick={() => removeFilter(filterId)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
          <button
            onClick={() => {
              setActiveFilters([]);
              if (onFilterChange) onFilterChange([]);
            }}
            className="text-xs text-gray-400 hover:text-gray-600 ml-auto sm:ml-0"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default ControlBar;
