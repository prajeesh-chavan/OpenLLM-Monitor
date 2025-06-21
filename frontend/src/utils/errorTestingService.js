// Development utility for testing error scenarios
// This creates a mock API service that you can use to test error handling

class ErrorTestingService {
  constructor() {
    this.originalFetch = window.fetch;
    this.isActive = false;
  }

  // Activate mock responses
  activate() {
    if (this.isActive) return;
    
    this.isActive = true;
    window.fetch = this.mockFetch.bind(this);
    console.log('🧪 Error Testing Service activated! API calls will return mock errors.');
  }

  // Deactivate mock responses
  deactivate() {
    if (!this.isActive) return;
    
    this.isActive = false;
    window.fetch = this.originalFetch;
    console.log('✅ Error Testing Service deactivated! API calls will work normally.');
  }

  // Mock fetch that returns different errors based on the URL or query parameters
  async mockFetch(url, options = {}) {
    // Check if this is an API call to our backend
    const isApiCall = url.includes('/api/') || url.includes('localhost:3001');
    
    if (!isApiCall) {
      // Let non-API calls through normally
      return this.originalFetch(url, options);
    }

    // Parse URL to determine what kind of error to simulate
    const urlObj = new URL(url, window.location.origin);
    const testParam = urlObj.searchParams.get('test-error');
    
    console.log(`🎭 Mocking API call: ${url}`);

    // Simulate different error scenarios
    switch (testParam) {
      case '429':
      case 'rate-limit':
        return this.mockRateLimitError();
      
      case '500':
      case 'server-error':
        return this.mockServerError();
      
      case '404':
      case 'not-found':
        return this.mockNotFoundError();
      
      case 'network':
      case 'network-error':
        return this.mockNetworkError();
      
      case 'timeout':
        return this.mockTimeoutError();
      
      default:
        // For testing, randomly return errors sometimes
        const shouldError = Math.random() < 0.3; // 30% chance of error
        if (shouldError) {
          const errorTypes = ['429', '500', 'network'];
          const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
          
          switch (randomError) {
            case '429':
              return this.mockRateLimitError();
            case '500':
              return this.mockServerError();
            case 'network':
              return this.mockNetworkError();
          }
        }
        
        // Otherwise, simulate a successful response
        return this.mockSuccessResponse(url);
    }
  }

  mockRateLimitError() {
    return Promise.resolve(new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 60
      }),
      {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      }
    ));
  }

  mockServerError() {
    return Promise.resolve(new Response(
      JSON.stringify({
        error: 'Internal server error. Our team has been notified.',
        code: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ));
  }

  mockNotFoundError() {
    return Promise.resolve(new Response(
      JSON.stringify({
        error: 'The requested resource was not found.',
        code: 'NOT_FOUND'
      }),
      {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ));
  }

  mockNetworkError() {
    return Promise.reject(new Error('Network error: Failed to fetch'));
  }

  mockTimeoutError() {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);
    });
  }

  mockSuccessResponse(url) {
    // Return mock successful data based on the endpoint
    let mockData = { success: true, data: [] };
    
    if (url.includes('/logs')) {
      mockData.data = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          method: 'POST',
          url: '/api/chat/completions',
          status: 200,
          duration: 1250,
          provider: 'openai',
          model: 'gpt-4'
        }
      ];
    } else if (url.includes('/providers')) {
      mockData.data = {
        openai: { name: 'OpenAI', status: 'connected', enabled: true },
        ollama: { name: 'Ollama', status: 'connected', enabled: true }
      };
    } else if (url.includes('/analytics')) {
      mockData.data = {
        totalRequests: 1250,
        successRate: 98.4,
        avgResponseTime: 1200,
        errorRate: 1.6
      };
    }

    return Promise.resolve(new Response(
      JSON.stringify(mockData),
      {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ));
  }
}

// Create global instance
window.errorTestingService = new ErrorTestingService();

// Add some convenience functions to window for easy testing
window.testErrors = {
  activate: () => window.errorTestingService.activate(),
  deactivate: () => window.errorTestingService.deactivate(),
  
  // Quick test functions
  simulateRateLimit: () => {
    console.log('🔥 Testing rate limit error...');
    fetch('/api/logs?test-error=429');
  },
  
  simulateServerError: () => {
    console.log('💥 Testing server error...');
    fetch('/api/logs?test-error=500');
  },
  
  simulateNetworkError: () => {
    console.log('📡 Testing network error...');
    fetch('/api/logs?test-error=network');
  }
};

console.log(`
🧪 Error Testing Service loaded!

Usage:
  window.testErrors.activate()     - Start intercepting API calls
  window.testErrors.deactivate()   - Stop intercepting API calls
  
Quick tests:
  window.testErrors.simulateRateLimit()
  window.testErrors.simulateServerError() 
  window.testErrors.simulateNetworkError()

Or visit /test-errors in the app for a visual interface!
`);

export default window.errorTestingService;
