# Logs Management Feature - Detailed Documentation

## 🎯 Feature Overview

The Logs Management feature handles storage, retrieval, and analysis of all LLM interaction logs. It provides comprehensive logging functionality with filtering, pagination, search capabilities, and dashboard statistics for monitoring system activity.

## 📁 Files Involved

### 1. Route File: `routes/logs.js`

**Purpose**: Defines API endpoints for log management
**Size**: 80 lines

#### Endpoints Defined:

- `GET /api/logs` - Get logs with filtering and pagination
- `POST /api/logs` - Create new log entry
- `GET /api/logs/stats` - Dashboard statistics
- `GET /api/logs/models/comparison` - Model performance comparison
- `GET /api/logs/errors/analysis` - Error analysis
- `GET /api/logs/export` - Export logs to CSV
- `GET /api/logs/search` - Advanced search functionality
- `DELETE /api/logs/cleanup` - Clean old logs

### 2. Controller File: `controllers/logController.js`

**Purpose**: Contains all log management business logic
**Size**: 579 lines
**Main Class**: `LogController`

### 3. Model File: `models/Log.js`

**Purpose**: Defines the database schema for log entries
**Database**: MongoDB with Mongoose ODM

## 🔧 Detailed Method Breakdown

### LogController Class Methods

### Method 1: `getLogs(req, res)` - Log Retrieval with Filtering

#### Purpose

Retrieves logs with comprehensive filtering, pagination, and search capabilities.

#### Input Parameters (req.query)

- `page` (optional) - Page number, default: 1
- `limit` (optional) - Records per page, default: 50
- `provider` (optional) - Filter by provider(s), can be array
- `model` (optional) - Filter by model(s), can be array
- `status` (optional) - Filter by status(es), can be array
- `startDate` (optional) - Filter from date (ISO string)
- `endDate` (optional) - Filter to date (ISO string)
- `sortBy` (optional) - Sort field, default: "createdAt"
- `sortOrder` (optional) - Sort direction, default: "desc"
- `search` (optional) - Text search in prompt/completion/model

#### Process Flow

1. **Parameter Parsing**: Extracts and validates query parameters
2. **Filter Building**: Constructs MongoDB filter object
3. **Search Logic**: Implements text search across multiple fields
4. **Pagination Setup**: Calculates skip/limit for pagination
5. **Database Query**: Executes find query with sorting and pagination
6. **Result Processing**: Formats response with pagination metadata

#### Filter Building Logic

```javascript
const filter = {};

// Provider filtering (supports multiple providers)
if (provider) {
  filter.provider = {
    $in: Array.isArray(provider) ? provider : [provider],
  };
}

// Date range filtering
if (startDate || endDate) {
  filter.createdAt = {};
  if (startDate) filter.createdAt.$gte = new Date(startDate);
  if (endDate) filter.createdAt.$lte = new Date(endDate);
}

// Text search across multiple fields
if (search) {
  filter.$or = [
    { prompt: { $regex: search, $options: "i" } },
    { completion: { $regex: search, $options: "i" } },
    { model: { $regex: search, $options: "i" } },
  ];
}
```

#### Pagination Implementation

- **Skip Calculation**: `(page - 1) * limit`
- **Total Count**: Separate query for total matching records
- **Metadata**: Provides navigation information

#### Response Format

```javascript
{
  success: true,
  data: {
    logs: [
      {
        _id: "64a...",
        requestId: "test-123-abc",
        provider: "openai",
        model: "gpt-3.5-turbo",
        prompt: "Hello world",
        completion: "Hello! How can I help you?",
        tokenUsage: { promptTokens: 2, completionTokens: 8, totalTokens: 10 },
        cost: { totalCost: 0.0001 },
        latency: 1200,
        status: "success",
        createdAt: "2025-06-22T10:30:00.000Z"
      }
      // ... more logs
    ],
    pagination: {
      currentPage: 1,
      totalPages: 25,
      totalCount: 1250,
      hasNextPage: true,
      hasPrevPage: false,
      limit: 50
    }
  }
}
```

### Method 2: `getLogById(req, res)` - Single Log Retrieval

#### Purpose

Retrieves a specific log entry by its MongoDB ObjectId.

#### Input Parameters (req.params)

- `id` (required) - MongoDB ObjectId of the log

#### Process Flow

1. **ID Validation**: Validates ObjectId format using regex
2. **Database Query**: Finds log by ID using `findById()`
3. **Existence Check**: Returns 404 if log not found
4. **Response**: Returns complete log data

#### Validation Logic

```javascript
// Validate MongoDB ObjectId format
if (!id.match(/^[0-9a-fA-F]{24}$/)) {
  return res.status(400).json({
    success: false,
    error: "Invalid log ID format",
  });
}
```

### Method 3: `createLog(req, res)` - Log Creation

#### Purpose

Creates new log entries in the database.

#### Input Parameters (req.body)

- All log fields as defined in Log schema
- `requestId` (optional) - Auto-generated if not provided

#### Process Flow

1. **Request ID Generation**: Creates UUID if not provided
2. **Data Preparation**: Merges request data with generated ID
3. **Validation**: Mongoose schema validation
4. **Database Save**: Saves to MongoDB
5. **Response**: Returns created log with ID

#### Key Features

- **Auto ID Generation**: Uses UUID v4 for unique request IDs
- **Schema Validation**: Mongoose validates all fields
- **Error Handling**: Catches validation and database errors

### Method 4: `updateLog(req, res)` - Log Updates

#### Purpose

Updates existing log entries (used for status updates, error corrections).

#### Input Parameters

- `req.params.id` - Log ID to update
- `req.body` - Update data

#### Process Flow

1. **Find and Update**: Uses `findByIdAndUpdate()`
2. **Validation**: Runs schema validators on update
3. **Return Updated**: Returns updated document
4. **Error Handling**: Handles not found and validation errors

#### Update Options

```javascript
{
  new: true,           // Return updated document
  runValidators: true  // Run schema validation
}
```

### Method 5: `getStats(req, res)` - Dashboard Statistics

#### Purpose

Provides summary statistics for dashboard displays.

#### Key Metrics

- **Request Counts**: Total, successful, failed requests
- **Performance**: Average response times
- **Cost Summary**: Total spending, cost per request
- **Provider Distribution**: Usage by provider
- **Recent Activity**: Latest activity patterns

#### Process Flow

1. **Time Range**: Calculates relevant time period (last 24h default)
2. **Aggregation**: MongoDB aggregation pipeline for statistics
3. **Calculation**: Computes derived metrics (rates, averages)
4. **Formatting**: Structures data for dashboard consumption

#### MongoDB Aggregation Example

```javascript
await Log.aggregate([
  { $match: { createdAt: { $gte: startDate } } },
  {
    $group: {
      _id: null,
      totalRequests: { $sum: 1 },
      successfulRequests: {
        $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
      },
      avgLatency: { $avg: "$latency" },
      totalCost: { $sum: "$cost.totalCost" },
    },
  },
]);
```

### Method 6: `getModelComparison(req, res)` - Model Performance

#### Purpose

Compares performance metrics across different models.

#### Comparison Metrics

- **Response Time**: Average latency per model
- **Success Rate**: Percentage of successful requests
- **Cost Efficiency**: Cost per token, cost per request
- **Usage Volume**: Request count per model

#### Process Flow

1. **Model Grouping**: Groups logs by provider and model
2. **Metric Calculation**: Computes performance statistics
3. **Ranking**: Orders models by specified criteria
4. **Visualization Data**: Formats for chart/graph display

### Method 7: `getErrorAnalysis(req, res)` - Error Analysis

#### Purpose

Analyzes error patterns and failure modes.

#### Error Categories

- **Rate Limiting**: API rate limit exceeded
- **Timeouts**: Request timeout errors
- **Authentication**: API key/permission errors
- **Model Errors**: Model-specific failures
- **Network Errors**: Connectivity issues

#### Analysis Dimensions

- **Error Frequency**: Count by error type
- **Error Trends**: Error patterns over time
- **Provider Reliability**: Error rates by provider
- **Recovery Success**: Retry success rates

### Method 8: `exportLogs(req, res)` - Data Export

#### Purpose

Exports filtered logs to CSV format for external analysis.

#### Export Features

- **Format Options**: CSV, JSON (extensible)
- **Field Selection**: Choose which fields to export
- **Filtering**: Same filters as getLogs method
- **Streaming**: Handles large datasets efficiently

#### Process Flow

1. **Filter Application**: Uses same filtering logic as getLogs
2. **Data Streaming**: Streams results to avoid memory issues
3. **Format Conversion**: Converts to requested format
4. **Download**: Sends file as attachment

## 🗄️ Database Schema (Log Model)

### Core Fields

```javascript
{
  requestId: String,        // Unique request identifier
  provider: String,         // LLM provider (openai, ollama, etc.)
  model: String,           // Model name
  prompt: String,          // Input prompt
  systemMessage: String,   // System instructions
  completion: String,      // Model response
  status: String,          // success, error, timeout, etc.
  latency: Number,         // Response time in ms
  createdAt: Date,         // Timestamp
  updatedAt: Date          // Last modification
}
```

### Usage Tracking

```javascript
{
  tokenUsage: {
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number
  },
  cost: {
    promptCost: Number,
    completionCost: Number,
    totalCost: Number
  }
}
```

### Metadata

```javascript
{
  parameters: {
    temperature: Number,
    maxTokens: Number,
    topP: Number,
    // ... other parameters
  },
  metadata: {
    isTest: Boolean,
    isComparison: Boolean,
    userAgent: String,
    ipAddress: String,
    // ... other metadata
  }
}
```

### Error Information

```javascript
{
  error: String,           // Error message
  errorType: String,       // Error category
  retryAttempts: Number,   // Number of retries
  stack: String            // Error stack trace
}
```

## 🔄 Data Flow Diagram

```
Client Request
     ↓
Route Handler (/api/logs/*)
     ↓
LogController Method
     ↓
Filter/Validation Processing
     ↓
MongoDB Query (with aggregation if needed)
     ↓
Data Processing & Formatting
     ↓
Response Generation
     ↓
Client Response
```

## 🔍 Search and Filtering Capabilities

### Text Search

- **Multi-field Search**: Searches across prompt, completion, model
- **Case Insensitive**: Uses regex with 'i' option
- **Partial Matching**: Supports partial text matches

### Advanced Filtering

- **Provider Filter**: Single or multiple providers
- **Model Filter**: Single or multiple models
- **Status Filter**: Filter by success/error status
- **Date Range**: Start and end date filtering
- **Combined Filters**: All filters work together

### Sorting Options

- **Sort Fields**: Any field in the schema
- **Sort Direction**: Ascending or descending
- **Default Sorting**: By createdAt descending (newest first)

## 📊 Performance Optimizations

### Database Indexes

```javascript
// Recommended indexes for performance
{
  createdAt: -1,           // For time-based queries
  provider: 1,             // For provider filtering
  model: 1,                // For model filtering
  status: 1,               // For status filtering
  requestId: 1             // For unique lookups
}

// Compound indexes for common filter combinations
{
  provider: 1,
  createdAt: -1
}
```

### Query Optimization

- **Lean Queries**: Uses `.lean()` for read-only operations
- **Field Selection**: Projects only needed fields
- **Pagination**: Limits result size for large datasets
- **Aggregation**: Uses MongoDB aggregation for complex analytics

## 🚨 Error Handling

### Validation Errors

- **MongoDB ObjectId**: Validates ID format before query
- **Date Validation**: Validates date strings and ranges
- **Parameter Validation**: Checks required fields and formats

### Database Errors

- **Connection Errors**: Handles database connectivity issues
- **Query Errors**: Catches and logs query execution errors
- **Validation Errors**: Handles schema validation failures

### Error Response Format

```javascript
{
  success: false,
  error: "Human-readable error message",
  details: "Technical error details"
}
```

## 🎯 Usage Examples

### Get Recent Logs

```bash
GET /api/logs?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

### Filter by Provider and Date

```bash
GET /api/logs?provider=openai&startDate=2025-06-20&endDate=2025-06-22
```

### Search for Specific Content

```bash
GET /api/logs?search=quantum%20computing
```

### Get Error Logs Only

```bash
GET /api/logs?status=error&status=timeout
```

### Export Filtered Data

```bash
GET /api/logs/export?provider=openai&startDate=2025-06-01&format=csv
```

The Logs Management feature serves as the data foundation for the entire OpenLLM Monitor system, providing comprehensive storage, retrieval, and analysis capabilities for all LLM interactions.
