const mongoose = require("mongoose");
const Log = require("./models/Log");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://prajeeshchavan:23072004@cluster0.arjzpru.mongodb.net/openllm-monitor-test?retryWrites=true&w=majority&appName=Cluster0";

async function debugAnalytics() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("Connected to MongoDB");

    // Clear existing data
    await Log.deleteMany({});
    console.log("Cleared existing logs");

    // Create test data
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const testLogs = [
      {
        requestId: "test-request-1",
        provider: "openai",
        model: "gpt-3.5-turbo",
        prompt: "Test prompt 1",
        completion: "Test response 1",
        tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: {
          promptCost: 0.0005,
          completionCost: 0.0005,
          totalCost: 0.001,
          currency: "USD",
        },
        latency: 1000,
        status: "success",
        timestamp: oneHourAgo,
      },
      {
        requestId: "test-request-2",
        provider: "ollama",
        model: "llama2",
        prompt: "Test prompt 2",
        completion: "Test response 2",
        tokenUsage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
        cost: {
          promptCost: 0.001,
          completionCost: 0.001,
          totalCost: 0.002,
          currency: "USD",
        },
        latency: 1500,
        status: "success",
        timestamp: twoHoursAgo,
      },
      {
        requestId: "test-request-3",
        provider: "openai",
        model: "gpt-4",
        prompt: "Test prompt 3",
        completion: "",
        tokenUsage: { promptTokens: 12, completionTokens: 0, totalTokens: 12 },
        cost: {
          promptCost: 0.003,
          completionCost: 0,
          totalCost: 0.003,
          currency: "USD",
        },
        latency: 500,
        status: "error",
        error: { message: "API error", code: "RATE_LIMIT" },
        timestamp: twoHoursAgo,
      },
    ];

    const insertedLogs = await Log.insertMany(testLogs);
    console.log(`Inserted ${insertedLogs.length} test logs`);

    // Check what's in the database
    const totalLogs = await Log.countDocuments();
    console.log(`Total logs in database: ${totalLogs}`);

    const logs = await Log.find({});
    console.log(
      "Logs in database:",
      logs.map((log) => ({
        requestId: log.requestId,
        provider: log.provider,
        status: log.status,
        cost: log.cost,
        timestamp: log.timestamp,
      }))
    );

    // Test the analytics aggregation directly
    const stats = await Log.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
          totalCost: { $sum: "$cost.totalCost" },
          avgLatency: { $avg: "$latency" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRequests: 1,
          successRate: {
            $multiply: [{ $divide: ["$successCount", "$totalRequests"] }, 100],
          },
          totalCost: { $round: ["$totalCost", 6] },
          avgDuration: { $round: ["$avgLatency", 0] },
        },
      },
    ]);

    console.log("Analytics aggregation result:", stats);
  } catch (error) {
    console.error("Debug error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

debugAnalytics();
