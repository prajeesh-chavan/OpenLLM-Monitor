const mongoose = require("mongoose");
const MONGODB_URI =
  "mongodb://admin:password123@localhost:27017/openllm-monitor?authSource=admin";

const logSchema = new mongoose.Schema(
  {
    status: String,
    retryAttempts: Number,
    // ... other fields
  },
  { collection: "logs" }
);

const Log = mongoose.model("Log", logSchema);

async function checkStatuses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check status distribution
    const statusStats = await Log.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("Status distribution:");
    statusStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    // Check retry statistics
    const retryStats = await Log.aggregate([
      { $match: { retryAttempts: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalWithRetries: { $sum: 1 },
          avgRetries: { $avg: "$retryAttempts" },
        },
      },
    ]);

    console.log("\nRetry statistics:");
    if (retryStats.length > 0) {
      console.log(
        `  Total logs with retries: ${retryStats[0].totalWithRetries}`
      );
      console.log(`  Average retries: ${retryStats[0].avgRetries.toFixed(2)}`);
    } else {
      console.log("  No logs with retries found");
    }

    // Check total logs
    const totalLogs = await Log.countDocuments();
    console.log(`\nTotal logs in database: ${totalLogs}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed");
  }
}

checkStatuses();
