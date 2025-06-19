// openai-proxy-server.js
// A simple proxy server that intercepts OpenAI API calls and logs them to OpenLLM Monitor
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();

// Configuration
const PORT = process.env.PORT || 8080;
const OPENAI_API_URL = "https://api.openai.com";
const OPENLLM_MONITOR_URL =
  process.env.MONITOR_URL || "http://localhost:3001/api/logs";

// JSON parsing middleware
app.use(bodyParser.json());

// Logging middleware
app.use(async (req, res, next) => {
  // Only process OpenAI API requests
  if (req.url.includes("/v1/")) {
    // Create a copy of the request body so we don't interfere with the proxy
    const originalBody = JSON.parse(JSON.stringify(req.body));
    const startTime = Date.now();

    // Store the original send function
    const originalSend = res.send;

    // Override the send function to intercept the response
    res.send = function (body) {
      const endTime = Date.now();
      const latency = endTime - startTime;

      // Parse the response
      let responseData;
      try {
        responseData = JSON.parse(body);
      } catch (e) {
        responseData = body;
      }

      // Extract API key from headers (for provider identification)
      const apiKey = req.headers.authorization
        ? req.headers.authorization.replace("Bearer ", "")
        : "unknown";

      // Determine the endpoint type
      const endpoint = req.path.split("/").slice(-1)[0];

      // Construct log entry
      let logEntry = {
        timestamp: new Date().toISOString(),
        provider: "openai",
        model: originalBody.model || "unknown",
        endpoint: endpoint,
        status: res.statusCode,
        latency,
        requestHeaders: req.headers,
        requestBody: originalBody,
        responseBody: responseData,
        apiKeyPrefix: apiKey.substring(0, 5) + "...",
        source: "api-proxy",
      };

      // Special handling for chat completions
      if (endpoint === "completions" || endpoint === "chat.completions") {
        if (originalBody.messages) {
          // Extract the user's prompt from chat messages
          const userMessages = originalBody.messages.filter(
            (m) => m.role === "user"
          );
          logEntry.prompt = userMessages.map((m) => m.content).join("\n");

          // Extract system message if any
          const systemMessages = originalBody.messages.filter(
            (m) => m.role === "system"
          );
          if (systemMessages.length > 0) {
            logEntry.systemMessage = systemMessages[0].content;
          }
        } else {
          logEntry.prompt = originalBody.prompt || "";
        }

        // Extract completion from response
        if (
          responseData &&
          responseData.choices &&
          responseData.choices.length > 0
        ) {
          if (responseData.choices[0].message) {
            logEntry.completion = responseData.choices[0].message.content;
          } else {
            logEntry.completion = responseData.choices[0].text;
          }
        }

        // Extract token usage
        if (responseData && responseData.usage) {
          logEntry.tokenUsage = responseData.usage;
        }
      }

      // Send log to OpenLLM Monitor
      axios
        .post(OPENLLM_MONITOR_URL, logEntry)
        .then(() => console.log(`[OpenLLM Monitor] Logged ${endpoint} request`))
        .catch((err) =>
          console.error(`[OpenLLM Monitor] Failed to log: ${err.message}`)
        );

      // Call the original send function
      return originalSend.call(this, body);
    };
  }

  next();
});

// Proxy all requests to OpenAI API
app.use(
  "/v1/",
  createProxyMiddleware({
    target: OPENAI_API_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/v1": "/v1",
    },
    onProxyReq: (proxyReq, req) => {
      // Forward the Authorization header
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }

      // Forward OpenAI-specific headers
      if (req.headers["openai-organization"]) {
        proxyReq.setHeader(
          "OpenAI-Organization",
          req.headers["openai-organization"]
        );
      }

      // If there's a request body, write it to the proxy request
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);

// Start server
app.listen(PORT, () => {
  console.log(`OpenAI API Proxy running at http://localhost:${PORT}`);
  console.log(`Logs will be sent to ${OPENLLM_MONITOR_URL}`);
  console.log(
    `\nTo use this proxy, set your OPENAI_API_BASE environment variable to:`
  );
  console.log(`http://localhost:${PORT}/v1\n`);
});
