# OpenLLM Monitor - Seed Data Generator

This comprehensive seed data generator creates realistic demo data to showcase all functionality of your OpenLLM Monitor system. It generates diverse use cases, realistic request patterns, and analytics-ready data.

## 🎯 What Gets Generated

### 📊 **30 Days of Realistic Data**

- **1,000+ LLM requests** across different providers
- **Realistic usage patterns** with weekend/weekday variations
- **Time-distributed requests** with peak hour simulation
- **Geographic distribution** from multiple IP addresses

### 🏢 **Multi-Provider Coverage**

- **OpenAI** (45% of requests) - GPT-4, GPT-3.5-turbo variants
- **Ollama** (25% of requests) - Local models like Llama2, Mistral
- **OpenRouter** (20% of requests) - Various hosted models
- **Mistral** (10% of requests) - Mistral family models

### 🎪 **Diverse Use Cases**

1. **Code Generation** (30%) - Programming tasks, API development
2. **Data Analysis** (20%) - Business insights, analytics queries
3. **Customer Support** (15%) - Help desk, troubleshooting
4. **Creative Writing** (10%) - Content creation, marketing copy
5. **Education** (10%) - Learning, explanations, tutorials
6. **Business Strategy** (10%) - Planning, market analysis
7. **Translation** (5%) - Multi-language content conversion

### 📈 **Analytics Features Showcased**

- ✅ **Real-time Request Monitoring** - Live request tracking
- ✅ **Cost Analysis** - Provider pricing, token costs
- ✅ **Performance Metrics** - Latency, response times
- ✅ **Error Tracking** - Failures, retries, timeout patterns
- ✅ **Provider Comparison** - Side-by-side analytics
- ✅ **Token Usage Analytics** - Input/output token tracking
- ✅ **Streaming Requests** - Real-time response streaming
- ✅ **User Activity Patterns** - Multi-user simulation
- ✅ **Geographic Distribution** - Regional request patterns
- ✅ **Retry Logic Tracking** - Failure recovery patterns

## 🚀 Quick Start

### Option 1: PowerShell (Recommended for Windows)

```powershell
cd "d:\OpenLLM Monitor\scripts"
.\generate-seed-data.ps1
```

### Option 2: Batch File

```cmd
cd "d:\OpenLLM Monitor\scripts"
generate-seed-data.bat
```

### Option 3: Manual Node.js

```bash
cd scripts
npm install
node seed-data.js
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** running and accessible
- **Internet connection** for npm packages

## 🛠️ Configuration

The seed script uses your existing MongoDB connection.

````

To use a different database, set the `MONGODB_URI` environment variable:
```bash
export MONGODB_URI="your-mongodb-connection-string"
````

## 📊 Generated Data Structure

### Request Logs Include:

- **Provider & Model** information
- **Prompts & Completions** for each use case
- **Token Usage** (input/output/total)
- **Cost Calculations** based on real pricing
- **Performance Metrics** (latency, retries)
- **Error Scenarios** (rate limits, timeouts)
- **Streaming Data** (chunk-by-chunk responses)
- **User Context** (IP, user agent, user ID)

### Realistic Error Patterns:

- **Rate Limiting** (5% of requests)
- **Authentication Errors** (2% of requests)
- **Timeouts** (3% of requests)
- **Model Overload** (2% of requests)
- **Content Policy** violations (1% of requests)

## 🎪 Demo Scenarios

After running the seed data, you can showcase:

### 1. **Dashboard Overview**

- Total requests, success rates, costs
- Provider performance comparison
- Real-time activity simulation

### 2. **Analytics Deep Dive**

- Cost analysis by provider/model
- Token usage trends over time
- Error rate monitoring and patterns

### 3. **Request Monitoring**

- Individual request inspection
- Retry logic visualization
- Streaming request playback

### 4. **Provider Comparison**

- Performance benchmarking
- Cost efficiency analysis
- Model capability comparison

### 5. **Historical Trends**

- 30-day usage patterns
- Peak hour identification
- Growth trend simulation

## 🔍 Sample Data Preview

### Code Generation Request:

````json
{
  "provider": "openai",
  "model": "gpt-4",
  "prompt": "Write a Python function to calculate Fibonacci sequence",
  "completion": "Here's a Python function for Fibonacci sequence:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n```",
  "tokenUsage": {
    "promptTokens": 12,
    "completionTokens": 45,
    "totalTokens": 57
  },
  "cost": {
    "promptCost": 0.00036,
    "completionCost": 0.0027,
    "totalCost": 0.00306
  },
  "latency": 1250,
  "status": "success"
}
````

### Customer Support Request:

```json
{
  "provider": "ollama",
  "model": "llama2",
  "prompt": "How do I reset my password if I don't have access to my email?",
  "completion": "I understand your concern about password reset. Here are alternative options:\n\n1. Contact our support team with your account details\n2. Use the phone verification option\n3. Visit our help center for additional methods",
  "tokenUsage": {
    "promptTokens": 15,
    "completionTokens": 42,
    "totalTokens": 57
  },
  "cost": {
    "promptCost": 0,
    "completionCost": 0,
    "totalCost": 0
  },
  "latency": 3200,
  "status": "success"
}
```

## 🎯 Use Cases for Showcasing

### For Technical Audiences:

- **API Monitoring** capabilities
- **Performance benchmarking** across providers
- **Error handling and retry logic**
- **Cost optimization** insights

### For Business Audiences:

- **ROI analysis** of different providers
- **Usage pattern insights**
- **Cost forecasting** capabilities
- **Operational efficiency** metrics

### For Product Demos:

- **Real-time monitoring** dashboard
- **Historical analytics** and trends
- **Provider comparison** features
- **Alert and notification** systems

## 🧹 Cleanup

To remove all seed data and start fresh:

```javascript
// In MongoDB shell or compass
use openllm-monitor
db.logs.deleteMany({})
```

Or modify the seed script to add a cleanup flag.

## 🔧 Customization

### Adjust Data Volume:

Change `daysBack` and `dailyVolume` variables in the script:

```javascript
const daysBack = 60; // Generate 60 days of data
const baseVolume = 100; // 100 requests per day
```

### Modify Provider Distribution:

Update the provider weights:

```javascript
const provider = faker.helpers.weightedArrayElement([
  { weight: 0.6, value: "openai" }, // 60% OpenAI
  { weight: 0.2, value: "ollama" }, // 20% Ollama
  { weight: 0.15, value: "openrouter" }, // 15% OpenRouter
  { weight: 0.05, value: "mistral" }, // 5% Mistral
]);
```

### Add New Use Cases:

Extend the `USE_CASES` object with your specific scenarios:

```javascript
'your-use-case': {
  prompts: ['Your custom prompts...'],
  responses: ['Your custom responses...'],
  systemMessage: 'Your system message...',
  avgTokens: { prompt: 25, completion: 150 }
}
```

## 📞 Support

If you encounter any issues:

1. Check MongoDB connection
2. Verify Node.js version (16+)
3. Ensure sufficient disk space
4. Check network connectivity for npm packages

## 🎉 Ready to Demo!

Once the seed data is generated, your OpenLLM Monitor dashboard will be populated with comprehensive, realistic data that showcases all system capabilities. Perfect for:

- **Client presentations**
- **Stakeholder demos**
- **Feature showcases**
- **Performance testing**
- **Development validation**

Start your OpenLLM Monitor application and explore the rich analytics dashboard powered by this realistic seed data!
