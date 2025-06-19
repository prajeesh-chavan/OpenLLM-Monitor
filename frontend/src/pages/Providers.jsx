import React from "react";
import ProviderSwitcher from "../components/ProviderSwitcher";

const Providers = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LLM Providers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and configure your LLM API providers
        </p>
      </div>

      <ProviderSwitcher />
    </div>
  );
};

export default Providers;
