# OpenLLM Monitor

**Created and maintained by Prajeesh Chavan**

A comprehensive, real-time LLM observability dashboard for developers using OpenAI, Ollama, OpenRouter, Mistral, and other LLM providers.

## 🚀 Features

### Core Monitoring

- **Real-time Request Logging** - Monitor all LLM API calls with detailed metrics
- **Prompt Replay & Comparison** - Re-run prompts across different providers/models
- **Cost Tracking & Analysis** - Track spending across providers with detailed breakdowns
- **Performance Monitoring** - Latency tracking, retry analysis, and error monitoring

### Provider Support

- **OpenAI** - GPT-3.5, GPT-4, and other OpenAI models
- **Ollama** - Local LLM deployment monitoring
- **OpenRouter** - Access to multiple LLM providers through one API
- **Mistral AI** - European LLM provider integration

### Integration Options

- **Zero-code integration**: Use our proxy servers to monitor LLM calls without changing your code
- **SDK wrappers**: Drop-in replacements for popular LLM client libraries
- **CLI monitoring**: Tools for monitoring command-line LLM usage

See [AUTOMATIC_MONITORING.md](AUTOMATIC_MONITORING.md) for automatic monitoring options.  
See [OLLAMA_TROUBLESHOOTING.md](OLLAMA_TROUBLESHOOTING.md) for help with Ollama connection issues.  
See [OLLAMA_CLI_INTEGRATION.md](OLLAMA_CLI_INTEGRATION.md) for logging Ollama CLI commands in OpenLLM Monitor.

### Dashboard Features

- **Real-time WebSocket Updates** - Live dashboard updates
- **Comprehensive Analytics** - Usage patterns, cost analysis, performance metrics
- **Export Capabilities** - Export logs and analytics data
- **Error Tracking** - Detailed error analysis and monitoring
- **Multi-Environment Support** - Development, staging, and production environments

## 🏗️ Architecture

```
openllm-monitor/
├── backend/                    # Node.js + Express + MongoDB
│   ├── controllers/           # API controllers
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── middlewares/          # Custom middleware (LLM logger)
│   ├── services/             # LLM provider services
│   ├── utils/                # Utilities (cost estimator, token counter)
│   ├── config/               # Configuration files
│   ├── app.js                # Express application
│   └── server.js             # Server entry point
│
├── frontend/                  # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Layout components
│   │   ├── store/            # Zustand state management
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   └── public/               # Static assets
│
├── .env.example              # Environment variables template
├── README.md                 # This file
└── docker-compose.yml        # Docker configuration (optional)
```

## 🛠️ Technologies Used

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.IO** - Real-time communication
- **Axios** - HTTP client for LLM APIs
- **Tiktoken** - Token counting for OpenAI models
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Recharts** - Data visualization
- **Socket.IO Client** - Real-time updates
- **React Hot Toast** - Notifications

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd openllm-monitor

# Setup backend
cd backend
npm install
cp ../.env.example .env
# Edit .env with your configuration

# Setup frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/openllm-monitor

# Server
PORT=3001
NODE_ENV=development

# LLM Provider API Keys
OPENAI_API_KEY=your-openai-api-key-here
OPENROUTER_API_KEY=your-openrouter-api-key-here
MISTRAL_API_KEY=your-mistral-api-key-here

# Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434

# CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Start Development Servers

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- API Documentation: http://localhost:3001/api/info

## 📦 Installation & Dependencies

### Backend Dependencies

```bash
cd backend
npm install express mongoose cors dotenv helmet morgan
npm install express-rate-limit joi axios tiktoken socket.io
npm install bcrypt jsonwebtoken uuid
npm install --save-dev nodemon jest supertest
```

### Frontend Dependencies

```bash
cd frontend
npm install react react-dom react-router-dom
npm install axios socket.io-client @headlessui/react @heroicons/react
npm install recharts react-hot-toast clsx date-fns
npm install react-syntax-highlighter lucide-react
npm install tailwind-merge zustand
npm install --save-dev @vitejs/plugin-react tailwindcss autoprefixer postcss
```

## 🔧 Configuration

### Provider Setup

1. **OpenAI**: Get API key from https://platform.openai.com/api-keys
2. **OpenRouter**: Get API key from https://openrouter.ai/keys
3. **Mistral AI**: Get API key from https://console.mistral.ai/
4. **Ollama**: Install locally from https://ollama.ai/

### MongoDB Setup

OpenLLM Monitor requires MongoDB for data storage. You have several options:

#### Option 1: Quick Setup with Scripts (Recommended)

We provide automated setup scripts for your convenience:

**Windows:**

```bash
# PowerShell
.\scripts\setup-mongodb.ps1

# Command Prompt
.\scripts\setup-mongodb.bat
```

**macOS/Linux:**

```bash
chmod +x scripts/setup-mongodb.sh
./scripts/setup-mongodb.sh
```

#### Option 2: Docker (Recommended for Development)

1. **Prerequisites:** Install [Docker Desktop](https://docs.docker.com/get-docker/)

2. **Start MongoDB:**

   ```bash
   docker-compose up -d mongodb
   ```

3. **Access Admin UI:** http://localhost:8081 (admin/admin)

4. **Connection String:** `mongodb://admin:password123@localhost:27017/openllm-monitor?authSource=admin`

#### Option 3: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string from "Connect" → "Connect your application"
4. Add to your `.env` file

#### Option 4: Local Installation

**Windows:**

- Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Follow installation wizard
- MongoDB will run as Windows Service

**macOS:**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Ubuntu/Linux:**

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Environment Configuration

After setting up MongoDB, create `backend/.env`:

```env
# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Security
JWT_SECRET=your-super-secret-jwt-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket Configuration
WS_CORS_ORIGIN=http://localhost:5173

# LLM Provider API Keys (Optional)
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key
# OPENROUTER_API_KEY=your-openrouter-api-key
# MISTRAL_API_KEY=your-mistral-api-key
```

For detailed MongoDB setup instructions, see [MONGODB_SETUP.md](./MONGODB_SETUP.md).

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
# ... other API keys
```

### Build and Deploy

```bash
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/dist/
# Copy to backend/public/ or serve with nginx

# Start production server
cd backend
npm start
```

### Docker Deployment (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📖 API Documentation

### Main Endpoints

- `GET /api/health` - Health check
- `GET /api/info` - API information

### Logs API

- `GET /api/logs` - Get logs with filtering/pagination
- `GET /api/logs/:id` - Get specific log
- `GET /api/logs/stats` - Get dashboard statistics
- `GET /api/logs/comparison` - Get model comparison
- `DELETE /api/logs/:id` - Delete log

### Replay API

- `POST /api/replay` - Replay a prompt
- `POST /api/replay/compare` - Compare multiple replays
- `POST /api/replay/estimate` - Get cost estimate
- `GET /api/replay/models` - Get available models

### Providers API

- `GET /api/providers` - Get provider configurations
- `PUT /api/providers/:provider` - Update provider config
- `POST /api/providers/:provider/test` - Test connection

## 🔌 Integration Guide

### Automatic Logging Middleware

The LLM Logger middleware automatically captures:

- Request/response data
- Token usage and costs
- Latency and performance metrics
- Error details and retry attempts

### Manual Integration

```javascript
const Log = require("./models/Log");

// Log a request manually
const logData = {
  requestId: "unique-id",
  provider: "openai",
  model: "gpt-3.5-turbo",
  prompt: "Your prompt here",
  completion: "AI response",
  // ... other fields
};

const log = new Log(logData);
await log.save();
```

## 🎯 Usage Examples

### 1. Monitor OpenAI Usage

```javascript
// The middleware automatically logs OpenAI requests
const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: "Hello!" }],
});
// This request is automatically logged!
```

### 2. Replay a Prompt

```javascript
// Via API
const response = await fetch("/api/replay", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Explain quantum computing",
    provider: "openai",
    model: "gpt-4",
    parameters: { temperature: 0.7 },
  }),
});
```

### 3. Compare Providers

```javascript
const comparison = await fetch("/api/replay/compare", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Write a haiku about coding",
    configurations: [
      { provider: "openai", model: "gpt-3.5-turbo" },
      { provider: "openrouter", model: "anthropic/claude-2" },
      { provider: "ollama", model: "llama2" },
    ],
  }),
});
```

## 🔍 Monitoring & Analytics

### Dashboard Features

- Real-time request counter
- Success/failure rates
- Average latency by provider
- Cost breakdown and trends
- Token usage analytics
- Error pattern analysis

### Custom Metrics

- Provider performance comparison
- Model efficiency analysis
- Cost optimization insights
- Usage pattern detection

## 🛡️ Security Features

- API key management (encrypted storage)
- Rate limiting per IP
- Request validation with Joi
- CORS protection
- Helmet security headers
- Input sanitization

## 🤝 Development

### Project Structure Status

✅ Backend foundation complete:

- Express server with middleware
- MongoDB models and schemas
- LLM service integrations (OpenAI, Ollama, OpenRouter)
- API controllers and routes
- WebSocket setup for real-time updates
- Utility functions (token counting, cost estimation)

✅ Frontend foundation complete:

- React + Vite setup
- Tailwind CSS configuration
- Zustand state management
- API service layer
- WebSocket integration
- Routing structure

### Next Steps to Complete

1. **Frontend Components** - Build remaining UI components:

   - Sidebar navigation
   - Header with status indicators
   - Dashboard charts and metrics
   - Logs table with filtering
   - Log detail view
   - Replay interface
   - Provider settings

2. **Testing** - Add comprehensive tests:

   - Backend API tests
   - Frontend component tests
   - Integration tests
   - E2E tests

3. **Documentation** - Complete documentation:

   - API reference
   - Component documentation
   - Deployment guides

4. **Optimization** - Performance improvements:
   - Database indexing
   - Caching strategies
   - Bundle optimization

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details.

## 📚 Documentation

### Quick Start

- 🚀 **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- 📖 **[User Guide](./USER_GUIDE.md)** - Complete guide to using all features
- ✨ **[Features Overview](./FEATURES.md)** - Detailed feature documentation

### Technical Documentation

- 🔧 **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- 🚀 **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions
- 🗄️ **[MongoDB Setup](./MONGODB_SETUP.md)** - Database configuration guide

### Help & Support

- 🛠️ **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions
- 📊 **[Implementation Status](./IMPLEMENTATION_STATUS.md)** - Current feature status
- 📋 **[Testing Results](./TESTING_RESULTS.md)** - Test coverage and results

## 🆘 Support

- **📖 Documentation**: Start with the [User Guide](./USER_GUIDE.md) for comprehensive usage instructions
- **🚀 Quick Help**: Check the [Quick Start Guide](./QUICK_START.md) to get running fast
- **🛠️ Issues**: Use the [Troubleshooting Guide](./TROUBLESHOOTING.md) for common problems
- **🐛 Bug Reports**: Report issues on GitHub with detailed information
- **💬 Community**: Join discussions and get help from other users

## 🎯 What's Next?

1. **New User?** → Start with the [Quick Start Guide](./QUICK_START.md)
2. **Want to explore features?** → Read the [Features Overview](./FEATURES.md)
3. **Ready to deploy?** → Check the [Deployment Guide](./DEPLOYMENT.md)
4. **Having issues?** → Visit the [Troubleshooting Guide](./TROUBLESHOOTING.md)
5. **Need API details?** → Refer to [API Documentation](./API_DOCUMENTATION.md)

---

**Built with ❤️ for the LLM developer community**
