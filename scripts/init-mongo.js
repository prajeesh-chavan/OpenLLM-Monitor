// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time
// Credentials are read from environment variables set in docker-compose

// Switch to the openllm-monitor database
db = db.getSiblingDB("openllm-monitor");

// Create a user for the application
// Uses env vars: MONGO_APP_USERNAME, MONGO_APP_PASSWORD (set via docker-compose)
const appUser = process.env.MONGO_APP_USERNAME || "openllm-user";
const appPassword = process.env.MONGO_APP_PASSWORD;

if (!appPassword) {
  print("WARNING: MONGO_APP_PASSWORD not set. Skipping app user creation.");
  print("Set MONGO_APP_PASSWORD environment variable for secure setup.");
} else {
  db.createUser({
    user: appUser,
    pwd: appPassword,
    roles: [
      {
        role: "readWrite",
        db: "openllm-monitor",
      },
    ],
  });
  print("Created application user: " + appUser);
}

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
