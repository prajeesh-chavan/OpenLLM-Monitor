// ollama-proxy-server.js
// A proxy server that intercepts Ollama API calls and logs them to OpenLLM Monitor
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();

// Configuration
const PORT = process.env.PORT || 8082;
const OLLAMA_API_URL =
  process.env.OLLAMA_ORIGINAL_URL || "http://localhost:11434";
const OPENLLM_MONITOR_URL =
  process.env.MONITOR_URL || "http://localhost:3001/api/logs";

// JSON parsing middleware
app.use(bodyParser.json());

// Logging middleware
app.use(async (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Only process Ollama API requests
  if (req.url.includes("/api/")) {
    console.log(`[PROXY] Processing API request: ${req.method} ${req.url}`);

    // Create a copy of the request body so we don't interfere with the proxy
    let originalBody = {};
    try {
      originalBody = req.body ? JSON.parse(JSON.stringify(req.body)) : {};
    } catch (error) {
      console.error("Error parsing request body:", error.message);
      originalBody = {};
    }
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

      // Determine the endpoint type
      const endpoint = req.path.split("/").slice(-1)[0];

      // Construct log entry
      let logEntry = {
        timestamp: new Date().toISOString(),
        provider: "ollama",
        model: originalBody.model || "unknown",
        endpoint: endpoint,
        status: res.statusCode,
        latency,
        requestHeaders: req.headers,
        requestBody: originalBody,
        responseBody: responseData,
        source: "api-proxy",
      };

      // Special handling for generate endpoint
      if (endpoint === "generate") {
        logEntry.prompt = originalBody.prompt || "";

        // Extract system message if present in the prompt
        if (logEntry.prompt.includes("System:")) {
          const systemParts = logEntry.prompt.split("System:");
          if (systemParts.length > 1 && systemParts[1].includes("User:")) {
            const systemMessage = systemParts[1].split("User:")[0].trim();
            logEntry.systemMessage = systemMessage;

            // Clean up prompt to just get user part
            const userParts = logEntry.prompt.split("User:");
            if (userParts.length > 1) {
              logEntry.prompt = userParts[1].trim();
            }
          }
        }

        // Extract completion from response
        if (responseData) {
          logEntry.completion = responseData.response || "";
        }

        // Estimate token usage (Ollama doesn't provide this directly)
        // Rough estimate: 1 token ≈ 4 characters
        const promptChars = logEntry.prompt.length;
        const completionChars = logEntry.completion
          ? logEntry.completion.length
          : 0;

        logEntry.tokenUsage = {
          promptTokens: Math.ceil(promptChars / 4),
          completionTokens: Math.ceil(completionChars / 4),
          totalTokens: Math.ceil((promptChars + completionChars) / 4),
        };
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

// Proxy all requests to Ollama API
app.use(
  "/",
  createProxyMiddleware({
    target: OLLAMA_API_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
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
  console.log(`Ollama API Proxy running at http://localhost:${PORT}`);
  console.log(`Proxying requests to ${OLLAMA_API_URL}`);
  console.log(`Logs will be sent to ${OPENLLM_MONITOR_URL}`);
  console.log(
    `\nTo use this proxy, set your OLLAMA_HOST environment variable to:`
  );
  console.log(`http://localhost:${PORT}\n`);
});
