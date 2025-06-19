# 🌱 OpenLLM Monitor - Complete Seed Data Guide

Welcome to the comprehensive seed data system for OpenLLM Monitor! This guide covers everything you need to create impressive demo data that showcases all system capabilities.

## 🎯 Quick Start Options

### 1. **Simple Seed Data** (Recommended for first-time users)

```powershell
# Windows PowerShell
cd "d:\OpenLLM Monitor\scripts"
.\generate-seed-data.ps1
```

### 2. **Advanced Configurable Seed Data**

```powershell
# Default configuration
node seed-data-advanced.js

# Development scenario (lighter data)
node seed-data-advanced.js --scenario=dev

# High-volume production simulation
node seed-data-advanced.js --scenario=production

# OpenAI-focused dataset
node seed-data-advanced.js --scenario=openai

# Local models focus (Ollama)
node seed-data-advanced.js --scenario=local
```

## 📊 What You Get

### **Simple Seed Data** (`seed-data.js`)

- ✅ **30 days** of realistic LLM requests
- ✅ **1,000+ requests** across all providers
- ✅ **7 diverse use cases** with realistic prompts/responses
- ✅ **Error patterns** and retry logic
- ✅ **Cost calculations** based on real pricing
- ✅ **Streaming requests** simulation
- ✅ **Multi-user activity** patterns

### **Advanced Seed Data** (`seed-data-advanced.js`)

- ✅ **Configurable scenarios** for different demo needs
- ✅ **Custom data volumes** and timeframes
- ✅ **Provider distribution control**
- ✅ **Error rate customization**
- ✅ **User behavior simulation**
- ✅ **Realistic usage patterns**

## 🎪 Use Cases Covered

### 1. **Code Generation** (30% of requests)

**Sample Prompts:**

- "Write a Python function to calculate Fibonacci sequence"
- "Create a REST API endpoint for user authentication"
- "Generate TypeScript interfaces for user management"

**Realistic Responses:**

- Complete code examples with explanations
- Best practices and error handling
- Multiple language implementations

### 2. **Data Analysis** (20% of requests)

**Sample Prompts:**

- "Analyze quarterly sales trends and provide insights"
- "What KPIs should I track for my SaaS business?"
- "How do I calculate customer churn rate?"

**Realistic Responses:**

- Strategic recommendations with metrics
- Statistical analysis explanations
- Business intelligence insights

### 3. **Customer Support** (15% of requests)

**Sample Prompts:**

- "How do I reset my password without email access?"
- "My subscription was charged twice this month"
- "The app crashes when uploading large files"

**Realistic Responses:**

- Empathetic, solution-focused responses
- Step-by-step troubleshooting guides
- Proactive follow-up suggestions

### 4. **Creative Writing** (10% of requests)

**Sample Prompts:**

- "Write marketing copy for sustainable fashion brand"
- "Create engaging social media captions for travel photos"
- "Draft email newsletter for local bakery"

**Realistic Responses:**

- Compelling, audience-targeted content
- Brand-appropriate tone and messaging
- Call-to-action optimization

### 5. **Education** (10% of requests)

**Sample Prompts:**

- "Explain quantum computing in simple terms"
- "What are machine learning fundamentals?"
- "How does photosynthesis work molecularly?"

**Realistic Responses:**

- Clear explanations with analogies
- Structured learning approaches
- Complex concepts made accessible

### 6. **Business Strategy** (10% of requests)

**Sample Prompts:**

- "How should I expand internationally?"
- "What's my go-to-market strategy?"
- "How do I build competitive advantages?"

**Realistic Responses:**

- Strategic frameworks and methodologies
- Implementation roadmaps
- Risk assessment and mitigation

### 7. **Translation** (5% of requests)

**Sample Prompts:**

- "Translate product description to Spanish"
- "Localize marketing campaign for Japan"
- "Convert technical docs to French"

**Realistic Responses:**

- Culturally appropriate translations
- Localization recommendations
- Context preservation

## 🏢 Provider Coverage

### **OpenAI** (45% of requests)

- **Models:** GPT-4, GPT-4-Turbo, GPT-3.5-Turbo variants
- **Strengths:** Code generation, complex reasoning
- **Average Cost:** $0.002-0.06 per 1K tokens
- **Latency:** 800-3000ms

### **Ollama** (25% of requests)

- **Models:** Llama2, CodeLlama, Mistral, Phi3, Gemma
- **Strengths:** Local deployment, privacy, no costs
- **Average Cost:** $0.00 (local models)
- **Latency:** 2000-8000ms (hardware dependent)

### **OpenRouter** (20% of requests)

- **Models:** GPT-4, Claude-2, Llama-2-70B, Mistral-7B
- **Strengths:** Model variety, competitive pricing
- **Average Cost:** $0.0002-0.06 per 1K tokens
- **Latency:** 1200-4500ms

### **Mistral** (10% of requests)

- **Models:** Mistral-Large, Medium, Small, Tiny
- **Strengths:** Multilingual, reasoning, efficiency
- **Average Cost:** $0.00014-0.024 per 1K tokens
- **Latency:** 600-2500ms

## 📈 Analytics Features Showcased

### **Real-time Monitoring**

- ✅ Live request tracking dashboard
- ✅ Success/failure rate monitoring
- ✅ Real-time cost accumulation
- ✅ Active user sessions

### **Performance Analytics**

- ✅ Response time distributions
- ✅ Provider latency comparisons
- ✅ Model performance benchmarks
- ✅ Geographic response patterns

### **Cost Intelligence**

- ✅ Per-provider cost breakdown
- ✅ Token usage optimization
- ✅ Cost-per-use case analysis
- ✅ Budget forecasting data

### **Error Analysis**

- ✅ Error type categorization
- ✅ Retry pattern analysis
- ✅ Provider reliability comparison
- ✅ Failure recovery tracking

### **Usage Patterns**

- ✅ Peak hour identification
- ✅ User behavior segmentation
- ✅ Use case distribution
- ✅ Seasonal trend simulation

## 🎛️ Configuration Options

### **Data Volume Control**

```json
{
  "daysBack": 30, // Days of historical data
  "baseVolumeWeekday": 50, // Requests per weekday
  "baseVolumeWeekend": 20, // Requests per weekend
  "volumeVariation": {
    // Daily volume randomization
    "min": -10,
    "max": 30
  }
}
```

### **Provider Distribution**

```json
{
  "providerDistribution": {
    "openai": 0.45, // 45% of requests
    "ollama": 0.25, // 25% of requests
    "openrouter": 0.2, // 20% of requests
    "mistral": 0.1 // 10% of requests
  }
}
```

### **Error Simulation**

```json
{
  "errorRates": {
    "rateLimit": 0.05, // 5% rate limit errors
    "authentication": 0.02, // 2% auth errors
    "timeout": 0.03, // 3% timeout errors
    "modelOverload": 0.02, // 2% overload errors
    "contentPolicy": 0.01 // 1% policy violations
  }
}
```

### **Request Patterns**

```json
{
  "requestPatterns": {
    "streamingProbability": 0.3, // 30% streaming requests
    "retryProbability": 0.08, // 8% requests have retries
    "maxRetries": 3 // Maximum retry attempts
  }
}
```

## 🎯 Demo Scenarios

### **Development Environment**

```bash
node seed-data-advanced.js --scenario=dev
```

- 14 days of data
- 20 requests/weekday, 5/weekend
- Perfect for development testing

### **Production Simulation**

```bash
node seed-data-advanced.js --scenario=production
```

- 60 days of data
- 100 requests/weekday, 40/weekend
- High-volume enterprise simulation

### **OpenAI Focus**

```bash
node seed-data-advanced.js --scenario=openai
```

- 80% OpenAI requests
- Showcase premium model capabilities
- Cost optimization demonstrations

### **Local Models Focus**

```bash
node seed-data-advanced.js --scenario=local
```

- 60% Ollama requests
- Privacy-focused deployment
- Cost-saving demonstrations

### **Coding Assistant**

```bash
node seed-data-advanced.js --scenario=coding
```

- 60% code generation requests
- Developer productivity focus
- Technical use case emphasis

## 🚀 Demo Presentation Flow

### **Executive Overview** (5 minutes)

1. **Dashboard Overview** - Total requests, costs, success rates
2. **Provider Comparison** - Performance vs. cost analysis
3. **ROI Metrics** - Cost savings and efficiency gains

### **Technical Deep Dive** (10 minutes)

1. **Real-time Monitoring** - Live request tracking
2. **Error Analysis** - Failure patterns and recovery
3. **Performance Benchmarks** - Latency optimization
4. **API Integration** - Request/response inspection

### **Business Intelligence** (10 minutes)

1. **Usage Analytics** - User behavior patterns
2. **Cost Optimization** - Provider efficiency comparison
3. **Capacity Planning** - Growth trend analysis
4. **Operational Insights** - Peak hour management

### **Advanced Features** (5 minutes)

1. **Streaming Visualization** - Real-time response building
2. **Retry Logic** - Automatic failure recovery
3. **Multi-user Simulation** - Concurrent usage patterns
4. **Geographic Distribution** - Global deployment insights

## 📋 Prerequisites Checklist

- ✅ **Node.js 16+** installed
- ✅ **MongoDB** running and accessible
- ✅ **Internet connection** for npm packages
- ✅ **Sufficient disk space** (500MB recommended)
- ✅ **OpenLLM Monitor** application ready to start

## 🛠️ Troubleshooting

### **Common Issues**

**"MongoDB connection failed"**

```bash
# Check if MongoDB is running
# Update connection string in script
export MONGODB_URI="your-connection-string"
```

**"Out of memory during generation"**

```bash
# Reduce data volume in config
"baseVolumeWeekday": 20  # Instead of 50
"daysBack": 14           # Instead of 30
```

**"npm install fails"**

```bash
# Clear npm cache
npm cache clean --force
# Try with different registry
npm install --registry https://registry.npmjs.org/
```

## 🎉 Success Metrics

After running the seed data, you should see:

### **Dashboard Populated With:**

- ✅ 1,000+ realistic LLM requests
- ✅ Multiple provider performance data
- ✅ Comprehensive cost analysis
- ✅ Error patterns and recovery data
- ✅ User activity simulations
- ✅ 30 days of historical trends

### **Demo-Ready Features:**

- ✅ Real-time monitoring capabilities
- ✅ Provider comparison analytics
- ✅ Cost optimization insights
- ✅ Performance benchmarking
- ✅ Error analysis and alerting
- ✅ Usage pattern identification

## 🔄 Customization Guide

### **Adding New Use Cases**

1. Edit `USE_CASES` object in seed script
2. Add realistic prompts and responses
3. Update distribution percentages
4. Test with small dataset first

### **Modifying Provider Mix**

1. Adjust `providerDistribution` weights
2. Add new models to `PROVIDERS` config
3. Update pricing information
4. Validate cost calculations

### **Custom Time Ranges**

1. Modify `daysBack` parameter
2. Adjust `baseVolume` for different periods
3. Consider seasonal patterns
4. Account for business hours

## 📞 Support & Resources

### **Getting Help**

- 📖 Read the full documentation
- 🐛 Check troubleshooting section
- 💬 Review configuration examples
- 🎯 Try different demo scenarios

### **Best Practices**

- Start with simple seed data first
- Test with small datasets before full generation
- Monitor MongoDB storage usage
- Backup existing data before seeding
- Use appropriate scenario for your demo audience

---

**Ready to create an impressive OpenLLM Monitor demo? Start with the simple seed data and explore the advanced options as needed!**

🚀 **Quick Start:** `.\generate-seed-data.ps1`  
🎛️ **Advanced:** `node seed-data-advanced.js --scenario=production`  
📊 **Custom:** Edit `seed-config.json` for your needs
