import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import errorHandler from '../services/errorHandler';

// Custom hook for error handling in React components
export const useErrorHandler = () => {
  const navigate = useNavigate();

  // Handle different types of errors
  const handleError = useCallback((error, context = {}) => {
    try {
      errorHandler.handleError(error, context);
    } catch (unhandledError) {
      // If error handler can't handle it, let it bubble up to ErrorBoundary
      throw unhandledError;
    }
  }, []);

  // Handle API errors specifically
  const handleApiError = useCallback((response, context = {}) => {
    return errorHandler.handleApiError(response, context);
  }, []);

  // Handle fetch errors
  const handleFetchError = useCallback((error, url = '') => {
    return errorHandler.handleFetchError(error, url);
  }, []);

  // Navigate to specific error page
  const navigateToError = useCallback((errorType) => {
    const errorPaths = {
      '429': '/error/429',
      'rateLimit': '/error/429',
      '500': '/error/500',
      'server': '/error/500',
      'network': '/error/network',
      'offline': '/error/network',
      '404': '/error/404',
      'notFound': '/error/404',
    };

    const path = errorPaths[errorType] || '/error/500';
    navigate(path);
  }, [navigate]);

  // Enhanced fetch with error handling
  const safeFetch = useCallback(async (url, options = {}) => {
    try {
      return await errorHandler.enhancedFetch(url, options);
    } catch (error) {
      // Error is already handled by errorHandler
      throw error;
    }
  }, []);

  // Retry wrapper
  const withRetry = useCallback((fn, maxRetries = 3, baseDelay = 1000) => {
    return errorHandler.withRetry(fn, maxRetries, baseDelay);
  }, []);

  return {
    handleError,
    handleApiError,
    handleFetchError,
    navigateToError,
    safeFetch,
    withRetry,
  };
};

// Hook for API calls with automatic error handling
export const useApiCall = () => {
  const { handleApiError, withRetry } = useErrorHandler();

  const apiCall = useCallback(async (
    apiFunction,
    {
      retries = 1,
      retryDelay = 1000,
      showErrorToast = true,
      errorContext = {}
    } = {}
  ) => {
    try {
      if (retries > 1) {
        return await withRetry(apiFunction, retries, retryDelay);
      } else {
        return await apiFunction();
      }
    } catch (error) {
      const handled = handleApiError(error.response || error, {
        ...errorContext,
        showErrorToast,
      });

      if (!handled.handled) {
        // Re-throw unhandled errors
        throw error;
      }

      return { data: null, error: handled };
    }
  }, [handleApiError, withRetry]);

  return { apiCall };
};

// Hook for handling network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { navigateToError } = useErrorHandler();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Optionally navigate back from network error page
      if (window.location.pathname === '/error/network') {
        window.history.back();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      navigateToError('network');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigateToError]);

  return { isOnline };
};

// Higher-order component for error boundary
export const withErrorBoundary = (Component, errorFallback = null) => {
  return function WrappedComponent(props) {
    const { handleError } = useErrorHandler();

    const ErrorFallback = errorFallback || (({ error, resetError }) => (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">An error occurred in this component.</p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left bg-gray-100 p-4 rounded">
            <summary>Error Details</summary>
            <pre className="text-sm">{error.toString()}</pre>
          </details>
        )}
      </div>
    ));

    try {
      return <Component {...props} />;
    } catch (error) {
      handleError(error, { component: Component.name });
      return <ErrorFallback error={error} resetError={() => window.location.reload()} />;
    }
  };
};

export default {
  useErrorHandler,
  useApiCall,
  useNetworkStatus,
  withErrorBoundary,
};
