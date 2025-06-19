# OpenLLM Monitor - User Guide

_User guide and project by Prajeesh Chavan_

Welcome to OpenLLM Monitor! This comprehensive guide will help you understand and effectively use all the features of the system.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Monitoring LLM Requests](#monitoring-llm-requests)
4. [Analyzing Performance](#analyzing-performance)
5. [Replaying Prompts](#replaying-prompts)
6. [Provider Management](#provider-management)
7. [Advanced Analytics](#advanced-analytics)
8. [Making API Calls Through Frontend](#-making-api-calls-through-frontend)
9. [Troubleshooting](#troubleshooting)
10. [Making API Calls Through Frontend](#making-api-calls-through-frontend)

## 🚀 Getting Started

### First Time Setup

1. **Access the Dashboard**

   - Open your browser and navigate to `http://localhost:5173`
   - You'll see the main dashboard with real-time metrics

2. **Verify Connection**

   - Check the connection status indicator in the top header
   - Green dot = System is running and connected
   - Red dot = Connection issues (check backend server)

3. **Configure Providers** (Optional)
   - Navigate to **Settings** → **Providers**
   - Add your API keys for the LLM providers you want to monitor
   - Test connections to ensure everything is working

### Navigation

The application has a clean, intuitive interface:

- **Header**: Shows connection status, refresh controls, and user actions
- **Sidebar**: Main navigation menu with all features
- **Main Content**: The active page content
- **Real-time Updates**: Live data updates via WebSocket

## 📊 Dashboard Overview

The dashboard provides a comprehensive overview of your LLM usage:

### Key Metrics Cards

1. **Total Requests**

   - Shows total number of API calls made
   - Includes success and failure counts
   - Updates in real-time

2. **Total Cost**

   - Cumulative cost across all providers
   - Breaks down by provider and model
   - Includes cost trends

3. **Average Latency**

   - Response time metrics
   - Provider comparison
   - Performance trends

4. **Success Rate**
   - Percentage of successful requests
   - Error rate tracking
   - Reliability metrics

### Real-time Charts

1. **Request Volume Over Time**

   - Hourly/daily request patterns
   - Provider breakdown
   - Trend analysis

2. **Cost Analysis**

   - Cost distribution by provider
   - Daily/weekly spending patterns
   - Budget tracking

3. **Performance Metrics**

   - Latency distribution
   - Provider performance comparison
   - Response time trends

4. **Error Analysis**
   - Error types and frequencies
   - Provider-specific issues
   - Resolution tracking

## 🔍 Monitoring LLM Requests

### Viewing Logs

Navigate to **Logs** to see all your LLM requests:

#### Log Table Features

- **Real-time Updates**: New requests appear automatically
- **Pagination**: Navigate through large datasets
- **Sorting**: Click column headers to sort
- **Filtering**: Use multiple filters simultaneously

#### Available Columns

- **Timestamp**: When the request was made
- **Provider**: Which LLM service (OpenAI, Ollama, etc.)
- **Model**: Specific model used (gpt-4, llama2, etc.)
- **Status**: Success/Error indicator
- **Tokens**: Input/output token counts
- **Cost**: Request cost calculation
- **Duration**: Response time in milliseconds

### Filtering Options

#### Basic Filters

1. **Provider Filter**

   - Select specific providers to view
   - Multi-select supported
   - Options: OpenAI, Ollama, OpenRouter, Mistral

2. **Model Filter**

   - Filter by specific models
   - Dynamically populated based on your usage
   - Examples: gpt-4, gpt-3.5-turbo, llama2

3. **Status Filter**

   - Success: Completed requests
   - Error: Failed requests
   - All: Show everything

4. **Date Range**
   - Custom date range selection
   - Preset options: Today, Yesterday, Last 7 days, Last 30 days
   - Custom range picker

#### Advanced Filters

1. **Search**

   - Full-text search across prompts and responses
   - Case-insensitive
   - Supports partial matches

2. **Cost Range**

   - Filter by cost thresholds
   - Useful for identifying expensive requests
   - Min/max cost filters

3. **Duration Range**
   - Filter by response time
   - Identify slow requests
   - Performance optimization

### Log Details

Click on any log entry to view full details:

#### Request Information

- **Prompt**: Full input text
- **Response**: Complete AI response
- **Parameters**: Temperature, max tokens, etc.
- **Metadata**: Additional request context

#### Performance Metrics

- **Token Usage**: Detailed breakdown
- **Cost Calculation**: How the cost was determined
- **Timing**: Request lifecycle timing
- **Provider Info**: API endpoint, version, etc.

#### Error Details (if applicable)

- **Error Type**: Classification of the error
- **Error Message**: Detailed error description
- **Stack Trace**: Technical debugging information
- **Suggested Solutions**: Troubleshooting tips

## 📈 Analyzing Performance

### Analytics Dashboard

Navigate to **Analytics** for comprehensive insights:

#### Usage Analytics

1. **Request Patterns**

   - Peak usage times
   - Daily/weekly trends
   - Seasonal patterns

2. **Provider Comparison**

   - Usage distribution across providers
   - Performance comparison
   - Cost-effectiveness analysis

3. **Model Performance**
   - Response time comparison
   - Accuracy metrics (if available)
   - Cost per token analysis

#### Cost Analytics

1. **Spending Trends**

   - Daily/weekly/monthly costs
   - Budget tracking
   - Cost projections

2. **Provider Cost Breakdown**

   - Cost by provider
   - Most expensive models
   - Cost optimization opportunities

3. **Efficiency Metrics**
   - Cost per successful request
   - Token efficiency
   - ROI analysis

#### Performance Analytics

1. **Latency Analysis**

   - Response time distributions
   - Provider performance comparison
   - Performance trends over time

2. **Error Analysis**

   - Error rate trends
   - Common error types
   - Provider reliability

3. **Success Metrics**
   - Success rate by provider
   - Retry success rates
   - Performance consistency

### Exporting Data

1. **Export Options**

   - CSV format for spreadsheet analysis
   - JSON format for programmatic use
   - PDF reports for sharing

2. **Custom Reports**
   - Select specific date ranges
   - Choose relevant metrics
   - Filter by provider/model

## 🔄 Replaying Prompts

### Prompt Replay Feature

Navigate to **Replay** to re-run prompts:

#### Single Prompt Replay

1. **Select Source**

   - Choose from existing logs
   - Enter new prompt manually
   - Import from file

2. **Configure Replay**

   - Select provider and model
   - Adjust parameters (temperature, max tokens)
   - Set custom configurations

3. **Execute Replay**
   - Run the prompt
   - View results in real-time
   - Compare with original response

#### Multi-Provider Comparison

1. **Setup Comparison**

   - Select a prompt
   - Choose multiple providers/models
   - Configure parameters for each

2. **Run Comparison**

   - Execute across all selected providers
   - View results side-by-side
   - Analyze differences

3. **Comparison Metrics**
   - Response quality (subjective)
   - Response time
   - Cost comparison
   - Token usage

### Use Cases for Replay

1. **A/B Testing**

   - Compare different models
   - Test parameter variations
   - Optimize for cost/performance

2. **Debugging**

   - Reproduce issues
   - Test fixes
   - Validate improvements

3. **Model Evaluation**
   - Compare new models
   - Benchmark performance
   - Make informed decisions

## ⚙️ Provider Management

### Provider Configuration

Navigate to **Settings** → **Providers**:

#### Supported Providers

1. **OpenAI**

   - API Key configuration
   - Model selection
   - Rate limiting settings

2. **Ollama**

   - Base URL configuration
   - Local model management
   - Custom model support

3. **OpenRouter**

   - API Key setup
   - Model access
   - Routing preferences

4. **Mistral AI**
   - API Key configuration
   - Model selection
   - European data compliance

#### Configuration Options

1. **API Keys**

   - Secure storage
   - Validation testing
   - Usage monitoring

2. **Model Preferences**

   - Default model selection
   - Cost limits
   - Performance preferences

3. **Rate Limiting**

   - Request rate controls
   - Burst limits
   - Cooldown periods

4. **Retry Settings**
   - Retry attempts
   - Backoff strategies
   - Timeout configurations

### Provider Testing

1. **Connection Testing**

   - Verify API connectivity
   - Test authentication
   - Check model availability

2. **Performance Testing**
   - Measure response times
   - Test error handling
   - Validate configurations

## 📊 Advanced Analytics

### Custom Analytics

#### Metric Customization

1. **KPI Dashboard**

   - Define custom KPIs
   - Set performance targets
   - Track progress

2. **Alert Configuration**

   - Cost thresholds
   - Performance alerts
   - Error rate monitoring

3. **Reporting Schedules**
   - Automated reports
   - Email notifications
   - Slack integrations

#### Data Visualization

1. **Chart Types**

   - Line charts for trends
   - Bar charts for comparisons
   - Pie charts for distributions
   - Heatmaps for patterns

2. **Interactive Features**
   - Drill-down capabilities
   - Zoom and pan
   - Real-time updates
   - Export options

### Business Intelligence

1. **ROI Analysis**

   - Cost vs. value metrics
   - Efficiency improvements
   - Business impact measurement

2. **Capacity Planning**

   - Usage forecasting
   - Resource planning
   - Budget projections

3. **Optimization Insights**
   - Performance bottlenecks
   - Cost optimization opportunities
   - Model recommendations

## 🛠️ Troubleshooting

### Common Issues

#### Connection Problems

**Issue**: Dashboard shows "disconnected" status

**Solutions**:

1. Check if backend server is running (`npm run dev` in backend folder)
2. Verify MongoDB is running and accessible
3. Check network connectivity
4. Review browser console for errors

**Issue**: API requests failing

**Solutions**:

1. Verify API keys are correctly configured
2. Check provider service status
3. Review rate limiting settings
4. Check firewall/proxy settings

#### Performance Issues

**Issue**: Slow dashboard loading

**Solutions**:

1. Check database performance
2. Review log volume and consider archiving
3. Optimize queries and indexes
4. Check network latency

**Issue**: High memory usage

**Solutions**:

1. Review WebSocket connections
2. Check for memory leaks in browser
3. Optimize log retention policies
4. Restart services if needed

#### Data Issues

**Issue**: Missing or incorrect data

**Solutions**:

1. Verify middleware is properly configured
2. Check database connectivity
3. Review log collection settings
4. Validate provider configurations

**Issue**: Cost calculations seem wrong

**Solutions**:

1. Verify provider pricing configurations
2. Check token counting accuracy
3. Review cost calculation logic
4. Compare with provider billing

### Getting Help

1. **Documentation**

   - Check README.md for setup instructions
   - Review API documentation
   - Read implementation status

2. **Logs and Debugging**

   - Check browser console for errors
   - Review backend server logs
   - Enable debug mode for detailed logging

3. **Community Support**
   - GitHub Issues for bug reports
   - Discussion forums for questions
   - Community contributions welcome

## 💡 Best Practices

### Monitoring Best Practices

1. **Regular Monitoring**

   - Check dashboard daily
   - Review cost trends weekly
   - Analyze performance monthly

2. **Alert Configuration**

   - Set reasonable thresholds
   - Avoid alert fatigue
   - Test alert mechanisms

3. **Data Retention**
   - Archive old logs regularly
   - Maintain performance
   - Comply with data policies

### Cost Optimization

1. **Model Selection**

   - Choose appropriate models for tasks
   - Balance cost vs. performance
   - Regular model evaluation

2. **Parameter Tuning**

   - Optimize temperature settings
   - Adjust max tokens appropriately
   - Use stop sequences effectively

3. **Batch Processing**
   - Group similar requests
   - Optimize API usage
   - Reduce overhead costs

### Security Considerations

1. **API Key Management**

   - Store keys securely
   - Rotate keys regularly
   - Monitor key usage

2. **Data Privacy**

   - Review logged data
   - Implement data retention policies
   - Consider data anonymization

3. **Access Control**
   - Implement user authentication
   - Role-based access control
   - Audit access logs

---

## 🎯 Quick Reference

### Navigation Shortcuts

- **Dashboard**: Overview and real-time metrics
- **Logs**: Detailed request history and filtering
- **Analytics**: Comprehensive performance insights
- **Replay**: Prompt testing and comparison
- **Settings**: Configuration and provider management

### Key Features

- ✅ Real-time monitoring
- ✅ Multi-provider support
- ✅ Cost tracking and analysis
- ✅ Performance monitoring
- ✅ Prompt replay and comparison
- ✅ Advanced analytics and reporting

### Support Resources

- 📖 [README.md](./README.md) - Setup and installation
- 🔧 [API Documentation](./API_DOCUMENTATION.md) - API reference
- 🚀 [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- 📊 [Implementation Status](./IMPLEMENTATION_STATUS.md) - Feature status

---

## 🔌 Making API Calls Through Frontend

OpenLLM Monitor provides a comprehensive API service layer for making backend API calls from your frontend applications.

### API Service Overview

The frontend uses a centralized API service (`api.js`) built on top of Axios for all HTTP requests. This service handles:

- Base URL configuration
- Request/response interceptors
- Error handling
- Authentication
- Request caching prevention

### Basic API Call Structure

```javascript
// Import the API service
import { ApiService } from "../services/api";

// Making API calls in a component
async function fetchData() {
  try {
    // Get data
    const logs = await ApiService.getLogs({ limit: 10, page: 1 });

    // Post data
    const result = await ApiService.replayPrompt({
      prompt: "Your prompt text",
      model: "gpt-4",
      provider: "openai",
    });

    // Handle successful response
    console.log(result);
  } catch (error) {
    // Handle errors
    console.error("API call failed:", error);
  }
}
```

### Integration with State Management

Most API calls are managed through the Zustand store for efficient state handling:

```javascript
// In your component
import { useLogsStore } from "../store";

function LogsComponent() {
  const { logs, fetchLogs, isLoading, error } = useLogsStore();

  // Trigger data loading on component mount
  useEffect(() => {
    fetchLogs({ limit: 50 });
  }, [fetchLogs]);

  // Data and loading states are automatically managed
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {logs.map((log) => (
        <LogItem key={log._id} log={log} />
      ))}
    </div>
  );
}
```

### Available API Endpoints

OpenLLM Monitor provides these key endpoints for frontend integration:

#### Logs API

| Endpoint               | Method | Description               | Parameters                                                            |
| ---------------------- | ------ | ------------------------- | --------------------------------------------------------------------- |
| `/api/logs`            | GET    | Get logs with pagination  | `limit`, `page`, `sortBy`, `sortOrder`, `provider`, `model`, `status` |
| `/api/logs/:id`        | GET    | Get a specific log by ID  | `id` in URL                                                           |
| `/api/logs/stats`      | GET    | Get log statistics        | `timeframe`, `provider`                                               |
| `/api/logs/comparison` | GET    | Compare model performance | `models[]`, `metric`                                                  |
| `/api/logs/errors`     | GET    | Get error analysis        | `timeframe`, `provider`                                               |
| `/api/logs/export`     | GET    | Export logs as CSV        | Same as GET logs                                                      |

#### Provider API

| Endpoint                          | Method | Description                   | Parameters        |
| --------------------------------- | ------ | ----------------------------- | ----------------- |
| `/api/providers`                  | GET    | List all configured providers | None              |
| `/api/providers/:provider/test`   | POST   | Test provider connection      | `provider` in URL |
| `/api/providers/:provider/models` | GET    | Get available models          | `provider` in URL |

#### Replay API

| Endpoint              | Method | Description              | Parameters                                                 |
| --------------------- | ------ | ------------------------ | ---------------------------------------------------------- |
| `/api/replay`         | POST   | Replay a prompt          | `prompt`, `model`, `provider`, `systemMessage` (optional)  |
| `/api/replay/log/:id` | POST   | Replay from existing log | `id` in URL, `model` and `provider` (optional to override) |

### Making Direct API Calls (Advanced)

For custom integrations outside the provided API Service:

```javascript
import axios from "axios";

// Create a custom axios instance
const customApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Make a direct API call
async function makeCustomAPICall() {
  try {
    const response = await customApi.post("/replay", {
      prompt: "Your custom prompt",
      provider: "ollama",
      model: "llama2",
      systemMessage: "You are a helpful assistant",
      temperature: 0.7,
    });

    // Handle the raw axios response
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Custom API call failed:", error);
    throw error;
  }
}
```

### Handling Real-time Updates

OpenLLM Monitor uses WebSockets for real-time updates:

```javascript
import { useWebSocket } from "../hooks/useWebSocket";

function RealtimeComponent() {
  const [data, setData] = useState([]);

  // Subscribe to WebSocket events
  useWebSocket({
    "new-log": (newLog) => {
      setData((prevData) => [...prevData, newLog]);
    },
    "log-updated": (updatedLog) => {
      setData((prevData) =>
        prevData.map((log) => (log._id === updatedLog._id ? updatedLog : log))
      );
    },
  });

  return <div>{/* Your component rendering */}</div>;
}
```

### Best Practices

1. **Use the API Service**: Always use the centralized API service instead of direct axios calls
2. **Error Handling**: Implement proper error handling for all API calls
3. **Loading States**: Show loading indicators during API requests
4. **Debounce Inputs**: Debounce user inputs that trigger API calls
5. **Cancel Requests**: Cancel pending requests when components unmount
6. **Pagination**: Implement pagination for large data sets
7. **Caching**: Consider caching responses for frequently accessed data

### Troubleshooting API Calls

If you encounter issues with API calls:

1. Check the browser console for error messages
2. Verify the API endpoint URL in the environment configuration
3. Ensure the backend server is running and accessible
4. Check for CORS issues if accessing the API from a different domain
5. Verify that request payloads match the expected format
6. Check network tab in browser DevTools for request/response details
