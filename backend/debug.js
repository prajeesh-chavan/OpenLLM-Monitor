const mongoose = require("mongoose");
const Log = require("./models/Log");

const MONGODB_URI =
  "mongodb+srv://prajeeshchavan:23072004@cluster0.arjzpru.mongodb.net/openllm-monitor-test?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    const count = await Log.countDocuments();
    console.log("Total logs in DB:", count);

    const recent = await Log.find().sort({ timestamp: -1 }).limit(3);
    console.log("Recent logs:");
    recent.forEach((log) => {
      console.log("  ", log.requestId, log.timestamp, log.provider);
    });

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    console.log("Current time:", now);
    console.log("24h ago:", oneDayAgo);

    const recentCount = await Log.countDocuments({
      timestamp: { $gte: oneDayAgo },
    });
    console.log("Logs in last 24h:", recentCount);

    mongoose.disconnect();
  })
  .catch(console.error);
