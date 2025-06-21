# OpenLLM Monitor - User Guide

_User guide and project by Prajeesh Chavan_

Welcome to OpenLLM Monitor! This comprehensive guide will help you understand and effectively use all the enhanced features of the system, including the latest UI/UX improvements and new capabilities.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Enhanced Dashboard Overview](#enhanced-dashboard-overview)
3. [Smart Alerts & Notifications](#smart-alerts--notifications)
4. [Advanced Log Management](#advanced-log-management)
5. [Enhanced Model Testing](#enhanced-model-testing)
6. [Live Feed & Real-time Updates](#live-feed--real-time-updates)
7. [Keyboard Shortcuts & Power User Features](#keyboard-shortcuts--power-user-features)
8. [Settings & Configuration](#settings--configuration)
9. [Performance Monitoring](#performance-monitoring)
10. [Mobile & Responsive Experience](#mobile--responsive-experience)
11. [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### First Time Experience

1. **Enhanced Loading Screen**
   - Beautiful animated loading experience with gradient backgrounds
   - Smooth transitions and loading indicators
   - Minimum 2.5-second showcase of loading animations

2. **Access the Dashboard**
   - Navigate to `http://localhost:5173`
   - Experience the modernized dashboard with improved layout
   - Enjoy the responsive design that adapts to your screen size

3. **Connection Status**
   - Check the enhanced connection indicator in the top header
   - Green dot with animation = System connected and healthy
   - Red dot = Connection issues (with detailed error information)
   - Yellow/Orange = Reconnecting with progress indication

4. **Smart Alerts Setup**
   - Notice the bell icon in the top header for notifications
   - Configure alert preferences in the enhanced settings modal
   - Test notifications with the built-in testing system

### Enhanced Navigation

The application features a completely modernized interface:

- **Top Header**: Enhanced header with auto-refresh controls, smart alerts, and settings access
- **Live Feed**: Toggle live feed mode for real-time activity monitoring
- **Keyboard Shortcuts**: Built-in shortcuts for power users
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: CSS animations for better user experience

## 📊 Enhanced Dashboard Overview

The dashboard provides a comprehensive overview with significant UI/UX improvements:

### Enhanced Key Metrics Cards

1. **Total Requests**
   - Shows total number of API calls with enhanced visual design
   - Includes success and failure counts with color-coded indicators
   - Real-time updates with smooth animations
   - Hover effects and improved interaction feedback

2. **Total Cost**
   - Cumulative cost tracking with improved cost visualization
   - Enhanced provider and model breakdown
   - Cost trends with interactive charts
   - Visual cost alerts and warnings

3. **Average Latency**
   - Response time metrics with performance indicators
   - Enhanced provider comparison visualization
   - Performance trends with detailed analysis
   - Visual performance alerts

4. **Success Rate**
   - Percentage of successful requests with visual progress indicators
   - Enhanced error rate tracking with pattern analysis
   - Reliability metrics with historical comparison
   - Visual reliability indicators

### Advanced Real-time Features

1. **Enhanced Charts & Visualizations**
   - Responsive charts that adapt to screen size
   - Interactive hover states and tooltips
   - Smooth animations and transitions
   - Export capabilities for reporting

2. **Live Feed Integration**
   - Toggle live feed mode for real-time monitoring
   - Activity counter with animated indicators
   - Recent activity panel with detailed log previews
   - Real-time notifications for new requests

3. **Smart Dashboard Interactions**
   - Keyboard shortcuts for quick navigation
   - Auto-refresh controls with user preferences
   - Enhanced filtering and search capabilities
   - Contextual quick actions

## 🔔 Smart Alerts & Notifications

### Enhanced Alert System

The new alert system provides intelligent monitoring with beautiful UI:

1. **Bell Icon Notifications**
   - Located in the top header with badge count
   - Animated notification indicators
   - Color-coded alert priorities
   - Quick preview of active alerts

2. **Alert Types & Intelligence**
   - **High Retry Rate**: Detects connectivity issues (>20%)
   - **Error Rate Spikes**: Monitors error patterns (>15%)
   - **Cost Thresholds**: Budget monitoring ($50+ daily)
   - **Performance Issues**: Latency warnings (>2 seconds)

3. **Enhanced Alert Details**
   - Full-screen modal with comprehensive information
   - Current metrics vs. threshold comparisons
   - Impact analysis and recommendations
   - Historical context and trends

4. **Alert Management**
   - Individual alert dismissal
   - Bulk alert clearing
   - Auto-dismissal for resolved issues
   - Alert history tracking

## 📋 Advanced Log Management

### Interactive Log Table

The log management system has been completely enhanced:

1. **Advanced Table Features**
   - Expandable rows for detailed information
   - Multi-column sorting with visual indicators
   - Bulk selection and operations
   - Enhanced pagination controls

2. **Real-time Log Streaming**
   - WebSocket-powered real-time updates
   - Live log feed with activity counters
   - Automatic refresh with user controls
   - Visual indicators for new logs

3. **Enhanced Filtering & Search**
   - Multi-dimensional filtering system
   - Real-time search with instant results
   - Saved filter combinations
   - Advanced date range selection

4. **Log Details Modal**
   - Full-screen detailed view with enhanced design
   - Syntax highlighting for code and JSON
   - Copy-to-clipboard functionality
   - Enhanced metadata display

## 🧪 Enhanced Model Testing

### Redesigned Testing Interface

The model testing feature has been completely redesigned:

1. **Template Categories**
   - **Quick Start**: Simple interactions and basic testing
   - **Development**: Code review, debugging, documentation
   - **Creative**: Story writing, brainstorming, content creation
   - **Analysis**: Data insights, research, competitive analysis

2. **Advanced Testing Features**
   - Step-by-step wizard interface
   - Real-time cost estimation
   - Parameter validation and guidance
   - Progress tracking for batch tests

3. **Enhanced Comparison Mode**
   - Side-by-side model comparison
   - Performance metrics analysis
   - Cost-benefit analysis
   - Quality assessment tools

4. **Prompt Management**
   - Save and organize custom prompts
   - Template library with categorization
   - Prompt history and versioning
   - Export and sharing capabilities

## 📡 Live Feed & Real-time Updates

### Live Activity Monitoring

1. **Live Feed Toggle**
   - Located in bottom-left corner
   - Real-time activity counter
   - Visual activity indicators
   - Pause/resume functionality

2. **Activity Panel**
   - Recent log previews
   - Status indicators and timestamps
   - Quick action buttons
   - Expandable details

3. **WebSocket Integration**
   - Real-time data streaming
   - Connection status monitoring
   - Automatic reconnection
   - Error handling and recovery

## ⌨️ Keyboard Shortcuts & Power User Features

### Built-in Shortcuts

1. **Global Shortcuts**
   - `Cmd/Ctrl + K`: Global search
   - `R`: Quick replay (when not in input fields)
   - `Escape`: Close modals and overlays

2. **Navigation Shortcuts**
   - Quick access to key features
   - Modal dismissal
   - Search activation

3. **Power User Features**
   - Keyboard-first navigation
   - Quick actions and commands
   - Efficient workflow patterns
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

## ⚙️ Settings & Configuration

### Enhanced Settings Modal

Access comprehensive settings through the gear icon in the top header:

1. **Tabbed Interface**
   - **General**: Basic system preferences
   - **Providers**: API key management and testing
   - **Notifications**: Alert and notification preferences
   - **Appearance**: Theme and display options
   - **Security**: Access control and audit settings

2. **Notification Settings**
   - **Activity Notifications**: New requests and system activity
   - **Error Notifications**: Error alerts and warnings
   - **Cost Notifications**: Budget and spending alerts
   - **Performance Notifications**: Latency and performance warnings
   - **Test Notifications**: Built-in notification testing

3. **Provider Management**
   - Add and configure API keys
   - Test provider connections
   - Set provider priorities
   - Monitor provider health

4. **Appearance Options**
   - Light/Dark mode toggle (dark mode coming soon)
   - Layout preferences
   - Chart and visualization options
   - Mobile optimization settings

## 📊 Performance Monitoring

### Enhanced Performance Modal

Access detailed performance metrics through the dedicated performance modal:

1. **Comprehensive Metrics**
   - Latency analysis with percentiles
   - Token usage statistics
   - Cost breakdown by provider
   - Success/failure rate tracking

2. **Visual Performance Indicators**
   - Color-coded performance metrics
   - Interactive charts and graphs
   - Historical trend analysis
   - Comparative performance data

3. **Performance Alerts**
   - Automated performance monitoring
   - Threshold-based alerting
   - Performance degradation detection
   - Optimization recommendations

## 📱 Mobile & Responsive Experience

### Mobile Optimization

The entire interface has been optimized for mobile devices:

1. **Responsive Design**
   - Adaptive layouts for all screen sizes
   - Touch-friendly interface elements
   - Optimized typography and spacing
   - Mobile-specific navigation patterns

2. **Mobile-Specific Features**
   - Safe area support for devices with notches
   - Touch-optimized controls
   - Gesture-friendly interactions
   - Mobile-optimized modals and overlays

3. **Performance on Mobile**
   - Optimized animations and transitions
   - Efficient data loading
   - Smooth scrolling and interactions
   - Battery-conscious design

## 🎯 Quick Reference

### Enhanced Navigation Shortcuts

- **Dashboard**: Overview with enhanced real-time metrics
- **Logs**: Advanced log management with interactive table
- **Analytics**: Comprehensive performance insights with enhanced charts
- **Test Models**: Redesigned testing interface with templates
- **Settings**: Comprehensive configuration modal

### Enhanced Key Features

- ✅ **Real-time monitoring** with live feed toggle
- ✅ **Smart alerts** with bell icon notifications
- ✅ **Enhanced UI/UX** with animations and responsive design
- ✅ **Keyboard shortcuts** for power users
- ✅ **Mobile optimization** with touch-friendly interface
- ✅ **Advanced testing** with template categories
- ✅ **Performance monitoring** with detailed analytics
- ✅ **Live activity feed** with real-time updates

### Support Resources

- 📖 [README.md](../README.md) - Setup and installation
- 🔧 [API Documentation](./API_DOCUMENTATION.md) - API reference  
- 🚀 [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- 📊 [Development Guide](./DEVELOPMENT.md) - Development status and testing
- ⚡ [Features Guide](./FEATURES.md) - Complete feature overview

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
