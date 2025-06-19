#!/usr/bin/env node
// ollama-proxy.js - A script to proxy Ollama CLI commands through OpenLLM Monitor
const axios = require("axios");
const { spawn } = require("child_process");

// Configuration
const OPENLLM_API_URL = "http://localhost:3001/api/replay";

// Parse command line arguments
const args = process.argv.slice(2);

// Check if we have the right format
if (args.length < 2 || args[0] !== "run") {
  console.error('Usage: node ollama-proxy.js run <model> "<prompt>"');
  process.exit(1);
}

const model = args[1];
let prompt = "";

// Check if prompt is provided as an argument or from stdin
if (args.length > 2) {
  prompt = args[2];
  sendToOpenLLM(prompt, model);
} else {
  // Read from stdin
  process.stdin.setEncoding("utf8");
  let inputData = "";

  process.stdin.on("data", (chunk) => {
    inputData += chunk;
  });

  process.stdin.on("end", () => {
    prompt = inputData.trim();
    sendToOpenLLM(prompt, model);
  });
}

async function sendToOpenLLM(prompt, model) {
  try {
    console.log(
      `Sending prompt to OpenLLM Monitor (provider: ollama, model: ${model})...`
    );

    // Send request to OpenLLM Monitor
    const response = await axios.post(OPENLLM_API_URL, {
      prompt,
      provider: "ollama",
      model,
      temperature: 0.7,
    });

    // Print the response like Ollama would
    console.log(response.data.completion || response.data.response);

    console.log("\n(Request logged in OpenLLM Monitor)");
  } catch (error) {
    console.error("Error sending request to OpenLLM Monitor:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(
        "Message:",
        error.response.data.error || error.response.data
      );

      // Fall back to direct Ollama if OpenLLM Monitor is unavailable
      console.log("\nFalling back to direct Ollama command...");
      runDirectOllama(prompt, model);
    } else {
      console.error("Connection error:", error.message);
      runDirectOllama(prompt, model);
    }
  }
}

function runDirectOllama(prompt, model) {
  // Fall back to direct Ollama command if OpenLLM Monitor is unavailable
  console.log(
    "Executing direct Ollama command (warning: this will not be logged)"
  );

  const ollamaProcess = spawn("ollama", ["run", model], {
    stdio: ["pipe", "inherit", "inherit"],
  });
  ollamaProcess.stdin.write(prompt);
  ollamaProcess.stdin.end();

  ollamaProcess.on("error", (error) => {
    console.error("Failed to start Ollama process:", error);
  });

  ollamaProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`Ollama process exited with code ${code}`);
    }
  });
}
