// Example usage of error handling in components
import React, { useState } from 'react';
import { useErrorHandler, useApiCall } from '../hooks/useErrorHandler';
import api from '../services/api';

const ExampleComponentWithErrorHandling = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { handleError, navigateToError } = useErrorHandler();
  const { apiCall } = useApiCall();

  // Example 1: Manual error handling
  const fetchDataManual = async () => {
    setLoading(true);
    try {
      const response = await api.get('/logs');
      setData(response);
    } catch (error) {
      // This will automatically redirect to appropriate error page if needed
      handleError(error, { context: 'fetching logs' });
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Using the apiCall hook (recommended)
  const fetchDataWithHook = async () => {
    setLoading(true);
    
    const result = await apiCall(
      () => api.get('/logs'),
      {
        retries: 3,
        retryDelay: 1000,
        showErrorToast: true,
        errorContext: { component: 'ExampleComponent', action: 'fetchLogs' }
      }
    );

    if (result.data) {
      setData(result.data);
    }
    // Errors are automatically handled by the hook
    
    setLoading(false);
  };

  // Example 3: Manually triggering error pages for testing
  const simulateErrors = {
    rateLimit: () => navigateToError('429'),
    serverError: () => navigateToError('500'),
    networkError: () => navigateToError('network'),
    notFound: () => navigateToError('404'),
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/30 p-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Error Handling Test Center
          </h2>
          <p className="text-gray-600 mb-8">Test the error pages and error handling functionality</p>
          
          <div className="space-y-8">
            {/* Error Page Testing */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-100">
              <h3 className="text-xl font-semibold mb-4 text-red-800">🚨 Test Error Pages</h3>
              <p className="text-red-700 mb-4">Click any button to navigate to the corresponding error page:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={simulateErrors.rateLimit}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
                >
                  <span className="text-lg">⏱️</span>
                  <div className="text-left">
                    <div className="font-semibold">Rate Limit Error</div>
                    <div className="text-sm opacity-90">HTTP 429 - Too Many Requests</div>
                  </div>
                </button>
                
                <button
                  onClick={simulateErrors.serverError}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                >
                  <span className="text-lg">💥</span>
                  <div className="text-left">
                    <div className="font-semibold">Server Error</div>
                    <div className="text-sm opacity-90">HTTP 500 - Internal Server Error</div>
                  </div>
                </button>
                
                <button
                  onClick={simulateErrors.networkError}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-lg hover:from-gray-600 hover:to-slate-600 transition-all duration-200 shadow-lg"
                >
                  <span className="text-lg">📡</span>
                  <div className="text-left">
                    <div className="font-semibold">Network Error</div>
                    <div className="text-sm opacity-90">Connection Failed</div>
                  </div>
                </button>
                
                <button
                  onClick={simulateErrors.notFound}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg"
                >
                  <span className="text-lg">🔍</span>
                  <div className="text-left">
                    <div className="font-semibold">Not Found</div>
                    <div className="text-sm opacity-90">HTTP 404 - Page Not Found</div>
                  </div>
                </button>
              </div>
            </div>

            {/* API Error Testing */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-xl font-semibold mb-4 text-blue-800">🔧 Test API Error Handling</h3>
              <p className="text-blue-700 mb-4">Test how the application handles API errors (these will show toasts/notifications):</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={fetchDataManual}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span>🛠️</span>
                  {loading ? 'Loading...' : 'Fetch Data (Manual Error Handling)'}
                </button>
                <button
                  onClick={fetchDataWithHook}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span>🎣</span>
                  {loading ? 'Loading...' : 'Fetch Data (Hook Error Handling)'}
                </button>
              </div>
              {data && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Success Response:</h4>
                  <pre className="text-sm text-green-700 overflow-auto max-h-32">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-6 border border-violet-100">
              <h3 className="text-xl font-semibold mb-4 text-violet-800">📖 How to Test</h3>
              <div className="space-y-3 text-violet-700">
                <div className="flex items-start gap-3">
                  <span className="text-lg">1️⃣</span>
                  <div>
                    <strong>Error Pages:</strong> Click any error button above to navigate to a full-screen error page. Use your browser's back button to return here.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">2️⃣</span>
                  <div>
                    <strong>API Errors:</strong> The API buttons will attempt to fetch real data. If the backend is not running, you'll see error handling in action.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">3️⃣</span>
                  <div>
                    <strong>Manual Testing:</strong> You can also test by navigating directly to:
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li><code className="bg-white px-2 py-1 rounded">/error/429</code> - Rate limit error</li>
                      <li><code className="bg-white px-2 py-1 rounded">/error/500</code> - Server error</li>
                      <li><code className="bg-white px-2 py-1 rounded">/error/404</code> - Not found</li>
                      <li><code className="bg-white px-2 py-1 rounded">/error/network</code> - Network error</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleComponentWithErrorHandling;
