import React from "react";
import LogTable from "../components/LogTable";

const Logs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and analyze all your LLM API requests
        </p>
      </div>

      <LogTable />
    </div>
  );
};

export default Logs;
