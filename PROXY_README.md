# OpenLLM Monitor - Automatic Integration System

This directory contains tools that enable automatic monitoring of LLM API usage without requiring code changes in users' applications.

## Available Integration Methods

We provide several methods to integrate OpenLLM Monitor into your existing workflows:

### 1. Network Proxy Servers

The proxy servers intercept API calls at the network level and forward them to OpenLLM Monitor.

#### Installation:

```bash
# Install dependencies
npm install --prefix ./proxies -g

# Start the OpenAI proxy server
npm run start:openai --prefix ./proxies

# Start the Ollama proxy server
npm run start:ollama --prefix ./proxies

# Or start all proxy servers at once
npm run start:all --prefix ./proxies
```

#### Usage with OpenAI:

```bash
# Set your OpenAI client to use the proxy
export OPENAI_API_BASE="http://localhost:8080/v1"

# Then use the OpenAI client as normal
python -c "
import openai
client = openai.OpenAI()
response = client.chat.completions.create(
    model='gpt-4',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
print(response.choices[0].message.content)
"
```

#### Usage with Ollama:

```bash
# Set your Ollama client to use the proxy
export OLLAMA_HOST="http://localhost:8082"

# Then use Ollama as normal
ollama run llama2 "Hello, how are you?"
```

### 2. SDK Wrappers

We provide SDK wrappers for popular LLM client libraries:

- [Python SDK Wrapper](examples/python_sdk_wrapper.py)
- [JavaScript SDK Wrapper](examples/js_sdk_wrapper.js)

### 3. CLI Monitoring

For CLI usage, we provide tools that intercept and log CLI commands:

- [Ollama CLI Monitor](scripts/ollama-proxy.js)

## Project Structure

```
openllm-monitor/
├── examples/               # Example code for integrations
│   ├── python_sdk_wrapper.py
│   └── js_sdk_wrapper.js
├── proxy-package.json      # Package.json for proxy servers
├── scripts/                # Utility scripts
│   ├── openai-proxy-server.js
│   ├── ollama-proxy-server.js
│   ├── ollama-proxy.js
│   └── ollama-monitor.bat
└── AUTOMATIC_MONITORING.md # Complete documentation
```

## Documentation

For comprehensive documentation on all integration methods, see:

- [Automatic Monitoring Documentation](AUTOMATIC_MONITORING.md)
- [Ollama CLI Integration Guide](OLLAMA_CLI_INTEGRATION.md)

## Getting Started

1. Start the OpenLLM Monitor backend:

```bash
cd backend
npm install
npm start
```

2. Start the appropriate proxy server:

```bash
cd ..
npm install -D -g http-proxy-middleware express body-parser axios
node scripts/openai-proxy-server.js
```

3. Set your client to use the proxy:

```bash
export OPENAI_API_BASE="http://localhost:8080/v1"
```

4. Use your LLM client as normal - all requests will be automatically logged.

## Need Help?

If you encounter any issues or need assistance setting up the automatic monitoring:

1. Check the troubleshooting section in [AUTOMATIC_MONITORING.md](AUTOMATIC_MONITORING.md)
2. Create an issue in the GitHub repository
3. Contact the project maintainer
