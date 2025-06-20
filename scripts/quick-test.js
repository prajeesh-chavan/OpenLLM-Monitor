// quick-test.js
const axios = require("axios");

async function quickTest() {
  console.log("🚀 Quick Ollama Proxy Test");
  console.log("Testing proxy at http://localhost:8082");

  try {
    const startTime = Date.now();

    const response = await axios.post(
      "http://localhost:8082/api/generate",
      {
        model: "phi3:mini",
        prompt: "Hi",
        stream: false,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 45000,
      }
    );

    const endTime = Date.now();

    console.log("✅ SUCCESS! Automatic monitoring is working!");
    console.log(
      `📝 Response: "${response.data.response.substring(0, 100)}..."`
    );
    console.log(`⏱️  Latency: ${endTime - startTime}ms`);
    console.log(`🎯 Model: ${response.data.model}`);
    console.log(`📊 Tokens: ${response.data.eval_count} generated`);
    console.log(
      "\n🎉 This request was automatically logged to OpenLLM Monitor!"
    );
    console.log("📊 Check the dashboard: http://localhost:3000");
  } catch (error) {
    console.log("❌ Error:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.log("🔍 Make sure the proxy server is running on port 8082");
    }
  }
}

quickTest();
