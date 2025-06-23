# Database & Models - Detailed Documentation

## 🎯 Database Overview

The OpenLLM Monitor uses MongoDB as its primary database with Mongoose ODM for data modeling. The system stores all LLM interactions, analytics data, and system metadata in a structured, queryable format that supports complex analytics and reporting.

## 📁 Files Involved

### Database Configuration

- `config/db.js` - Database connection and configuration
- `config/env.js` - Environment variables and database settings

### Model Files

- `models/Log.js` - Main log entry schema (239 lines)

## 🗄️ Database Configuration (`config/db.js`)

### Connection Setup

```javascript
const mongoose = require("mongoose");
const config = require("./env");

class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
      };

      this.connection = await mongoose.connect(config.mongodb.uri, options);
      this.isConnected = true;

      console.log("✅ Connected to MongoDB");
      return this.connection;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }
}
```

### Connection Options Explained

- **maxPoolSize**: Maximum 10 concurrent connections
- **serverSelectionTimeoutMS**: 5 seconds to find MongoDB server
- **socketTimeoutMS**: 45 seconds socket timeout
- **bufferMaxEntries**: Disable command buffering when disconnected
- **bufferCommands**: Disable command buffering

## 📋 Log Model (`models/Log.js`)

### Schema Overview

The Log model is the core data structure that stores all LLM interaction data.

### Complete Schema Structure

#### Request Information

```javascript
{
  requestId: {
    type: String,
    required: true,
    unique: true,      // Ensures no duplicate requests
    index: true        // Fast lookups by requestId
  }
}
```

#### Provider & Model Information

```javascript
{
  provider: {
    type: String,
    required: true,
    enum: ["openai", "openrouter", "mistral", "ollama"],
    index: true        // Fast filtering by provider
  },

  model: {
    type: String,
    required: true,
    index: true        // Fast filtering by model
  }
}
```

#### Prompt & Response Data

```javascript
{
  prompt: {
    type: String,
    required: true     // The input text/question
  },

  completion: {
    type: String,
    default: ""        // The model's response
  },

  systemMessage: {
    type: String,
    default: ""        // System instructions
  }
}
```

#### Request Parameters

```javascript
{
  parameters: {
    temperature: { type: Number, default: 1.0 },
    maxTokens: { type: Number, default: null },
    topP: { type: Number, default: 1.0 },
    frequencyPenalty: { type: Number, default: 0 },
    presencePenalty: { type: Number, default: 0 },
    stop: [String]     // Array of stop sequences
  }
}
```

#### Performance Metrics

```javascript
{
  latency: {
    type: Number,      // Response time in milliseconds
    required: true,
    index: true        // Fast queries by performance
  }
}
```

#### Token Usage Tracking

```javascript
{
  tokenUsage: {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 }
  }
}
```

#### Cost Estimation

```javascript
{
  cost: {
    promptCost: { type: Number, default: 0 },
    completionCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    currency: { type: String, default: "USD" }
  }
}
```

#### Request Status

```javascript
{
  status: {
    type: String,
    required: true,
    enum: ["success", "error", "timeout", "rate_limited"],
    index: true        // Fast filtering by status
  }
}
```

#### Error Information

```javascript
{
  error: {
    message: String,   // Human-readable error message
    code: String,      // Error code (HTTP status, error type)
    details: mongoose.Schema.Types.Mixed  // Additional error data
  }
}
```

#### Retry Information

```javascript
{
  retryAttempts: {
    type: Number,
    default: 0         // Number of retry attempts made
  },

  retryHistory: [{
    attempt: Number,
    timestamp: Date,
    success: Boolean,
    error: String,
    latency: Number
  }]
}
```

#### Metadata

```javascript
{
  metadata: {
    isTest: { type: Boolean, default: false },        // Test vs production
    isComparison: { type: Boolean, default: false },  // Comparison test
    isReplay: { type: Boolean, default: false },      // Replay request
    originalLogId: String,                            // Reference to original log
    userAgent: String,                                // Client information
    ipAddress: String,                                // Request origin
    sessionId: String,                                // User session
    environment: String,                              // dev/staging/prod
    tags: [String],                                   // Custom tags
    customData: mongoose.Schema.Types.Mixed          // Additional data
  }
}
```

#### Timestamps

```javascript
{
  createdAt: {
    type: Date,
    default: Date.now,
    index: true        // Fast time-based queries
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Schema Options

```javascript
const logSchema = new mongoose.Schema(schemaDefinition, {
  timestamps: true, // Automatically manage createdAt/updatedAt
  versionKey: false, // Disable __v field
  collection: "logs", // Explicit collection name
});
```

## 📊 Database Indexes

### Performance Indexes

The Log model uses several indexes for optimal query performance:

```javascript
// Single field indexes
{ requestId: 1 }       // Unique lookups
{ provider: 1 }        // Provider filtering
{ model: 1 }           // Model filtering
{ status: 1 }          // Status filtering
{ createdAt: -1 }      // Time-based queries (descending)
{ latency: 1 }         // Performance queries

// Compound indexes for common query patterns
{ provider: 1, createdAt: -1 }           // Provider + time
{ status: 1, createdAt: -1 }             // Status + time
{ provider: 1, model: 1, createdAt: -1 } // Provider + model + time
{ "metadata.isTest": 1, createdAt: -1 }  // Test vs prod + time
```

### Index Strategy

- **Query Patterns**: Indexes match common query patterns
- **Sort Support**: Indexes support sorting requirements
- **Compound Keys**: Multi-field indexes for complex queries
- **Selectivity**: Most selective fields come first in compounds

## 🔍 Common Query Patterns

### Basic Queries

```javascript
// Get recent logs
await Log.find().sort({ createdAt: -1 }).limit(50);

// Get logs by provider
await Log.find({ provider: "openai" });

// Get successful requests only
await Log.find({ status: "success" });

// Get logs in date range
await Log.find({
  createdAt: {
    $gte: new Date("2025-06-01"),
    $lte: new Date("2025-06-30"),
  },
});
```

### Analytics Queries

```javascript
// Provider usage statistics
await Log.aggregate([
  { $match: { createdAt: { $gte: startDate } } },
  {
    $group: {
      _id: "$provider",
      totalRequests: { $sum: 1 },
      avgLatency: { $avg: "$latency" },
      totalCost: { $sum: "$cost.totalCost" },
    },
  },
]);

// Model performance comparison
await Log.aggregate([
  { $match: { status: "success" } },
  {
    $group: {
      _id: { provider: "$provider", model: "$model" },
      avgLatency: { $avg: "$latency" },
      successRate: { $avg: 1 },
      totalRequests: { $sum: 1 },
    },
  },
]);

// Error analysis
await Log.aggregate([
  { $match: { status: { $ne: "success" } } },
  {
    $group: {
      _id: { provider: "$provider", errorCode: "$error.code" },
      count: { $sum: 1 },
      examples: { $push: "$error.message" },
    },
  },
]);
```

### Time-Series Queries

```javascript
// Request volume over time
await Log.aggregate([
  { $match: { createdAt: { $gte: startDate } } },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" },
      },
      requests: { $sum: 1 },
      avgLatency: { $avg: "$latency" },
    },
  },
  { $sort: { _id: 1 } },
]);
```

## 🔧 Schema Validation

### Built-in Validation

```javascript
// Required fields validation
const log = new Log({
  requestId: "test-123",
  provider: "openai", // Must be in enum
  model: "gpt-3.5-turbo",
  prompt: "Hello world",
  latency: 1200,
  status: "success", // Must be in enum
});

await log.save(); // Will validate before saving
```

### Custom Validation

```javascript
// Token usage validation
logSchema.pre("save", function (next) {
  if (
    this.tokenUsage.totalTokens !==
    this.tokenUsage.promptTokens + this.tokenUsage.completionTokens
  ) {
    this.tokenUsage.totalTokens =
      this.tokenUsage.promptTokens + this.tokenUsage.completionTokens;
  }
  next();
});

// Cost calculation validation
logSchema.pre("save", function (next) {
  if (this.cost.totalCost !== this.cost.promptCost + this.cost.completionCost) {
    this.cost.totalCost = this.cost.promptCost + this.cost.completionCost;
  }
  next();
});
```

## 📈 Schema Evolution

### Version Management

```javascript
// Schema versioning for migrations
const logSchema = new mongoose.Schema({
  // ... existing fields ...

  schemaVersion: {
    type: Number,
    default: 1,
  },
});

// Migration handling
logSchema.pre("save", function (next) {
  if (!this.schemaVersion) {
    this.schemaVersion = 1;
  }
  next();
});
```

### Backward Compatibility

```javascript
// Handle legacy data
logSchema.virtual("response").get(function () {
  return this.completion; // Alias for backward compatibility
});

logSchema.virtual("duration").get(function () {
  return this.latency; // Alias for test compatibility
});
```

## 🗃️ Collection Statistics

### Storage Estimation

```javascript
// Average document size: ~2-5KB
// Fields breakdown:
// - Prompt: 500-2000 characters
// - Completion: 1000-4000 characters
// - Metadata: 500-1000 characters
// - Schema overhead: ~500 characters

// For 1M requests:
// Estimated storage: 2-5 GB
// With indexes: 2.5-6 GB
```

### Growth Projections

```javascript
// Daily volume estimates:
// Small deployment: 1,000-10,000 requests/day
// Medium deployment: 10,000-100,000 requests/day
// Large deployment: 100,000+ requests/day

// Monthly growth:
// Small: 30K-300K documents, 60-1500 MB
// Medium: 300K-3M documents, 600-15000 MB
// Large: 3M+ documents, 6+ GB
```

## 🔒 Data Retention & Cleanup

### Retention Policies

```javascript
// Automatic cleanup of old logs
const cleanupOldLogs = async (retentionDays = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await Log.deleteMany({
    createdAt: { $lt: cutoffDate },
    "metadata.isTest": true, // Only delete test data
  });

  console.log(`Deleted ${result.deletedCount} old test logs`);
};

// Archive old production logs
const archiveOldLogs = async (archiveDays = 365) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - archiveDays);

  // Export to archive storage before deletion
  const oldLogs = await Log.find({
    createdAt: { $lt: cutoffDate },
    "metadata.isTest": false,
  });

  // Archive logic here...

  await Log.deleteMany({
    createdAt: { $lt: cutoffDate },
    "metadata.isTest": false,
  });
};
```

## 🎯 Usage Examples

### Creating a Log Entry

```javascript
const log = new Log({
  requestId: "req-123-abc",
  provider: "openai",
  model: "gpt-3.5-turbo",
  prompt: "Explain quantum computing",
  completion: "Quantum computing is...",
  systemMessage: "You are a helpful assistant",
  parameters: {
    temperature: 0.7,
    maxTokens: 1000,
  },
  latency: 1250,
  tokenUsage: {
    promptTokens: 50,
    completionTokens: 200,
    totalTokens: 250,
  },
  cost: {
    promptCost: 0.000075,
    completionCost: 0.0004,
    totalCost: 0.000475,
  },
  status: "success",
  metadata: {
    isTest: false,
    userAgent: "OpenLLM-Monitor/1.0",
  },
});

await log.save();
```

### Querying Logs

```javascript
// Get paginated logs with filtering
const logs = await Log.find({
  provider: "openai",
  createdAt: { $gte: new Date("2025-06-01") },
})
  .sort({ createdAt: -1 })
  .skip(0)
  .limit(50)
  .lean(); // For read-only operations

// Get analytics data
const stats = await Log.aggregate([
  { $match: { status: "success" } },
  {
    $group: {
      _id: null,
      totalRequests: { $sum: 1 },
      avgLatency: { $avg: "$latency" },
      totalCost: { $sum: "$cost.totalCost" },
    },
  },
]);
```

The Database & Models layer provides the foundation for all data storage and retrieval in the OpenLLM Monitor system, ensuring data integrity, performance, and scalability for comprehensive LLM monitoring and analytics.
