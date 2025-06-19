# Automatic LLM Usage Monitoring

This guide explains how to automatically monitor LLM API calls without modifying your existing code.

## Integration Options

OpenLLM Monitor provides several methods to automatically capture LLM usage with minimal or no code changes to your projects.

### 1. Network-Level Interception (Zero-Code Change)

For the most seamless experience, we've created proxy servers that intercept LLM API calls at the network level:

#### Setup:

```bash
# Install the proxy
npm install -g openllm-proxy

# Start the proxy server (replace with appropriate provider)
openllm-proxy start --provider openai --monitor-url http://localhost:3001/api/logs
```

#### Usage:

```bash
# Set your application to use the local proxy
# For OpenAI:
export OPENAI_API_BASE=http://localhost:8080/v1

# For Ollama:
export OLLAMA_HOST=http://localhost:8082

# Your application now automatically logs to OpenLLM Monitor!
python your_script.py
```

### 2. Language-Specific SDK Wrappers

For popular LLM client libraries, we provide drop-in replacement wrappers:

#### Python (OpenAI)

```python
# Instead of:
# from openai import OpenAI

# Use:
from openllm_monitor.integrations.openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    # Optional monitor configuration
    monitor_url="http://localhost:3001/api"
)

# Use the client normally - all calls are automatically logged
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

#### JavaScript (OpenAI)

```javascript
// Instead of:
// import OpenAI from 'openai';

// Use:
import { OpenAI } from "openllm-monitor/integrations/openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Optional monitor configuration
  monitorUrl: "http://localhost:3001/api",
});

// Use normally - all calls are automatically logged
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### 3. HTTP Library Middleware

For frameworks that use common HTTP libraries, we provide middleware integrations:

#### Axios Interceptor

```javascript
// Add OpenLLM Monitor logging to any axios instance
import axios from "axios";
import { setupOpenLLMMonitor } from "openllm-monitor/integrations/axios";

// Setup monitoring for LLM API calls
setupOpenLLMMonitor(axios, {
  monitorUrl: "http://localhost:3001/api",
  providers: {
    openai: {
      urlPattern: /api\.openai\.com\/v1/,
    },
    anthropic: {
      urlPattern: /api\.anthropic\.com\/v1/,
    },
    // Add other providers as needed
  },
});

// Now any axios calls to these APIs will be logged
```

#### Python Requests Hook

```python
import requests
from openllm_monitor.integrations.requests import add_monitor_hooks

# Add OpenLLM monitoring to requests
add_monitor_hooks(
    monitor_url="http://localhost:3001/api",
    providers={
        "openai": {"url_pattern": r"api\.openai\.com/v1"},
        "anthropic": {"url_pattern": r"api\.anthropic\.com/v1"},
        # Add other providers as needed
    }
)

# Now any requests to these APIs will be logged
response = requests.post(
    "https://api.openai.com/v1/chat/completions",
    headers={"Authorization": f"Bearer {api_key}"},
    json={"model": "gpt-4", "messages": [{"role": "user", "content": "Hello!"}]}
)
```

### 4. CLI Command Monitoring

For capturing CLI commands:

```bash
# Install the CLI monitor
npm install -g openllm-monitor-cli

# Use the provided wrapper to monitor any LLM CLI tool
llm-monitor ollama run mistral "Hello, world!"
llm-monitor openai api chat -m gpt-4 "Hello, world!"
```

## Advanced Integration Options

### Environment Variable Configuration

Configure monitoring through environment variables:

```bash
# Enable OpenLLM monitoring
export OPENLLM_MONITOR_ENABLED=true
export OPENLLM_MONITOR_URL=http://localhost:3001/api

# Run your application normally
python app.py
```

### Docker Network Monitoring

For containerized applications:

```yaml
# docker-compose.yml
services:
  openllm-monitor:
    image: openllm-monitor:latest
    # configuration...

  openllm-network-monitor:
    image: openllm-monitor-network:latest
    network_mode: "host"
    environment:
      MONITOR_URL: http://openllm-monitor:3001/api
      PROVIDERS: openai,anthropic,ollama

  your-application:
    # Your application configuration
    depends_on:
      - openllm-network-monitor
```

### System-wide Monitoring (Advanced)

For comprehensive monitoring across all applications:

```bash
# Install system-wide monitoring (requires admin/root)
npm install -g openllm-monitor-system

# Configure and start system monitoring
sudo openllm-monitor-system start --providers openai,ollama,anthropic
```

## Implementation Status

| Integration Method | OpenAI | Ollama | Anthropic | Mistral | OpenRouter |
| ------------------ | ------ | ------ | --------- | ------- | ---------- |
| Network Proxy      | ✅     | ✅     | ✅        | ✅      | ✅         |
| Python SDK         | ✅     | ✅     | ✅        | ✅      | ❌         |
| JavaScript SDK     | ✅     | ✅     | ✅        | ✅      | ❌         |
| HTTP Middleware    | ✅     | ✅     | ✅        | ✅      | ✅         |
| CLI Monitoring     | ✅     | ✅     | ❌        | ❌      | ❌         |
| Docker Network     | ✅     | ✅     | ✅        | ✅      | ✅         |
| System-wide        | ✅     | ✅     | ✅        | ✅      | ✅         |

For implementation details, see the [DEVELOPMENT.md](DEVELOPMENT.md) document.
