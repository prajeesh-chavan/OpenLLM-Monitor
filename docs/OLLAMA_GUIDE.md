# Ollama Integration Guide for OpenLLM Monitor

This comprehensive guide covers Ollama setup, integration, and troubleshooting with OpenLLM Monitor.

## Overview

OpenLLM Monitor supports Ollama integration in two ways:

1. **Host-based**: Ollama runs on your host machine, OpenLLM Monitor connects to it
2. **Containerized**: Both Ollama and OpenLLM Monitor run in Docker containers

## Setup Options

### Option 1: Ollama on Host Machine (Recommended)

1. **Install Ollama on your host:**

   - Download from https://ollama.ai/
   - Install and start the service
   - Pull a model: `ollama pull llama2`

2. **Configure OpenLLM Monitor:**

   - Use the standard `docker-compose.yml`
   - Ollama URL is automatically configured as `http://host.docker.internal:11434`

3. **Start OpenLLM Monitor:**
   ```bash
   docker-compose up -d
   ```

### Option 2: Fully Containerized Setup

For a completely self-contained Docker environment:

1. **Use the Ollama-enabled compose file:**

   ```bash
   docker-compose -f docker/docker-compose-with-ollama.yml up -d
   ```

2. **Pull an Ollama model:**
   ```bash
   docker exec openllm-monitor-ollama ollama pull llama2
   ```

## CLI Integration

### Why Direct CLI Commands Aren't Logged

When you run Ollama commands directly:

```bash
echo "Hello, how are you?" | ollama run mistral
```

The command bypasses OpenLLM Monitor's logging middleware since it communicates directly with Ollama.

### Solution 1: Use the Proxy Script

We provide a proxy script that routes Ollama commands through OpenLLM Monitor:

1. **Setup:**

   - Ensure OpenLLM Monitor is running
   - The proxy script is located in `scripts/ollama-monitor.bat`

2. **Usage:**

   ```bash
   # Windows
   scripts\ollama-monitor.bat run mistral "Hello, how are you?"

   # Or pipe input
   echo "Hello, how are you?" | scripts\ollama-monitor.bat run mistral
   ```

3. **How it works:**
   - Sends requests to OpenLLM Monitor's API
   - OpenLLM Monitor logs the request and forwards it to Ollama
   - Results display in terminal like regular Ollama CLI
   - Falls back to direct Ollama if OpenLLM Monitor is unavailable

### Solution 2: Use the API Directly

For programmatic access, use the `/api/replay` endpoint:

```javascript
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

### Solution 3: Use the Web Interface

The simplest option:

1. Open dashboard at http://localhost:3000
2. Navigate to the Replay page
3. Select "ollama" as provider and choose your model
4. Enter prompt and click "Send"
5. Request is logged and response displayed

## Troubleshooting

### Common Error: "Ollama connection test failed: connect ECONNREFUSED ::1:11434"

This indicates the backend cannot connect to Ollama.

#### For Host-based Ollama:

1. **Verify Ollama is running:**

   ```bash
   curl http://localhost:11434/api/version
   ```

2. **Check Docker configuration:**
   - Ensure using updated `docker-compose.yml` with `host.docker.internal`
   - Restart backend if needed:
     ```bash
     docker-compose down backend
     docker-compose up -d backend
     ```

#### For Containerized Setup:

1. **Use the Ollama compose file:**

   ```bash
   docker-compose -f docker/docker-compose-with-ollama.yml up -d
   ```

2. **Pull a model:**
   ```bash
   docker exec openllm-monitor-ollama ollama pull llama2
   ```

### Verification Commands

**Test Ollama connection from backend container:**

```bash
# For host-based Ollama
docker exec openllm-monitor-backend curl -s http://host.docker.internal:11434/api/version

# For containerized Ollama
docker exec openllm-monitor-backend curl -s http://ollama:11434/api/version
```

### Common Issues

1. **Firewall blocking connections**: Allow port 11434 in firewall
2. **Docker network issues**: Verify containers can route to each other
3. **Ollama not started**: Ensure Ollama service is running
4. **Windows Docker specifics**: May require additional host access configuration

### Log Checking

If still having issues:

1. **Check Ollama logs:**

   ```bash
   docker logs openllm-monitor-ollama  # For containerized
   ollama logs                         # For host-based
   ```

2. **Check backend logs:**

   ```bash
   docker logs openllm-monitor-backend
   ```

3. **Verify Docker network:**
   ```bash
   docker network inspect openllm-network
   ```

## Testing Integration

Test the integration with the provided script:

```bash
# Ensure OpenLLM Monitor is running first
node test-ollama-request.js
```

Check the Logs page in the dashboard to confirm the request was logged.

## Development Integration

For regular Ollama CLI usage in your workflow:

1. **Add proxy script to PATH** for easy access
2. **Create aliases** for common commands
3. **Integrate with development tools** by pointing them to the proxy script

## Environment Configuration

### Host-based Ollama:

```env
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

### Containerized Ollama:

```env
OLLAMA_BASE_URL=http://ollama:11434
```

## Available Models

After setup, you can use any Ollama model:

- `llama2`, `llama2:13b`, `llama2:70b`
- `mistral`, `mistral:7b`
- `codellama`, `codellama:13b`
- `vicuna`, `orca-mini`
- And many more from the Ollama library

Pull models with:

```bash
# Host-based
ollama pull model-name

# Containerized
docker exec openllm-monitor-ollama ollama pull model-name
```
