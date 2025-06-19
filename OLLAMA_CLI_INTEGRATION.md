# Logging Ollama CLI Commands in OpenLLM Monitor

OpenLLM Monitor is designed to track LLM API calls made through its own API endpoints. Direct Ollama CLI commands bypass this monitoring system. This guide explains how to ensure your Ollama CLI usage is properly logged in OpenLLM Monitor.

## Why Direct CLI Commands Aren't Logged

When you run Ollama commands directly in the terminal like:

```bash
echo "Hello, how are you?" | ollama run mistral
```

The command communicates directly with the Ollama service, bypassing OpenLLM Monitor's logging middleware.

## Solutions for Logging Ollama CLI Commands

### Option 1: Use the Provided Proxy Script

We've created a proxy script that routes Ollama commands through OpenLLM Monitor:

1. **Setup:**

   - Make sure OpenLLM Monitor is running
   - Install axios: `npm install axios` (if not already installed)

2. **Usage:**

   ```bash
   # Windows
   scripts\ollama-monitor.bat run mistral "Hello, how are you?"

   # Or pipe input
   echo "Hello, how are you?" | scripts\ollama-monitor.bat run mistral
   ```

3. **How it works:**
   - The script sends your request to OpenLLM Monitor's API
   - OpenLLM Monitor logs the request and forwards it to Ollama
   - Results are displayed in your terminal, just like with the regular Ollama CLI
   - If OpenLLM Monitor is unavailable, it falls back to direct Ollama execution

### Option 2: Use the API Directly

For programmatic access, use the `/api/replay` endpoint directly:

```javascript
// Send a request and log it
const response = await fetch("http://localhost:3001/api/replay", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "Hello, how are you?",
    provider: "ollama",
    model: "mistral",
    temperature: 0.7,
  }),
});

const result = await response.json();
console.log(result.completion);
```

### Option 3: Use the Web Interface

The simplest option is to use OpenLLM Monitor's web interface:

1. Open the dashboard at http://localhost:3000
2. Navigate to the Replay page
3. Select "ollama" as the provider and "mistral" as the model
4. Enter your prompt and click "Send"
5. The request will be logged and the response displayed

## Testing the Integration

We've included a test script that sends a sample request to verify everything is working correctly:

```bash
# First, ensure OpenLLM Monitor is running
node test-ollama-request.js
```

After running the script, check the Logs page in OpenLLM Monitor's dashboard to confirm the request was logged.

## Adding Ollama CLI Integration to Your Project

If you regularly use Ollama CLI commands in your workflow, consider:

1. **Adding the proxy script to your PATH**
2. **Creating aliases** for common commands
3. **Integrating with your development tools** by pointing them to the proxy script
