// Error handling utility service
class ErrorHandlerService {
  constructor() {
    this.errorCallbacks = new Map();
  }

  // Register error callback for specific error types
  onError(errorType, callback) {
    if (!this.errorCallbacks.has(errorType)) {
      this.errorCallbacks.set(errorType, []);
    }
    this.errorCallbacks.get(errorType).push(callback);
  }

  // Handle different types of errors
  handleError(error, context = {}) {
    console.error('Error occurred:', error, context);

    // Determine error type and redirect accordingly
    if (this.isRateLimitError(error)) {
      this.navigateToError('/error/429');
    } else if (this.isServerError(error)) {
      this.navigateToError('/error/500');
    } else if (this.isNetworkError(error)) {
      this.navigateToError('/error/network');
    } else {
      // For unhandled errors, let ErrorBoundary catch them
      throw error;
    }

    // Execute registered callbacks
    const callbacks = this.errorCallbacks.get('any') || [];
    callbacks.forEach(callback => {
      try {
        callback(error, context);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  // Handle API errors specifically
  handleApiError(response, context = {}) {
    const status = response?.status;
    const data = response?.data;

    switch (status) {
      case 429:
        this.navigateToError('/error/429');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        this.navigateToError('/error/500');
        break;
      case 404:
        // Don't redirect for API 404s, just log them
        console.warn('API endpoint not found:', response);
        break;
      default:
        if (status >= 500) {
          this.navigateToError('/error/500');
        } else if (!navigator.onLine) {
          this.navigateToError('/error/network');
        }
    }

    return { status, data, handled: this.isHandledStatus(status) };
  }

  // Handle fetch/network errors
  handleFetchError(error, url = '') {
    console.error('Fetch error:', error, 'URL:', url);

    if (!navigator.onLine) {
      this.navigateToError('/error/network');
      return true;
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      this.navigateToError('/error/network');
      return true;
    }

    if (error.name === 'TimeoutError') {
      this.navigateToError('/error/network');
      return true;
    }

    return false;
  }

  // Check error types
  isRateLimitError(error) {
    return (
      error?.response?.status === 429 ||
      error?.status === 429 ||
      error?.message?.toLowerCase().includes('rate limit') ||
      error?.message?.toLowerCase().includes('too many requests')
    );
  }

  isServerError(error) {
    const status = error?.response?.status || error?.status;
    return status >= 500 && status < 600;
  }

  isNetworkError(error) {
    return (
      !navigator.onLine ||
      error?.code === 'NETWORK_ERROR' ||
      error?.message?.toLowerCase().includes('network') ||
      error?.message?.toLowerCase().includes('fetch') ||
      error?.name === 'TypeError'
    );
  }

  isHandledStatus(status) {
    return [429, 500, 502, 503, 504].includes(status);
  }

  // Navigate to error page
  navigateToError(path) {
    // Use window.location for immediate navigation
    // This ensures error pages work even if React Router has issues
    if (window.location.pathname !== path) {
      window.location.href = path;
    }
  }

  // Create enhanced fetch wrapper
  enhancedFetch = async (url, options = {}) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        error.status = response.status;
        error.data = errorData;

        this.handleApiError(response);
        throw error;
      }

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        timeoutError.name = 'TimeoutError';
        this.handleFetchError(timeoutError, url);
        throw timeoutError;
      }

      this.handleFetchError(error, url);
      throw error;
    }
  };

  // Create axios interceptor helper
  createAxiosInterceptor(axiosInstance) {
    // Request interceptor
    axiosInstance.interceptors.request.use(
      (config) => {
        // Add timestamp for timeout tracking
        config.metadata = { startTime: new Date() };
        return config;
      },
      (error) => {
        this.handleError(error, { type: 'request' });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const handled = this.handleApiError(error.response, {
          type: 'response',
          config: error.config,
        });

        if (handled.handled) {
          // Don't propagate handled errors
          return Promise.resolve({ data: null, error: handled });
        }

        return Promise.reject(error);
      }
    );

    return axiosInstance;
  }

  // Create retry wrapper
  withRetry = async (fn, maxRetries = 3, baseDelay = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (this.isRateLimitError(error) || error?.response?.status === 401) {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    this.handleError(lastError, { type: 'retry-exhausted', attempts: maxRetries });
    throw lastError;
  };

  // Monitor network status
  startNetworkMonitoring() {
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      // Optionally redirect back from network error page
      if (window.location.pathname === '/error/network') {
        window.history.back();
      }
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.navigateToError('/error/network');
    });
  }

  // Global error handlers
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Try to handle the error gracefully
      if (this.handleFetchError(event.reason)) {
        event.preventDefault(); // Prevent console error
      }
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      // Let ErrorBoundary handle most errors
      // Only handle specific network/fetch errors here
      if (this.isNetworkError(event.error)) {
        this.handleError(event.error, { type: 'global' });
        event.preventDefault();
      }
    });

    this.startNetworkMonitoring();
  }
}

// Create singleton instance
const errorHandler = new ErrorHandlerService();

// Auto-setup global handlers
if (typeof window !== 'undefined') {
  errorHandler.setupGlobalErrorHandlers();
}

export default errorHandler;
