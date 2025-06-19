// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the openllm-monitor database
db = db.getSiblingDB("openllm-monitor");

// Create a user for the application
db.createUser({
  user: "openllm-user",
  pwd: "openllm-password",
  roles: [
    {
      role: "readWrite",
      db: "openllm-monitor",
    },
  ],
});

// Create collections with initial indexes
db.createCollection("logs");
db.createCollection("providers");
db.createCollection("users");

// Create indexes for better performance
db.logs.createIndex({ timestamp: -1 });
db.logs.createIndex({ provider: 1 });
db.logs.createIndex({ model: 1 });
db.logs.createIndex({ status: 1 });
db.logs.createIndex({ userId: 1 });
db.logs.createIndex({ "tokenUsage.total": 1 });
db.logs.createIndex({ cost: 1 });
db.logs.createIndex({ duration: 1 });

// Compound indexes for common queries
db.logs.createIndex({ provider: 1, timestamp: -1 });
db.logs.createIndex({ status: 1, timestamp: -1 });
db.logs.createIndex({ userId: 1, timestamp: -1 });

// Provider indexes
db.providers.createIndex({ type: 1 });
db.providers.createIndex({ enabled: 1 });

print("OpenLLM Monitor database initialized successfully!");
print("Created database: openllm-monitor");
print("Created user: openllm-user");
print("Created collections: logs, providers, users");
print("Created performance indexes");
