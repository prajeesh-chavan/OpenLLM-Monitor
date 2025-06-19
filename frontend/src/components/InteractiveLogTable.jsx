import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  DocumentTextIcon,
  ClockIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

const InteractiveLogTable = ({
  logs = [],
  onReplay,
  onViewDetail,
  loading = false,
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20);

  const toggleRowExpansion = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleRowSelection = (logId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === logs.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(logs.map((log) => log._id)));
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "error":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };
  const formatLatency = (ms) => {
    if (!ms && ms !== 0) return "N/A";
    const numericMs = typeof ms === "number" ? ms : parseFloat(ms);
    if (isNaN(numericMs)) return "N/A";
    return numericMs >= 1000
      ? `${(numericMs / 1000).toFixed(2)}s`
      : `${numericMs}ms`;
  };

  const formatTokens = (tokenUsage) => {
    if (!tokenUsage) return "N/A";
    return tokenUsage.totalTokens || 0;
  };
  const formatCost = (cost) => {
    if (!cost && cost !== 0) return "$0.00";
    const numericCost = typeof cost === "number" ? cost : parseFloat(cost);
    if (isNaN(numericCost)) return "$0.00";
    return `$${numericCost.toFixed(4)}`;
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Sort logs
  const sortedLogs = [...logs].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "createdAt") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate logs
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedLogs = sortedLogs.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(logs.length / rowsPerPage);

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left hover:text-gray-900 focus:outline-none"
    >
      <span>{children}</span>
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        ))}
    </button>
  );
  const MobileLogCard = ({ log }) => (
    <div
      className={`bg-white rounded-lg border-l-4 shadow-sm mb-3 ${getStatusColor(
        log.status
      )}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(log.status)}
            <span className="text-sm font-medium capitalize">{log.status}</span>
          </div>
          <div className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={selectedRows.has(log._id)}
              onChange={() => toggleRowSelection(log._id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Provider</span>
            <span className="text-sm font-medium">{log.provider}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Model</span>
            <span className="text-sm">{log.model}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Time</span>
            <span className="text-sm">
              {format(new Date(log.createdAt), "MMM dd, HH:mm")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-xs text-gray-500">Latency</div>
            <div className="text-sm font-medium">
              {formatLatency(log.latency)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Tokens</div>
            <div className="text-sm font-medium">
              {formatTokens(log.tokenUsage)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Cost</div>
            <div className="text-sm font-medium">{formatCost(log.cost)}</div>
          </div>
        </div>

        {/* Prompt Preview */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Prompt</div>
          <div className="text-sm text-gray-700 bg-gray-50 rounded p-2 text-ellipsis overflow-hidden">
            {truncateText(log.prompt || log.request?.prompt, 80)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleRowExpansion(log._id)}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
          >
            {expandedRows.has(log._id) ? (
              <>
                <ChevronUpIcon className="h-3 w-3" />
                <span>Less</span>
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-3 w-3" />
                <span>More</span>
              </>
            )}
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReplay && onReplay(log)}
              className="p-1.5 text-blue-500 hover:text-blue-700 rounded"
              title="Replay"
            >
              <PlayIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewDetail && onViewDetail(log)}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
              title="Details"
            >
              <DocumentTextIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {expandedRows.has(log._id) && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Full Prompt
              </div>
              <div className="bg-gray-50 rounded p-2 text-xs font-mono max-h-24 overflow-y-auto">
                {log.prompt || log.request?.prompt || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Response
              </div>
              <div className="bg-gray-50 rounded p-2 text-xs max-h-24 overflow-y-auto">
                {log.completion || log.response?.completion || "N/A"}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onReplay && onReplay(log)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                <PlayIcon className="h-3 w-3" />
                <span>Replay</span>
              </button>
              <button
                onClick={() => onViewDetail && onViewDetail(log)}
                className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-xs rounded hover:bg-gray-50"
              >
                <DocumentTextIcon className="h-3 w-3" />
                <span>Details</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-3 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Request Logs
          </h3>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {selectedRows.size > 0 && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-xs sm:text-sm text-gray-600">
                  {selectedRows.size} selected
                </span>
                <button
                  onClick={() => {
                    /* Handle bulk replay */
                  }}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Replay
                </button>
                <button
                  onClick={() => {
                    /* Handle bulk export */
                  }}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Export
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        <div className="p-3">
          {paginatedLogs.map((log) => (
            <MobileLogCard key={log._id} log={log} />
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === logs.length && logs.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="createdAt">Timestamp</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="provider">Provider</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="model">Model</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="latency">Latency</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="cost">Cost</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.map((log) => (
                <React.Fragment key={log._id}>
                  <tr
                    className={`hover:bg-gray-50 transition-colors ${getStatusColor(
                      log.status
                    )} border-l-4`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(log._id)}
                        onChange={() => toggleRowSelection(log._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm capitalize text-gray-900">
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">{log.provider}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatLatency(log.latency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTokens(log.tokenUsage)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCost(log.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleRowExpansion(log._id)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="Expand details"
                        >
                          {expandedRows.has(log._id) ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => onReplay && onReplay(log)}
                          className="p-1 text-blue-400 hover:text-blue-600 rounded"
                          title="Replay request"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onViewDetail && onViewDetail(log)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="View details"
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRows.has(log._id) && (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* Prompt and Response Preview */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-1">
                                <DocumentTextIcon className="h-4 w-4" />
                                <span>Prompt</span>
                              </h4>
                              <div className="bg-white rounded border p-3 text-sm font-mono max-h-32 overflow-y-auto">
                                {truncateText(
                                  log.prompt || log.request?.prompt,
                                  200
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Completion
                              </h4>
                              <div className="bg-white rounded border p-3 text-sm max-h-32 overflow-y-auto">
                                {truncateText(
                                  log.completion || log.response?.completion,
                                  200
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Metadata Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded p-3 border">
                              <div className="flex items-center space-x-2 mb-1">
                                <ClockIcon className="h-4 w-4 text-blue-500" />
                                <span className="text-xs font-medium text-gray-600">
                                  Latency
                                </span>
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {formatLatency(log.latency)}
                              </div>
                            </div>

                            <div className="bg-white rounded p-3 border">
                              <div className="flex items-center space-x-2 mb-1">
                                <CpuChipIcon className="h-4 w-4 text-purple-500" />
                                <span className="text-xs font-medium text-gray-600">
                                  Tokens
                                </span>
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {formatTokens(log.tokenUsage)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {log.tokenUsage?.promptTokens || 0}p /{" "}
                                {log.tokenUsage?.completionTokens || 0}c
                              </div>
                            </div>

                            <div className="bg-white rounded p-3 border">
                              <div className="flex items-center space-x-2 mb-1">
                                <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                                <span className="text-xs font-medium text-gray-600">
                                  Cost
                                </span>
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {formatCost(log.cost)}
                              </div>
                            </div>

                            <div className="bg-white rounded p-3 border">
                              <div className="flex items-center space-x-2 mb-1">
                                <EllipsisHorizontalIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-xs font-medium text-gray-600">
                                  Request ID
                                </span>
                              </div>
                              <div className="text-sm font-mono text-gray-900">
                                {log._id.slice(-8)}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-3 pt-2">
                            <button
                              onClick={() => onReplay && onReplay(log)}
                              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              <PlayIcon className="h-4 w-4" />
                              <span>Replay</span>
                            </button>
                            <button
                              onClick={() => onViewDetail && onViewDetail(log)}
                              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50"
                            >
                              <DocumentTextIcon className="h-4 w-4" />
                              <span>Full Details</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + rowsPerPage, logs.length)} of {logs.length}{" "}
              results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs sm:text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {logs.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No logs found
          </h3>
          <p className="text-gray-500">
            Start making requests to see logs appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default InteractiveLogTable;
