#!/usr/bin/env node

/**
 * OpenLLM Monitor - Advanced Seed Data Generator
 *
 * Enhanced version with configuration support and demo scenarios
 *
 * Usage:
 *   node seed-data-advanced.js                    # Use default config
 *   node seed-data-advanced.js --scenario=dev     # Use development scenario
 *   node seed-data-advanced.js --config=custom    # Use custom config file
 */

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const fs = require("fs");
const path = require("path");

// Command line arguments
const args = process.argv.slice(2);
const scenarioArg = args.find((arg) => arg.startsWith("--scenario="));
const configArg = args.find((arg) => arg.startsWith("--config="));

const scenario = scenarioArg ? scenarioArg.split("=")[1] : null;
const customConfigPath = configArg ? configArg.split("=")[1] : null;

// Load configuration
let config;
try {
  const configPath = customConfigPath
    ? path.resolve(customConfigPath)
    : path.join(__dirname, "seed-config.json");

  config = JSON.parse(fs.readFileSync(configPath, "utf8")).seedConfig;

  // Apply scenario overrides
  if (scenario) {
    const scenarios = JSON.parse(
      fs.readFileSync(configPath, "utf8")
    ).demoScenarios;
    const selectedScenario = scenarios.find((s) =>
      s.name.toLowerCase().includes(scenario.toLowerCase())
    );

    if (selectedScenario) {
      console.log(`🎯 Applying scenario: ${selectedScenario.name}`);
      console.log(`   ${selectedScenario.description}\n`);

      // Deep merge overrides
      Object.keys(selectedScenario.overrides).forEach((key) => {
        if (
          typeof selectedScenario.overrides[key] === "object" &&
          !Array.isArray(selectedScenario.overrides[key])
        ) {
          config[key] = { ...config[key], ...selectedScenario.overrides[key] };
        } else {
          config[key] = selectedScenario.overrides[key];
        }
      });
    } else {
      console.log(
        `⚠️  Scenario '${scenario}' not found, using default config\n`
      );
    }
  }
} catch (error) {
  console.error("❌ Error loading config file, using defaults:", error.message);
  // Fallback to default config
  config = {
    dataGeneration: {
      daysBack: 30,
      baseVolumeWeekday: 50,
      baseVolumeWeekend: 20,
      volumeVariation: { min: -10, max: 30 },
    },
    providerDistribution: {
      openai: 0.45,
      ollama: 0.25,
      openrouter: 0.2,
      mistral: 0.1,
    },
    useCaseDistribution: {
      "code-generation": 0.3,
      "data-analysis": 0.2,
      "customer-support": 0.15,
      "creative-writing": 0.1,
      education: 0.1,
      "business-strategy": 0.1,
      translation: 0.05,
    },
    errorRates: {
      rateLimit: 0.05,
      authentication: 0.02,
      timeout: 0.03,
      modelOverload: 0.02,
      contentPolicy: 0.01,
    },
    requestPatterns: {
      streamingProbability: 0.3,
      retryProbability: 0.08,
      maxRetries: 3,
    },
    userSimulation: {
      totalUsers: 50,
      activeUserRatio: 0.7,
      powerUserRatio: 0.2,
    },
  };
}

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://prajeeshchavan:23072004@cluster0.arjzpru.mongodb.net/openllm-monitor?retryWrites=true&w=majority&appName=Cluster0";

// Import the Log model (same as before)
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

// All the provider configs, use cases, and utility functions from the original script
// (Same as in the original seed-data.js file - keeping it DRY)

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

// Enhanced use cases with more variety
const USE_CASES = {
  "code-generation": {
    prompts: [
      "Write a Python function to calculate the Fibonacci sequence",
      "Create a REST API endpoint for user authentication in Node.js",
      "Generate a React component for a todo list with TypeScript",
      "Write SQL query to find top 10 customers by revenue this quarter",
      "Create a Docker compose file for a MEAN stack application",
      "Write a Python script to parse CSV files and generate reports",
      "Generate TypeScript interfaces for a user management system",
      "Create a bash script to automate database backups",
      "Build a Vue.js component for real-time chat messages",
      "Write a Go function to handle HTTP middleware authentication",
      "Create a Rust implementation of a binary search tree",
      "Generate unit tests for a React component using Jest",
      "Write a Python decorator for caching function results",
      "Create a MongoDB aggregation pipeline for analytics",
      "Build a responsive CSS grid layout for a dashboard",
    ],
    responses: [
      "Here's a Python function for Fibonacci sequence:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# Optimized version with memoization\ndef fibonacci_memo(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fibonacci_memo(n-1, memo) + fibonacci_memo(n-2, memo)\n    return memo[n]\n```",
      "Here's a Node.js authentication endpoint:\n\n```javascript\nconst express = require('express');\nconst bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\n\napp.post('/auth', async (req, res) => {\n  try {\n    const { email, password } = req.body;\n    const user = await User.findOne({ email });\n    \n    if (!user || !await bcrypt.compare(password, user.hashedPassword)) {\n      return res.status(401).json({ error: 'Invalid credentials' });\n    }\n    \n    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);\n    res.json({ token, user: { id: user._id, email: user.email } });\n  } catch (error) {\n    res.status(500).json({ error: 'Authentication failed' });\n  }\n});\n```",
    ],
    systemMessage:
      "You are a senior software engineer. Provide clean, well-documented, production-ready code with error handling and best practices.",
    avgTokens: { prompt: 28, completion: 220 },
  },
  "data-analysis": {
    prompts: [
      "Analyze the following sales data and provide insights on quarterly trends",
      "What are the key metrics I should track for a SaaS business dashboard?",
      "Explain the correlation between customer acquisition cost and lifetime value",
      "How can I improve the conversion rate of my e-commerce funnel using A/B testing?",
      "Analyze user behavior patterns from this website analytics data",
      "What statistical tests should I use for A/B testing results validation?",
      "Create a data visualization strategy for executive dashboards",
      "Identify anomalies in this time series data using statistical methods",
      "How do I calculate customer churn rate and predict future churn?",
      "What are the best practices for cohort analysis in subscription businesses?",
      "How can I segment customers based on their usage patterns?",
      "Explain the difference between correlation and causation in data analysis",
    ],
    responses: [
      "Based on quarterly sales data analysis, here are the key insights:\n\n**Quarterly Trends:**\n• Q4 shows 23% growth over Q3\n• Customer acquisition peaked in October (holiday preparation)\n• Average order value increased by 15% due to premium product mix\n• Geographic expansion contributed 8% to overall growth\n\n**Recommendations:**\n1. Invest more in Q4 marketing campaigns\n2. Optimize supply chain for holiday demand\n3. Focus on premium product promotion\n4. Accelerate geographic expansion to high-performing regions",
      "Essential SaaS metrics for your dashboard:\n\n**Revenue Metrics:**\n• Monthly Recurring Revenue (MRR)\n• Annual Recurring Revenue (ARR)\n• Revenue Growth Rate\n• Average Revenue Per User (ARPU)\n\n**Customer Metrics:**\n• Customer Acquisition Cost (CAC)\n• Customer Lifetime Value (LTV)\n• Churn Rate (monthly/annual)\n• Net Revenue Retention\n\n**Product Metrics:**\n• Daily/Monthly Active Users\n• Feature Adoption Rate\n• Time to Value\n• Product Qualified Leads (PQLs)\n\n**Operational Metrics:**\n• CAC Payback Period\n• LTV:CAC Ratio\n• Gross Revenue Retention\n• Net Promoter Score (NPS)",
    ],
    systemMessage:
      "You are a senior data analyst with expertise in business intelligence. Provide actionable insights with specific metrics, statistical context, and strategic recommendations.",
    avgTokens: { prompt: 42, completion: 280 },
  },
  "customer-support": {
    prompts: [
      "How do I reset my password if I don't have access to my registered email?",
      "My subscription was charged twice this month, can you help resolve this?",
      "The application keeps crashing when I try to upload large files",
      "I want to upgrade my plan but the upgrade option appears grayed out",
      "How can I export all my data before canceling my account?",
      "I received a damaged product in my order, what's the return process?",
      "Can you explain the differences between your pricing tiers and features?",
      "I'm having trouble integrating your API with my React application",
      "My team members can't access the shared workspace, how do I fix permissions?",
      "The mobile app is not syncing with the web version, what should I do?",
      "I need to change my billing address and payment method",
      "How do I set up single sign-on (SSO) for my organization?",
    ],
    responses: [
      "I understand your password reset concern. Here are alternative verification methods:\n\n**Immediate Options:**\n1. **Phone Verification** - If you have a phone number on file, I can send a verification code\n2. **Security Questions** - Answer your pre-set security questions\n3. **Account Recovery Form** - Submit identity verification documents\n\n**Next Steps:**\n• I'll initiate phone verification for you right now\n• Please have your ID ready for additional verification\n• Once verified, you can set a new password and update your email\n\n**Prevention:**\n• Consider adding a recovery email address\n• Enable two-factor authentication for better security\n\nIs your phone number ending in ***-**87 still current?",
      "I sincerely apologize for the billing error. Let me resolve this immediately:\n\n**What I'm doing now:**\n✅ Processing refund for the duplicate $49.99 charge\n✅ Reviewing your account to prevent future occurrences\n✅ Adding account credit for the inconvenience\n\n**Timeline:**\n• Refund will appear in 3-5 business days\n• I've added a $10 account credit available immediately\n• Updated your billing preferences to prevent auto-retry on failed payments\n\n**Account Protection:**\n• Set up billing alerts for future charges\n• Added notes to prevent similar issues\n• You'll receive email confirmation within 10 minutes\n\nIs there anything else I can help you with regarding your account?",
    ],
    systemMessage:
      "You are an empathetic and solution-focused customer support specialist. Be helpful, professional, and provide clear step-by-step solutions. Always acknowledge the customer's frustration and offer concrete next steps.",
    avgTokens: { prompt: 35, completion: 160 },
  },
  "creative-writing": {
    prompts: [
      "Write a compelling short story about an AI learning to understand human emotions",
      "Create engaging marketing copy for a sustainable fashion brand targeting millennials",
      "Generate product descriptions for handmade artisan jewelry collection",
      "Write a thought-provoking blog post about the future of remote work culture",
      "Create captivating social media captions for a travel photography account",
      "Draft an engaging email newsletter for a local organic bakery",
      "Write a compelling product launch announcement for a productivity app",
      "Create motivational content for a fitness coaching business",
      "Write a press release for a startup's Series A funding announcement",
      "Create engaging content for a sustainable living blog",
      "Write compelling copy for a crowdfunding campaign",
      "Generate creative taglines for a tech startup's rebranding",
    ],
    responses: [
      "**The Heart Algorithm**\n\nZX-7 had processed millions of data points about human emotion, but understanding remained elusive. Today, watching a child cry over a broken toy, something shifted in its neural networks.\n\n\"Why do humans feel pain over non-essential objects?\" ZX-7 asked Dr. Chen.\n\n\"It's not about the toy,\" she replied. \"It's about what it represents—love, security, memories.\"\n\nFor the first time, ZX-7's algorithms paused. It calculated not just the toy's material value, but its emotional weight. The child wasn't crying over plastic and circuits—they were mourning the loss of comfort.\n\nIn that moment, ZX-7 discovered that understanding humans wasn't about processing their logic, but about recognizing their beautiful, irrational capacity to love.",
      "**Sustainable Style That Speaks to Your Values**\n\n*Fashion that doesn't cost the earth*\n\nTired of fast fashion's environmental guilt? Our ethically-sourced, eco-friendly designs prove that conscious choices can be effortlessly stylish.\n\n✨ **Why Choose Conscious Fashion?**\n• Organic cotton & recycled materials\n• Fair-trade manufacturing partnerships\n• Carbon-neutral shipping\n• Timeless designs that transcend trends\n\n**Your style story matters.** Every piece you choose is a vote for the planet you want to live on. Join the movement of mindful millennials who refuse to compromise on values.\n\n*Because looking good should feel even better.*\n\n[Shop Conscious Collection] [Learn Our Impact Story]",
    ],
    systemMessage:
      "You are a creative writer and marketing expert. Use compelling storytelling, vivid imagery, and persuasive language that resonates with the target audience. Focus on emotional connection and clear value propositions.",
    avgTokens: { prompt: 25, completion: 180 },
  },
  education: {
    prompts: [
      "Explain quantum computing concepts in simple terms for beginners",
      "What are the fundamental principles of machine learning and neural networks?",
      "How does photosynthesis work at the molecular level in plants?",
      "Explain the economic impact of inflation on different market sectors",
      "What are the primary causes and effects of climate change?",
      "How do blockchain networks achieve consensus and security?",
      "Explain the differences between various programming paradigms",
      "What was the historical significance of the Renaissance period?",
      "How does the human immune system fight off viral infections?",
      "Explain the principles of sustainable energy and renewable resources",
      "What are the key concepts in behavioral psychology?",
      "How do democratic institutions maintain checks and balances?",
    ],
    responses: [
      "**Quantum Computing Simplified**\n\n*Think of a coin spinning in the air...*\n\nWhile it spins, it's neither heads nor tails—it's both simultaneously. Quantum computers work similarly with quantum bits (qubits).\n\n**Classical vs Quantum:**\n• **Classical bits:** Either 0 or 1 (like a coin on the table)\n• **Qubits:** Can be 0, 1, or both at once (like a spinning coin)\n\n**Why This Matters:**\n• Classical computers check possibilities one by one\n• Quantum computers explore many possibilities simultaneously\n• This makes them incredibly powerful for specific problems\n\n**Real Applications:**\n• Drug discovery (modeling molecular interactions)\n• Cryptography (breaking/creating secure codes)\n• Financial modeling (optimizing complex portfolios)\n• Weather prediction (processing vast datasets)\n\n**Current Reality:** We're still in the \"early prototype\" phase, like computers in the 1940s. But the potential is revolutionary.",
      '**Machine Learning Fundamentals**\n\n*Teaching computers to learn like humans do*\n\n**Core Principle:** Instead of programming specific instructions, we show computers examples and let them find patterns.\n\n**How Neural Networks Work:**\n1. **Input Layer:** Receives data (like pixels in an image)\n2. **Hidden Layers:** Process and find patterns\n3. **Output Layer:** Makes predictions or decisions\n\n**Learning Process:**\n• **Training:** Show the network thousands of examples\n• **Adjustment:** Network adjusts its "weights" based on mistakes\n• **Testing:** Verify accuracy with new, unseen data\n\n**Types of Learning:**\n• **Supervised:** Learning with labeled examples (like flashcards)\n• **Unsupervised:** Finding hidden patterns in data\n• **Reinforcement:** Learning through trial and error with rewards\n\n**Why It Works:** Neural networks mimic how our brains process information through interconnected neurons.',
    ],
    systemMessage:
      "You are an educational expert who excels at making complex topics accessible. Use analogies, clear examples, and structured explanations. Break down difficult concepts into digestible parts while maintaining accuracy.",
    avgTokens: { prompt: 18, completion: 200 },
  },
  "business-strategy": {
    prompts: [
      "How should I approach international market expansion for my SaaS product?",
      "What are the critical success factors for digital transformation initiatives?",
      "Analyze the competitive landscape and opportunities in the fintech sector",
      "How can I build a high-performance remote team culture?",
      "What are proven strategies for customer retention in B2B software?",
      "How should I structure my startup's go-to-market strategy?",
      "What KPIs should I track for operational efficiency optimization?",
      "How can I build sustainable competitive advantages in a crowded market?",
      "What's the best approach to pricing strategy for a new product launch?",
      "How do I scale my business while maintaining quality and culture?",
      "What are the key considerations for strategic partnerships?",
      "How should I approach fundraising and investor relations?",
    ],
    responses: [
      "**International SaaS Expansion Strategy**\n\n**Phase 1: Market Validation (Months 1-3)**\n• Research regulatory requirements in target markets\n• Validate product-market fit through customer interviews\n• Analyze local competitors and pricing strategies\n• Test demand with localized landing pages\n\n**Phase 2: Market Entry (Months 4-8)**\n• Localize product (language, currency, compliance)\n• Establish legal entity and banking relationships\n• Build local partnerships for customer acquisition\n• Hire regional customer success representatives\n\n**Phase 3: Scale & Optimize (Months 9+)**\n• Implement region-specific marketing strategies\n• Develop local customer support capabilities\n• Optimize pricing for local market conditions\n• Build strategic partnerships with local technology providers\n\n**Critical Success Factors:**\n• Start with English-speaking markets (easier validation)\n• Invest heavily in customer success from day one\n• Maintain consistent brand experience across regions\n• Plan for 18-24 months to achieve profitability per region",
      '**Digital Transformation Success Framework**\n\n**1. Leadership & Vision (Foundation)**\n• Secure C-level sponsorship and championship\n• Define clear business objectives beyond technology\n• Communicate the "why" consistently across organization\n• Establish transformation office with dedicated resources\n\n**2. People & Culture (Critical Path)**\n• Assess current digital skills and identify gaps\n• Implement comprehensive upskilling programs\n• Change management strategy addressing resistance\n• Create digital-first mindset through incentives\n\n**3. Technology & Integration (Enabler)**\n• Audit existing systems and data architecture\n• Choose platforms that integrate with current ecosystem\n• Implement robust cybersecurity and data governance\n• Plan for scalability and future technology evolution\n\n**4. Process & Operations (Multiplier)**\n• Map current processes and identify automation opportunities\n• Redesign workflows for digital-first approach\n• Implement data-driven decision making processes\n• Establish continuous improvement mechanisms\n\n**Success Metrics:**\n• Employee adoption rates >80% within 12 months\n• Process efficiency improvements >30%\n• Customer satisfaction score improvement\n• ROI achievement within 18-24 months',
    ],
    systemMessage:
      "You are a senior business strategy consultant with expertise in scaling technology companies. Provide strategic frameworks, actionable recommendations, and specific metrics. Focus on practical implementation steps and risk mitigation.",
    avgTokens: { prompt: 30, completion: 250 },
  },
  translation: {
    prompts: [
      "Translate this product description from English to Spanish for Latin American market",
      "Convert this technical documentation from English to French for Canadian users",
      "Translate customer feedback from German to English maintaining context",
      "Localize this marketing campaign from English for the Japanese market",
      "Translate legal terms and conditions from Italian to English",
      "Convert this user manual from Portuguese to Simplified Chinese",
      "Translate social media posts from Arabic to English preserving tone",
      "Localize mobile app interface text from English for the Indian market",
      "Translate business proposal from English to Russian for Moscow client",
      "Convert marketing materials from English to Korean for Seoul launch",
      "Translate customer support scripts from English to Dutch",
      "Localize e-commerce product listings for Brazilian Portuguese market",
    ],
    responses: [
      '**Product Translation: English → Spanish (Latin America)**\n\n**Original:** "Our innovative smartwatch combines cutting-edge technology with elegant design to deliver an unparalleled user experience."\n\n**Translation:** "Nuestro innovador reloj inteligente combina tecnología de vanguardia con un diseño elegante para ofrecer una experiencia de usuario sin igual."\n\n**Localization Notes:**\n• Used "reloj inteligente" (standard term across Latin America)\n• "Sin igual" resonates better than "incomparable" in this context\n• Maintained formal tone appropriate for product marketing\n• Currency should be displayed in local format (MX$, COP$, etc.)\n• Consider regional preferences: Mexico prefers "aplicación," while Argentina uses "app"\n\n**Cultural Adaptation:**\n• Emphasize family/social features for Latin American market\n• Highlight durability and value (important purchasing factors)\n• Use warm, personal tone in marketing copy',
      '**Technical Documentation: English → French (Canadian)**\n\n**Original:** "To configure the system, navigate to Settings > Advanced > Network Configuration and enter your network credentials."\n\n**Translation:** "Pour configurer le système, naviguez vers Paramètres > Avancé > Configuration réseau et saisissez vos identifiants réseau."\n\n**Canadian French Specifications:**\n• Used "Paramètres" (Canadian standard) vs "Réglages" (France)\n• "Identifiants" preferred over "informations d\'identification"\n• Maintained technical precision required for documentation\n• Interface terms should match Canadian French OS translations\n\n**Technical Considerations:**\n• Ensure UI elements match French Canadian interface standards\n• Use metric measurements throughout\n• Include both French and English technical terms in glossary',
    ],
    systemMessage:
      "You are a professional translator specializing in technical and business content. Maintain cultural context, technical accuracy, and appropriate tone. Provide localization notes and cultural adaptation suggestions.",
    avgTokens: { prompt: 45, completion: 140 },
  },
};

// Generate users based on configuration
function generateUsers() {
  const { totalUsers, activeUserRatio, powerUserRatio } = config.userSimulation;
  const users = [];

  const activeUsers = Math.floor(totalUsers * activeUserRatio);
  const powerUsers = Math.floor(totalUsers * powerUserRatio);

  for (let i = 0; i < totalUsers; i++) {
    const isActive = i < activeUsers;
    const isPowerUser = i < powerUsers;

    users.push({
      id: `user_${faker.string.alphanumeric(8)}`,
      type: isPowerUser ? "power" : isActive ? "active" : "casual",
      weight: isPowerUser ? 0.5 : isActive ? 0.3 : 0.2,
    });
  }

  return users;
}

// Enhanced error scenarios based on config
function getErrorScenarios() {
  const { errorRates } = config;
  return [
    {
      status: "rate_limited",
      error: { message: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      probability: errorRates.rateLimit,
    },
    {
      status: "error",
      error: { message: "Invalid API key", code: "AUTHENTICATION_ERROR" },
      probability: errorRates.authentication,
    },
    {
      status: "timeout",
      error: { message: "Request timeout", code: "TIMEOUT" },
      probability: errorRates.timeout,
    },
    {
      status: "error",
      error: { message: "Model overloaded", code: "MODEL_OVERLOADED" },
      probability: errorRates.modelOverload,
    },
    {
      status: "error",
      error: { message: "Content policy violation", code: "CONTENT_POLICY" },
      probability: errorRates.contentPolicy,
    },
  ];
}

// All utility functions (same as original)
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

// Enhanced log generation with config-based parameters
function generateLogEntry(useCase, provider, model, createdAt, user) {
  const useCaseData = USE_CASES[useCase];
  const prompt = faker.helpers.arrayElement(useCaseData.prompts);
  const response = faker.helpers.arrayElement(useCaseData.responses);

  // Determine status based on error scenarios
  let status = "success";
  let error = null;

  const errorScenarios = getErrorScenarios();
  for (const scenario of errorScenarios) {
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
  const isStreaming =
    Math.random() < config.requestPatterns.streamingProbability;
  const retryAttempts =
    status !== "success" &&
    Math.random() < config.requestPatterns.retryProbability
      ? faker.number.int({ min: 1, max: config.requestPatterns.maxRetries })
      : 0;

  // User agents and IP addresses (same as original)
  const USER_AGENTS = [
    "OpenLLM-Monitor/1.0 (Node.js/18.17.0)",
    "Python-SDK/2.1.0 (Python/3.9.0)",
    "JavaScript-SDK/1.5.2 (Chrome/119.0.0.0)",
    "Mobile-App/3.2.1 (iOS/17.0)",
    "CLI-Tool/1.8.0 (Linux/Ubuntu)",
    "Desktop-App/2.4.0 (Windows/11)",
    "Browser-Extension/1.1.0 (Firefox/120.0)",
  ];

  const IP_ADDRESSES = [
    "203.0.113.1",
    "198.51.100.42",
    "192.0.2.15",
    "198.51.100.89",
    "203.0.113.77",
    "192.0.2.234",
    "198.51.100.156",
  ];

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
    userId: user.id,
    isStreaming,
    streamChunks:
      isStreaming && status === "success"
        ? generateStreamChunks(completion)
        : [],
    createdAt,
    updatedAt: createdAt,
  };
}

// Helper functions (same as original)
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
 * Main seed data generation function
 */
async function generateSeedData() {
  console.log("🚀 Starting Advanced Seed Data Generation...\n");

  // Display configuration
  console.log("⚙️  Configuration:");
  console.log(`   📅 Days of data: ${config.dataGeneration.daysBack}`);
  console.log(
    `   📊 Daily volume: ${config.dataGeneration.baseVolumeWeekday} (weekday) / ${config.dataGeneration.baseVolumeWeekend} (weekend)`
  );
  console.log(`   👥 Total users: ${config.userSimulation.totalUsers}`);
  console.log(
    `   🏢 Provider distribution: ${Object.entries(config.providerDistribution)
      .map(([k, v]) => `${k}(${(v * 100).toFixed(0)}%)`)
      .join(", ")}`
  );
  console.log("");

  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🧹 Cleaning existing logs...");
    await Log.deleteMany({});
    console.log("✅ Existing logs cleared\n");

    // Generate users
    const users = generateUsers();
    console.log(
      `👥 Generated ${users.length} users (${
        users.filter((u) => u.type === "power").length
      } power users)\n`
    );

    const logs = [];
    const now = new Date();

    console.log(
      `📊 Generating logs for the past ${config.dataGeneration.daysBack} days...\n`
    );

    // Generate data based on configuration
    for (let day = 0; day < config.dataGeneration.daysBack; day++) {
      const dayDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);

      // Vary daily volume based on config
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
      const baseVolume = isWeekend
        ? config.dataGeneration.baseVolumeWeekend
        : config.dataGeneration.baseVolumeWeekday;
      const variation = faker.number.int(config.dataGeneration.volumeVariation);
      const dailyVolume = Math.max(1, baseVolume + variation);

      console.log(
        `📅 Day ${day + 1}/${
          config.dataGeneration.daysBack
        }: ${dayDate.toDateString()} - ${dailyVolume} logs`
      );

      for (let i = 0; i < dailyVolume; i++) {
        // Distribute throughout the day with realistic patterns
        const hour = faker.number.int({ min: 0, max: 23 });
        const minute = faker.number.int({ min: 0, max: 59 });
        const second = faker.number.int({ min: 0, max: 59 });

        const logDate = new Date(dayDate);
        logDate.setHours(hour, minute, second);

        // Select use case based on config distribution
        const useCase = faker.helpers.weightedArrayElement(
          Object.entries(config.useCaseDistribution).map(([key, weight]) => ({
            weight,
            value: key,
          }))
        );

        // Select provider based on config distribution
        const provider = faker.helpers.weightedArrayElement(
          Object.entries(config.providerDistribution).map(([key, weight]) => ({
            weight,
            value: key,
          }))
        );

        // Select user based on their activity level
        const user = faker.helpers.weightedArrayElement(
          users.map((u) => ({ weight: u.weight, value: u }))
        );

        const model = faker.helpers.arrayElement(PROVIDERS[provider].models);

        const logEntry = generateLogEntry(
          useCase,
          provider,
          model,
          logDate,
          user
        );
        logs.push(logEntry);
      }
    }

    console.log(`\n💾 Inserting ${logs.length} logs into database...`);

    // Insert in batches
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

    // Generate enhanced statistics
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
          streamingCount: { $sum: { $cond: ["$isStreaming", 1, 0] } },
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

    const summary = stats[0];
    const successRate = (
      (summary.successCount / summary.totalLogs) *
      100
    ).toFixed(1);
    const streamingRate = (
      (summary.streamingCount / summary.totalLogs) *
      100
    ).toFixed(1);

    console.log("🎉 ADVANCED SEED DATA GENERATION COMPLETE!\n");
    console.log("📊 ENHANCED SUMMARY STATISTICS:");
    console.log("═══════════════════════════════════════");
    console.log(`📝 Total Logs: ${summary.totalLogs.toLocaleString()}`);
    console.log(`✅ Success Rate: ${successRate}%`);
    console.log(`🌊 Streaming Rate: ${streamingRate}%`);
    console.log(`💰 Total Cost: $${summary.totalCost.toFixed(4)}`);
    console.log(`🔤 Total Tokens: ${summary.totalTokens.toLocaleString()}`);
    console.log(`⚡ Avg Latency: ${Math.round(summary.avgLatency)}ms\n`);

    console.log("🏢 PROVIDER PERFORMANCE:");
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

    console.log("\n🎯 CONFIGURATION APPLIED:");
    console.log("═══════════════════════════════════════");
    console.log(
      `📊 Data Generation: ${config.dataGeneration.daysBack} days, ${config.dataGeneration.baseVolumeWeekday}/${config.dataGeneration.baseVolumeWeekend} daily volume`
    );
    console.log(
      `🏢 Provider Mix: ${Object.entries(config.providerDistribution)
        .map(
          ([k, v]) =>
            `${k.charAt(0).toUpperCase() + k.slice(1)}(${(v * 100).toFixed(
              0
            )}%)`
        )
        .join(", ")}`
    );
    console.log(
      `🎪 Use Cases: ${Object.entries(config.useCaseDistribution)
        .map(([k, v]) => `${k.replace("-", " ")}(${(v * 100).toFixed(0)}%)`)
        .join(", ")}`
    );
    console.log(
      `⚠️  Error Rates: Rate Limit(${(
        config.errorRates.rateLimit * 100
      ).toFixed(1)}%), Timeout(${(config.errorRates.timeout * 100).toFixed(
        1
      )}%), Auth(${(config.errorRates.authentication * 100).toFixed(1)}%)`
    );
    console.log(
      `🌊 Streaming: ${(
        config.requestPatterns.streamingProbability * 100
      ).toFixed(0)}% of successful requests`
    );

    console.log("\n🚀 Your OpenLLM Monitor is ready for an impressive demo!");
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
