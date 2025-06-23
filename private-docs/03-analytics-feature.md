# Analytics Feature - Detailed Documentation

## 🎯 Feature Overview

The Analytics feature provides comprehensive data analysis and insights from all LLM interactions. It generates statistics, performance metrics, cost analysis, and usage patterns to help understand system behavior and optimize usage.

## 📁 Files Involved

### 1. Route File: `routes/analytics.js`

**Purpose**: Defines API endpoints for analytics functionality
**Size**: 74 lines

#### Endpoints Defined:

- `GET /api/analytics/stats` - Comprehensive statistics
- `GET /api/analytics/usage` - Usage analytics over time
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/costs` - Cost analysis
- `GET /api/analytics/providers` - Provider distribution
- `GET /api/analytics/errors` - Error analytics
- `GET /api/analytics/trends` - Usage trends
- `GET /api/analytics/dashboard` - Dashboard summary

### 2. Controller File: `controllers/analyticsController.js`

**Purpose**: Contains all analytics business logic
**Size**: 752 lines
**Structure**: Individual functions (not a class)

## 🔧 Detailed Method Breakdown

### Method 1: `getStats(req, res)` - Overall Statistics

#### Purpose

Provides comprehensive system statistics for a specified time range.

#### Input Parameters (req.query)

- `timeRange` (optional) - Time period to analyze
  - Options: "1h", "6h", "24h", "7d", "30d"
  - Default: "24h"

#### Process Flow

1. **Time Range Calculation**: Converts timeRange to start date
2. **MongoDB Aggregation**: Single pipeline to calculate all metrics
3. **Data Processing**: Calculates rates and percentages
4. **Response Formatting**: Structures data for frontend consumption

#### Time Range Logic

- **1h**: Last 1 hour
- **6h**: Last 6 hours
- **24h**: Last 24 hours (default)
- **7d**: Last 7 days
- **30d**: Last 30 days

#### MongoDB Aggregation Pipeline

```javascript
[
  {
    $match: { createdAt: { $gte: startDate } },
  },
  {
    $group: {
      _id: null,
      totalRequests: { $sum: 1 },
      successfulRequests: {
        $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
      },
      errorRequests: {
        $sum: { $cond: [{ $ne: ["$status", "success"] }, 1, 0] },
      },
      // ... more aggregations
    },
  },
];
```

#### Key Metrics Calculated

- **Request Counts**: Total, successful, errors
- **Success/Error Rates**: Percentages of successful/failed requests
- **Response Times**: Average latency across all requests
- **Cost Metrics**: Total cost, cost breakdowns
- **Token Usage**: Prompt tokens, completion tokens, total tokens
- **Retry Statistics**: Retry attempts, retry rates
- **Provider Stats**: Active providers, distribution

#### Response Format

```javascript
{
  success: true,
  data: {
    overview: {
      totalRequests: 1250,
      successfulRequests: 1180,
      errorRequests: 70,
      successRate: 94.4,
      errorRate: 5.6,
      retryRate: 8.2,
      avgDuration: 1250,
      totalCost: 2.4567,
      totalTokens: 125000,
      promptTokens: 50000,
      completionTokens: 75000,
      activeProviders: 3
    },
    timeRangeStats: {
      timeRange: "24h",
      generatedAt: "2025-06-22T10:30:00.000Z"
    }
  }
}
```

### Method 2: `getRequestVolume(req, res)` - Usage Over Time

#### Purpose

Tracks request volume patterns over time for trend analysis.

#### Input Parameters (req.query)

- `timeRange` (optional) - Time period, same options as getStats
- `interval` (optional) - Grouping interval
  - Options: "5m", "1h", "1d"
  - Auto-selected based on timeRange

#### Process Flow

1. **Interval Selection**: Chooses appropriate grouping based on time range
2. **Date Grouping**: Groups requests by time intervals
3. **Volume Calculation**: Counts requests per interval
4. **Trend Analysis**: Identifies usage patterns

#### Grouping Logic

- **1h timeRange**: Group by minutes ("%Y-%m-%d %H:%M")
- **6h/24h timeRange**: Group by hours ("%Y-%m-%d %H:00")
- **7d/30d timeRange**: Group by days ("%Y-%m-%d")

#### MongoDB Pipeline

```javascript
[
  { $match: { createdAt: { $gte: startDate } } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } },
      requests: { $sum: 1 },
      successful: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
      errors: { $sum: { $cond: [{ $ne: ["$status", "success"] }, 1, 0] } },
      avgLatency: { $avg: "$latency" },
      totalCost: { $sum: "$cost.totalCost" },
    },
  },
  { $sort: { _id: 1 } },
];
```

#### Use Cases

- **Trend Analysis**: Identify peak usage hours/days
- **Capacity Planning**: Understand usage patterns
- **Performance Monitoring**: Track response times over time
- **Cost Management**: Monitor spending patterns

### Method 3: `getModelPerformance(req, res)` - Performance Metrics

#### Purpose

Analyzes performance characteristics of different models and providers.

#### Key Metrics

- **Response Time**: Average, median, 95th percentile latency
- **Success Rate**: Percentage of successful requests per model
- **Token Efficiency**: Tokens per second, cost per token
- **Error Patterns**: Common failure modes per model

#### Process Flow

1. **Model Grouping**: Groups data by provider and model
2. **Performance Calculation**: Calculates latency statistics
3. **Efficiency Metrics**: Computes cost and token efficiency
4. **Ranking**: Orders models by performance criteria

#### MongoDB Aggregation

```javascript
[
  {
    $group: {
      _id: { provider: "$provider", model: "$model" },
      totalRequests: { $sum: 1 },
      avgLatency: { $avg: "$latency" },
      successRate: { $avg: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
      avgCost: { $avg: "$cost.totalCost" },
      avgTokens: { $avg: "$tokenUsage.totalTokens" },
    },
  },
];
```

### Method 4: `getCostAnalysis(req, res)` - Cost Analytics

#### Purpose

Provides detailed cost breakdowns and spending analysis.

#### Cost Dimensions

- **By Provider**: OpenAI vs Ollama vs Mistral costs
- **By Model**: Individual model cost efficiency
- **By Time**: Cost trends over time
- **By Usage Type**: Test vs production costs

#### Key Calculations

- **Cost per Request**: Average cost per API call
- **Cost per Token**: Efficiency metrics
- **Daily/Monthly Spending**: Projected costs
- **Cost Optimization**: Recommendations for savings

#### Process Flow

1. **Cost Aggregation**: Sums costs by various dimensions
2. **Efficiency Calculation**: Computes cost per unit metrics
3. **Trend Analysis**: Identifies cost growth patterns
4. **Recommendations**: Suggests optimization strategies

### Method 5: `getProviderDistribution(req, res)` - Provider Analytics

#### Purpose

Analyzes usage distribution across different LLM providers.

#### Metrics Tracked

- **Request Distribution**: Percentage of requests per provider
- **Cost Distribution**: Spending breakdown by provider
- **Performance Comparison**: Provider response times
- **Reliability**: Success rates by provider

#### Process Flow

1. **Provider Grouping**: Aggregates data by provider
2. **Distribution Calculation**: Computes percentages
3. **Comparison Analysis**: Ranks providers by metrics
4. **Insights Generation**: Identifies usage patterns

### Method 6: `getErrorAnalysis(req, res)` - Error Analytics

#### Purpose

Analyzes error patterns and failure modes across the system.

#### Error Categories

- **Rate Limiting**: API rate limit errors
- **Timeouts**: Request timeout failures
- **Authentication**: API key/auth errors
- **Model Errors**: Model-specific failures
- **Network Errors**: Connectivity issues

#### Analysis Dimensions

- **Error Distribution**: Types of errors over time
- **Provider Error Rates**: Which providers fail most
- **Model Reliability**: Error rates per model
- **Recovery Patterns**: Retry success rates

#### Process Flow

1. **Error Classification**: Categorizes errors by type
2. **Pattern Analysis**: Identifies error trends
3. **Impact Assessment**: Measures error impact on system
4. **Resolution Tracking**: Monitors retry success

## 🔄 Data Flow Diagram

```
Analytics Request
     ↓
Route Handler (/api/analytics/*)
     ↓
Analytics Controller Function
     ↓
MongoDB Aggregation Pipeline
     ↓
Data Processing & Calculation
     ↓
Response Formatting
     ↓
Client Response
```

## 🗄️ Database Queries

### Performance Optimization

- **Indexes**: Created on frequently queried fields
  - `createdAt` - For time-based queries
  - `provider` - For provider filtering
  - `model` - For model-specific queries
  - `status` - For success/error filtering

### Aggregation Strategies

- **Time-based Aggregation**: Groups by time intervals
- **Multi-dimensional Grouping**: Groups by provider + model
- **Conditional Aggregation**: Uses `$cond` for calculated fields
- **Pipeline Optimization**: Minimizes data processing stages

## 📊 Analytics Use Cases

### 1. System Monitoring

- **Health Dashboards**: Real-time system health
- **Performance Tracking**: Response time monitoring
- **Error Monitoring**: Failure rate tracking

### 2. Cost Management

- **Spending Tracking**: Daily/monthly cost monitoring
- **Budget Alerts**: Cost threshold notifications
- **Optimization**: Provider cost comparison

### 3. Capacity Planning

- **Usage Trends**: Growth pattern analysis
- **Peak Load**: High-traffic period identification
- **Resource Planning**: Infrastructure scaling decisions

### 4. Provider Optimization

- **Performance Comparison**: Provider benchmarking
- **Cost Efficiency**: Provider cost analysis
- **Reliability Assessment**: Provider uptime tracking

## 🚨 Error Handling

### Analytics-Specific Errors

- **Date Range Errors**: Invalid time range parameters
- **Aggregation Errors**: MongoDB aggregation failures
- **Memory Errors**: Large dataset processing issues
- **Timeout Errors**: Long-running query timeouts

### Error Response Format

```javascript
{
  success: false,
  error: "Failed to fetch statistics",
  message: "Specific error details"
}
```

## 🔧 Dependencies

### Database

- **MongoDB Aggregation Framework** - For complex data analysis
- **Log Model** - Primary data source for all analytics

### Utilities

- **Date Manipulation** - Time range calculations
- **Math Operations** - Statistical calculations
- **Data Formatting** - Response structuring

## 🎯 Usage Examples

### Overall Statistics

```bash
GET /api/analytics/stats?timeRange=24h
```

### Usage Trends

```bash
GET /api/analytics/usage?timeRange=7d&interval=1d
```

### Provider Performance

```bash
GET /api/analytics/performance?provider=openai
```

### Cost Analysis

```bash
GET /api/analytics/costs?timeRange=30d
```

The Analytics feature provides the intelligence layer of the OpenLLM Monitor system, transforming raw usage data into actionable insights for system optimization and decision-making.
