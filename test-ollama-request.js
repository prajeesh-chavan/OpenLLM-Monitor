// test-ollama-request.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Read the test data
const testData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "test-ollama.json"), "utf-8")
);

// Define API endpoint (adjust if your OpenLLM Monitor is running on a different port)
const API_ENDPOINT = "http://localhost:3001/api/replay";

async function sendOllamaRequest() {
  try {
    console.log("Sending request to OpenLLM Monitor API...");
    console.log(`Request data: ${JSON.stringify(testData, null, 2)}`);

    const response = await axios.post(API_ENDPOINT, testData);

    console.log("Response received:");
    console.log(`Status: ${response.status}`);
    console.log("Response data:");
    console.log(JSON.stringify(response.data, null, 2));

    console.log(
      "\nCheck the OpenLLM Monitor dashboard to see the logged request!"
    );
  } catch (error) {
    console.error("Error sending request:");
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error(
        "No response received from server. Is OpenLLM Monitor running?"
      );
    } else {
      // Something happened in setting up the request
      console.error("Error:", error.message);
    }
  }
}

sendOllamaRequest();
