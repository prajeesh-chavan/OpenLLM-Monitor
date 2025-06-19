#!/usr/bin/env node

/**
 * OpenLLM Monitor - Comprehensive Seed Data Generator
 *
 * This script creates realistic seed data to showcase all system functionality:
 * - Multiple providers (OpenAI, Ollama, Mistral, OpenRouter)
 * - Various use cases and scenarios
 * - Different request patterns and outcomes
 * - Analytics-ready data for dashboard visualization
 *
 * Run with: node scripts/seed-data.js
 */

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// Import the Log model
const logSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    provider: {
      type: String,
      required: true,
      enum: ["openai", "openrouter", "mistral", "ollama"],
      index: true,
    },
    model: { type: String, required: true, index: true },
    prompt: { type: String, required: true },
    completion: { type: String, default: "" },
    systemMessage: { type: String, default: "" },
    parameters: {
      temperature: { type: Number, default: 1.0 },
      maxTokens: { type: Number, default: null },
      topP: { type: Number, default: 1.0 },
      frequencyPenalty: { type: Number, default: 0 },
      presencePenalty: { type: Number, default: 0 },
      stop: [String],
    },
    latency: { type: Number, required: true, index: true },
    tokenUsage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    cost: {
      promptCost: { type: Number, default: 0 },
      completionCost: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },
    status: {
      type: String,
      required: true,
      enum: ["success", "error", "timeout", "rate_limited"],
      index: true,
    },
    error: {
      message: String,
      code: String,
      details: mongoose.Schema.Types.Mixed,
    },
    retryAttempts: { type: Number, default: 0 },
    retryHistory: [
      {
        attempt: Number,
        timestamp: Date,
        error: String,
        latency: Number,
      },
    ],
    userAgent: String,
    ipAddress: String,
    userId: String,
    isStreaming: { type: Boolean, default: false },
    streamChunks: [
      {
        timestamp: Date,
        content: String,
        finishReason: String,
      },
    ],
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Log = mongoose.model("Log", logSchema);

// Provider configurations
const PROVIDERS = {
  openai: {
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "gpt-3.5-turbo-16k"],
    pricing: {
      "gpt-4": { prompt: 0.03, completion: 0.06 },
      "gpt-4-turbo": { prompt: 0.01, completion: 0.03 },
      "gpt-3.5-turbo": { prompt: 0.0015, completion: 0.002 },
      "gpt-3.5-turbo-16k": { prompt: 0.003, completion: 0.004 },
    },
  },
  openrouter: {
    models: [
      "openai/gpt-4",
      "anthropic/claude-2",
      "meta-llama/llama-2-70b-chat",
      "mistralai/mistral-7b-instruct",
    ],
    pricing: {
      "openai/gpt-4": { prompt: 0.03, completion: 0.06 },
      "anthropic/claude-2": { prompt: 0.008, completion: 0.024 },
      "meta-llama/llama-2-70b-chat": { prompt: 0.0015, completion: 0.0015 },
      "mistralai/mistral-7b-instruct": { prompt: 0.0002, completion: 0.0002 },
    },
  },
  mistral: {
    models: [
      "mistral-large",
      "mistral-medium",
      "mistral-small",
      "mistral-tiny",
    ],
    pricing: {
      "mistral-large": { prompt: 0.008, completion: 0.024 },
      "mistral-medium": { prompt: 0.0027, completion: 0.0081 },
      "mistral-small": { prompt: 0.0006, completion: 0.0018 },
      "mistral-tiny": { prompt: 0.00014, completion: 0.00042 },
    },
  },
  ollama: {
    models: ["llama2", "llama2:13b", "codellama", "mistral", "phi3", "gemma"],
    pricing: {}, // Local models - no cost
  },
};

// Use case scenarios with realistic prompts and responses
const USE_CASES = {
  "code-generation": {
    prompts: [
      "Write a Python function to calculate the Fibonacci sequence",
      "Create a REST API endpoint for user authentication in Node.js",
      "Generate a React component for a todo list",
      "Write SQL query to find top 10 customers by revenue",
      "Create a Docker compose file for a MEAN stack application",
      "Write a Python script to parse CSV files and generate reports",
      "Generate TypeScript interfaces for a user management system",
      "Create a bash script to automate database backups",
    ],
    responses: [
      "Here's a Python function for Fibonacci sequence:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n```",
      "Here's a Node.js authentication endpoint:\n\n```javascript\napp.post('/auth', async (req, res) => {\n  const { email, password } = req.body;\n  // Authentication logic here\n});\n```",
      "Here's a React Todo component:\n\n```jsx\nconst TodoList = () => {\n  const [todos, setTodos] = useState([]);\n  return (\n    <div>{/* Todo list JSX */}</div>\n  );\n};\n```",
    ],
    systemMessage:
      "You are a helpful coding assistant. Provide clean, well-documented code examples.",
    avgTokens: { prompt: 25, completion: 180 },
  },
  "data-analysis": {
    prompts: [
      "Analyze the following sales data and provide insights on quarterly trends",
      "What are the key metrics I should track for a SaaS business?",
      "Explain the correlation between customer acquisition cost and lifetime value",
      "How can I improve the conversion rate of my e-commerce funnel?",
      "Analyze user behavior patterns from this website analytics data",
      "What statistical tests should I use for A/B testing results?",
      "Create a data visualization strategy for executive dashboards",
      "Identify anomalies in this time series data",
    ],
    responses: [
      "Based on the sales data analysis, here are the key quarterly trends:\n\n1. Q4 shows 23% growth over Q3\n2. Customer acquisition peaked in October\n3. Average order value increased by 15%",
      "Key SaaS metrics to track:\n\n• Monthly Recurring Revenue (MRR)\n• Customer Acquisition Cost (CAC)\n• Customer Lifetime Value (LTV)\n• Churn Rate\n• Net Promoter Score (NPS)",
      "The CAC to LTV ratio indicates business health. A healthy ratio is 1:3 or better, meaning LTV should be at least 3x your CAC for sustainable growth.",
    ],
    systemMessage:
      "You are a data analyst expert. Provide actionable insights with specific metrics and recommendations.",
    avgTokens: { prompt: 35, completion: 220 },
  },
  "creative-writing": {
    prompts: [
      "Write a short story about a robot learning to paint",
      "Create a marketing copy for a sustainable fashion brand",
      "Generate product descriptions for handmade jewelry",
      "Write a blog post about the future of remote work",
      "Create social media captions for a travel photography account",
      "Draft an email newsletter for a local bakery",
      "Write a compelling product launch announcement",
      "Create engaging content for a fitness app",
    ],
    responses: [
      "The Artisan Bot\n\nZX-7 had calculated millions of color combinations, but it had never understood beauty. Today, as synthetic fingers gripped the brush for the first time, something changed...",
      "Sustainable Style, Conscious Choice\n\nDiscover fashion that doesn't cost the earth. Our ethically-sourced, eco-friendly designs prove that style and sustainability can walk hand in hand.",
      "Handcrafted Elegance\n\nEach piece tells a story of artisan craftsmanship. Sterling silver catches the light while natural gemstones add vibrant character to these unique designs.",
    ],
    systemMessage:
      "You are a creative writing assistant. Use vivid imagery, engaging narratives, and compelling language.",
    avgTokens: { prompt: 20, completion: 150 },
  },
  "customer-support": {
    prompts: [
      "How do I reset my password if I don't have access to my email?",
      "My subscription was charged twice this month, can you help?",
      "The app keeps crashing when I try to upload files",
      "I want to upgrade my plan but the option is grayed out",
      "How can I export my data before canceling my account?",
      "I received a damaged product, what's the return process?",
      "Can you explain the difference between your pricing tiers?",
      "I'm having trouble integrating your API with my application",
    ],
    responses: [
      "I understand your concern about password reset. Here are alternative options:\n\n1. Contact our support team with your account details\n2. Use the phone verification option\n3. Visit our help center for additional methods",
      "I apologize for the billing issue. Let me help you with the duplicate charge:\n\n1. I'll process a refund for the duplicate transaction\n2. I'll review your account to prevent future occurrences\n3. You should see the refund in 3-5 business days",
      "I'm sorry about the app crashes. Let's troubleshoot this issue:\n\n1. Try clearing the app cache\n2. Update to the latest version\n3. If the issue persists, please send us the crash logs",
    ],
    systemMessage:
      "You are a helpful customer support assistant. Be empathetic, solution-focused, and provide clear steps.",
    avgTokens: { prompt: 30, completion: 120 },
  },
  education: {
    prompts: [
      "Explain quantum computing in simple terms",
      "What are the key principles of machine learning?",
      "How does photosynthesis work at the molecular level?",
      "Explain the economic impact of inflation on different sectors",
      "What are the main causes of climate change?",
      "How do neural networks process information?",
      "Explain the differences between programming paradigms",
      "What is the significance of the Renaissance period?",
    ],
    responses: [
      "Quantum Computing Simplified:\n\nImagine a coin that can be both heads AND tails at the same time. Quantum computers use quantum bits (qubits) that exist in multiple states simultaneously, allowing them to process many possibilities at once.",
      "Machine Learning Key Principles:\n\n1. Pattern Recognition - Finding patterns in data\n2. Training - Learning from examples\n3. Generalization - Applying learned patterns to new data\n4. Iteration - Continuously improving accuracy",
      "Photosynthesis Overview:\n\n1. Light absorption by chlorophyll\n2. Water splitting to release oxygen\n3. CO2 conversion to glucose\n4. Energy storage in chemical bonds\n\nThis process converts sunlight into chemical energy that powers most life on Earth.",
    ],
    systemMessage:
      "You are an educational assistant. Explain complex topics clearly with examples and analogies.",
    avgTokens: { prompt: 15, completion: 160 },
  },
  "business-strategy": {
    prompts: [
      "How should I approach market expansion for my SaaS product?",
      "What are the key factors for successful digital transformation?",
      "Analyze the competitive landscape for the fintech industry",
      "How can I improve team productivity in a remote work environment?",
      "What are the best practices for customer retention in B2B?",
      "How should I structure my startup's go-to-market strategy?",
      "What metrics should I track for operational efficiency?",
      "How can I build a sustainable competitive advantage?",
    ],
    responses: [
      "SaaS Market Expansion Strategy:\n\n1. Market Research - Validate demand in new markets\n2. Localization - Adapt product for regional needs\n3. Partnership Strategy - Leverage local partners\n4. Gradual Rollout - Test with pilot customers first\n5. Support Infrastructure - Ensure customer success capabilities",
      "Digital Transformation Success Factors:\n\n• Leadership Commitment - C-level sponsorship\n• Employee Training - Upskill your workforce\n• Technology Integration - Choose compatible systems\n• Change Management - Address cultural resistance\n• Continuous Improvement - Iterate based on feedback",
      "Fintech Competitive Analysis:\n\n• Regulatory Compliance - Major differentiator\n• User Experience - Critical for adoption\n• Security & Trust - Non-negotiable requirements\n• Integration Capabilities - Key for B2B success\n• Innovation Speed - Fast-moving landscape",
    ],
    systemMessage:
      "You are a business strategy consultant. Provide strategic insights with actionable recommendations.",
    avgTokens: { prompt: 25, completion: 200 },
  },
  translation: {
    prompts: [
      "Translate this product description from English to Spanish",
      "Convert this technical documentation to French",
      "Translate customer feedback from German to English",
      "Localize this marketing campaign for the Japanese market",
      "Translate legal terms from Italian to English",
      "Convert this user manual from Portuguese to Chinese",
      "Translate social media posts from Arabic to English",
      "Localize app interface text for the Indian market",
    ],
    responses: [
      "Descripción del Producto (Spanish):\n\nEste innovador dispositivo combina tecnología avanzada con diseño elegante para ofrecer una experiencia única al usuario.",
      "Documentation Technique (French):\n\nCe guide détaille les procédures d'installation et de configuration nécessaires pour déployer le système avec succès.",
      "Customer Feedback Translation:\n\nOriginal (German): Das Produkt ist ausgezeichnet, aber der Kundenservice könnte verbessert werden.\nTranslation: The product is excellent, but customer service could be improved.",
    ],
    systemMessage:
      "You are a professional translator. Maintain context and cultural nuances in translations.",
    avgTokens: { prompt: 40, completion: 100 },
  },
};

// Error scenarios for realistic failure patterns
const ERROR_SCENARIOS = [
  {
    status: "error",
    error: { message: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
    probability: 0.05,
  },
  {
    status: "error",
    error: { message: "Invalid API key", code: "AUTHENTICATION_ERROR" },
    probability: 0.02,
  },
  {
    status: "timeout",
    error: { message: "Request timeout", code: "TIMEOUT" },
    probability: 0.03,
  },
  {
    status: "error",
    error: { message: "Model overloaded", code: "MODEL_OVERLOADED" },
    probability: 0.02,
  },
  {
    status: "error",
    error: { message: "Content policy violation", code: "CONTENT_POLICY" },
    probability: 0.01,
  },
];

// User agents for realistic request simulation
const USER_AGENTS = [
  "OpenLLM-Monitor/1.0 (Node.js/18.17.0)",
  "Python-SDK/2.1.0 (Python/3.9.0)",
  "JavaScript-SDK/1.5.2 (Chrome/119.0.0.0)",
  "Mobile-App/3.2.1 (iOS/17.0)",
  "CLI-Tool/1.8.0 (Linux/Ubuntu)",
  "Desktop-App/2.4.0 (Windows/11)",
  "Browser-Extension/1.1.0 (Firefox/120.0)",
];

// IP addresses from different regions
const IP_ADDRESSES = [
  "203.0.113.1", // US West
  "198.51.100.42", // US East
  "192.0.2.15", // Europe
  "198.51.100.89", // Asia Pacific
  "203.0.113.77", // Canada
  "192.0.2.234", // Australia
  "198.51.100.156", // South America
];

// Generate realistic user IDs
const USER_IDS = Array.from(
  { length: 50 },
  () => `user_${faker.string.alphanumeric(8)}`
);

/**
 * Calculate cost based on provider and model
 */
function calculateCost(provider, model, promptTokens, completionTokens) {
  if (provider === "ollama") {
    return { promptCost: 0, completionCost: 0, totalCost: 0 };
  }

  const pricing = PROVIDERS[provider]?.pricing[model];
  if (!pricing) {
    return { promptCost: 0, completionCost: 0, totalCost: 0 };
  }

  const promptCost = (promptTokens / 1000) * pricing.prompt;
  const completionCost = (completionTokens / 1000) * pricing.completion;

  return {
    promptCost: Math.round(promptCost * 10000) / 10000,
    completionCost: Math.round(completionCost * 10000) / 10000,
    totalCost: Math.round((promptCost + completionCost) * 10000) / 10000,
  };
}

/**
 * Generate realistic latency based on provider and model
 */
function generateLatency(provider, model, status) {
  const baseLatencies = {
    openai: { min: 800, max: 3000, avg: 1500 },
    openrouter: { min: 1200, max: 4500, avg: 2200 },
    mistral: { min: 600, max: 2500, avg: 1200 },
    ollama: { min: 2000, max: 8000, avg: 4000 },
  };

  const base = baseLatencies[provider];
  if (status === "timeout")
    return base.max + faker.number.int({ min: 1000, max: 5000 });
  if (status === "error")
    return faker.number.int({ min: base.min, max: base.avg });

  return faker.number.int({ min: base.min, max: base.max });
}

/**
 * Generate streaming chunks for streaming requests
 */
function generateStreamChunks(completion) {
  if (!completion) return [];

  const words = completion.split(" ");
  const chunks = [];
  let currentContent = "";

  for (let i = 0; i < words.length; i++) {
    currentContent += (i > 0 ? " " : "") + words[i];
    if (i % 3 === 0 || i === words.length - 1) {
      chunks.push({
        timestamp: new Date(Date.now() - (words.length - i) * 100),
        content: currentContent,
        finishReason: i === words.length - 1 ? "stop" : null,
      });
    }
  }

  return chunks;
}

/**
 * Generate retry history for failed requests
 */
function generateRetryHistory(retryAttempts) {
  const history = [];
  for (let i = 0; i < retryAttempts; i++) {
    history.push({
      attempt: i + 1,
      timestamp: faker.date.recent({ days: 7 }),
      error: faker.helpers.arrayElement([
        "Connection timeout",
        "Rate limit exceeded",
        "Service unavailable",
        "Network error",
      ]),
      latency: faker.number.int({ min: 500, max: 2000 }),
    });
  }
  return history;
}

/**
 * Generate a single log entry
 */
function generateLogEntry(useCase, provider, model, createdAt) {
  const useCaseData = USE_CASES[useCase];
  const prompt = faker.helpers.arrayElement(useCaseData.prompts);
  const response = faker.helpers.arrayElement(useCaseData.responses);

  // Determine status based on error scenarios
  let status = "success";
  let error = null;

  for (const scenario of ERROR_SCENARIOS) {
    if (Math.random() < scenario.probability) {
      status = scenario.status;
      error = scenario.error;
      break;
    }
  }

  const completion = status === "success" ? response : "";
  const promptTokens = Math.floor(
    useCaseData.avgTokens.prompt * (0.8 + Math.random() * 0.4)
  );
  const completionTokens =
    status === "success"
      ? Math.floor(
          useCaseData.avgTokens.completion * (0.8 + Math.random() * 0.4)
        )
      : 0;

  const cost = calculateCost(provider, model, promptTokens, completionTokens);
  const latency = generateLatency(provider, model, status);
  const isStreaming = Math.random() < 0.3; // 30% streaming
  const retryAttempts =
    status !== "success" ? faker.number.int({ min: 1, max: 3 }) : 0;

  return {
    requestId: `req_${faker.string.alphanumeric(16)}_${Date.now()}`,
    provider,
    model,
    prompt,
    completion,
    systemMessage: useCaseData.systemMessage,
    parameters: {
      temperature: Math.round((0.1 + Math.random() * 1.9) * 10) / 10,
      maxTokens: faker.helpers.arrayElement([100, 200, 500, 1000, 2000, 4000]),
      topP: Math.round((0.1 + Math.random() * 0.9) * 10) / 10,
      frequencyPenalty: Math.round((Math.random() * 2 - 1) * 10) / 10,
      presencePenalty: Math.round((Math.random() * 2 - 1) * 10) / 10,
      stop: Math.random() < 0.2 ? ["\n", "###"] : [],
    },
    latency,
    tokenUsage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    cost: {
      ...cost,
      currency: "USD",
    },
    status,
    error,
    retryAttempts,
    retryHistory: retryAttempts > 0 ? generateRetryHistory(retryAttempts) : [],
    userAgent: faker.helpers.arrayElement(USER_AGENTS),
    ipAddress: faker.helpers.arrayElement(IP_ADDRESSES),
    userId: faker.helpers.arrayElement(USER_IDS),
    isStreaming,
    streamChunks:
      isStreaming && status === "success"
        ? generateStreamChunks(completion)
        : [],
    createdAt,
    updatedAt: createdAt,
  };
}

/**
 * Generate seed data
 */
async function generateSeedData() {
  console.log("🚀 Starting seed data generation...\n");

  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🧹 Cleaning existing logs...");
    await Log.deleteMany({});
    console.log("✅ Existing logs cleared\n");

    const logs = [];
    const now = new Date();
    const daysBack = 30;

    console.log(`📊 Generating logs for the past ${daysBack} days...\n`);

    // Generate different patterns for different time periods
    for (let day = 0; day < daysBack; day++) {
      const dayDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);

      // Vary daily volume (weekends have less traffic)
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
      const baseVolume = isWeekend ? 20 : 50;
      const dailyVolume = baseVolume + faker.number.int({ min: -10, max: 30 });

      console.log(
        `📅 Day ${
          day + 1
        }/${daysBack}: ${dayDate.toDateString()} - ${dailyVolume} logs`
      );

      for (let i = 0; i < dailyVolume; i++) {
        // Distribute throughout the day with peak hours
        const hour = faker.number.int({ min: 0, max: 23 });
        const minute = faker.number.int({ min: 0, max: 59 });
        const second = faker.number.int({ min: 0, max: 59 });

        const logDate = new Date(dayDate);
        logDate.setHours(hour, minute, second);

        // Select use case based on realistic distribution
        const useCase = faker.helpers.weightedArrayElement([
          { weight: 0.3, value: "code-generation" },
          { weight: 0.2, value: "data-analysis" },
          { weight: 0.15, value: "customer-support" },
          { weight: 0.1, value: "creative-writing" },
          { weight: 0.1, value: "education" },
          { weight: 0.1, value: "business-strategy" },
          { weight: 0.05, value: "translation" },
        ]);

        // Select provider based on realistic usage patterns
        const provider = faker.helpers.weightedArrayElement([
          { weight: 0.45, value: "openai" },
          { weight: 0.25, value: "ollama" },
          { weight: 0.2, value: "openrouter" },
          { weight: 0.1, value: "mistral" },
        ]);

        const model = faker.helpers.arrayElement(PROVIDERS[provider].models);

        const logEntry = generateLogEntry(useCase, provider, model, logDate);
        logs.push(logEntry);
      }
    }

    console.log(`\n💾 Inserting ${logs.length} logs into database...`);

    // Insert in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      await Log.insertMany(batch);
      process.stdout.write(
        `\r   Progress: ${Math.min(i + batchSize, logs.length)}/${
          logs.length
        } logs inserted`
      );
    }

    console.log("\n✅ All logs inserted successfully!\n");

    // Generate summary statistics
    console.log("📈 Generating summary statistics...\n");

    const stats = await Log.aggregate([
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
          errorCount: {
            $sum: { $cond: [{ $ne: ["$status", "success"] }, 1, 0] },
          },
          totalCost: { $sum: "$cost.totalCost" },
          totalTokens: { $sum: "$tokenUsage.totalTokens" },
          avgLatency: { $avg: "$latency" },
        },
      },
    ]);

    const providerStats = await Log.aggregate([
      {
        $group: {
          _id: "$provider",
          count: { $sum: 1 },
          avgLatency: { $avg: "$latency" },
          totalCost: { $sum: "$cost.totalCost" },
          successRate: {
            $avg: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const useCaseStats = await Log.aggregate([
      {
        $group: {
          _id: "$systemMessage",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const summary = stats[0];
    const successRate = (
      (summary.successCount / summary.totalLogs) *
      100
    ).toFixed(1);

    console.log("🎉 SEED DATA GENERATION COMPLETE!\n");
    console.log("📊 SUMMARY STATISTICS:");
    console.log("═══════════════════════════════════════");
    console.log(`📝 Total Logs: ${summary.totalLogs.toLocaleString()}`);
    console.log(`✅ Success Rate: ${successRate}%`);
    console.log(`💰 Total Cost: $${summary.totalCost.toFixed(4)}`);
    console.log(`🔤 Total Tokens: ${summary.totalTokens.toLocaleString()}`);
    console.log(`⚡ Avg Latency: ${Math.round(summary.avgLatency)}ms\n`);

    console.log("🏢 PROVIDER BREAKDOWN:");
    console.log("═══════════════════════════════════════");
    for (const provider of providerStats) {
      const successRate = (provider.successRate * 100).toFixed(1);
      console.log(
        `${provider._id.toUpperCase().padEnd(12)} | ${provider.count
          .toString()
          .padStart(5)} logs | ${Math.round(provider.avgLatency)
          .toString()
          .padStart(5)}ms | $${provider.totalCost
          .toFixed(4)
          .padStart(8)} | ${successRate}%`
      );
    }

    console.log("\n🎯 USE CASE DISTRIBUTION:");
    console.log("═══════════════════════════════════════");

    // Map system messages back to use cases
    const useCaseMapping = {};
    Object.entries(USE_CASES).forEach(([key, value]) => {
      useCaseMapping[value.systemMessage] = key;
    });

    for (const useCase of useCaseStats) {
      const caseName = useCaseMapping[useCase._id] || "Unknown";
      console.log(
        `${caseName
          .replace("-", " ")
          .toUpperCase()
          .padEnd(20)} | ${useCase.count.toString().padStart(5)} logs`
      );
    }

    console.log("\n🎯 DASHBOARD FEATURES SHOWCASED:");
    console.log("═══════════════════════════════════════");
    console.log("✅ Real-time Request Monitoring");
    console.log("✅ Multi-Provider Analytics");
    console.log("✅ Cost Tracking & Analysis");
    console.log("✅ Performance Monitoring");
    console.log("✅ Error Tracking & Analysis");
    console.log("✅ Token Usage Analytics");
    console.log("✅ Provider Comparison");
    console.log("✅ Time-based Trends");
    console.log("✅ User Activity Patterns");
    console.log("✅ Streaming Request Logs");
    console.log("✅ Retry Logic Tracking");
    console.log("✅ Geographic Distribution");

    console.log("\n🚀 Your OpenLLM Monitor is now ready for demo!");
    console.log("   Start the application and explore the dashboard.");
  } catch (error) {
    console.error("❌ Error generating seed data:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n📡 Database connection closed.");
  }
}

// Run the seed data generation
generateSeedData();
