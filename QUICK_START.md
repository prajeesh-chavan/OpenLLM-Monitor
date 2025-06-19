# OpenLLM Monitor - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This quick start guide will get you up and running with OpenLLM Monitor in just a few minutes.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ MongoDB running (local or cloud)
- ✅ Git installed

## Step 1: Download and Setup

```powershell
# Clone the repository
git clone <your-repo-url>
cd openllm-monitor

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Configure Environment

Create `backend/.env` file:

```env
# Database (Required)
MONGODB_URI=mongodb://localhost:27017/openllm-monitor

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# LLM Provider API Keys (Add the ones you use)
OPENAI_API_KEY=your-openai-key-here
OPENROUTER_API_KEY=your-openrouter-key-here
MISTRAL_API_KEY=your-mistral-key-here

# Ollama (if using local LLMs)
OLLAMA_BASE_URL=http://localhost:11434
```

## Step 3: Start the Application

Open **3 terminals**:

**Terminal 1 - MongoDB** (if using local MongoDB):

```powershell
# Start MongoDB service
mongod
```

**Terminal 2 - Backend**:

```powershell
cd backend
npm run dev
```

**Terminal 3 - Frontend**:

```powershell
cd frontend
npm run dev
```

## Step 4: Access the Dashboard

1. Open your browser
2. Go to: `http://localhost:5173`
3. You should see the OpenLLM Monitor dashboard! 🎉

## Step 5: Test the System

### Option A: Use Built-in Test Endpoints

1. Navigate to **Logs** page
2. The system automatically logs all LLM requests
3. Check the **Dashboard** for real-time metrics

### Option B: Manual API Test

Open a new terminal and test the API:

```powershell
# Test health endpoint
curl http://localhost:3001/api/health

# Test logs endpoint
curl http://localhost:3001/api/logs
```

## Quick MongoDB Setup (If Needed)

### Option 1: Use Docker (Easiest)

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option 2: Use the Provided Scripts

```powershell
# Windows PowerShell
.\scripts\setup-mongodb.ps1

# Windows Command Prompt
.\scripts\setup-mongodb.bat
```

### Option 3: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Verify Everything is Working

✅ **Backend**: Visit `http://localhost:3001/api/health` - should return `{"status":"OK"}`

✅ **Frontend**: Visit `http://localhost:5173` - should show the dashboard

✅ **Database**: Check the logs show connection to MongoDB

✅ **WebSocket**: Dashboard should show "Connected" status

## What's Next?

### 1. Configure Providers

- Go to **Settings** → **Providers**
- Add your API keys
- Test connections

### 2. Start Monitoring

- Your LLM requests will automatically appear in **Logs**
- View real-time metrics on **Dashboard**
- Analyze performance in **Analytics**

### 3. Try Replay Feature

- Go to **Replay** page
- Test prompts across different providers
- Compare responses and costs

## Troubleshooting

### "Cannot connect to MongoDB"

- Make sure MongoDB is running
- Check the connection string in `.env`
- Try: `mongod --version` to verify installation

### "Frontend won't load"

- Check if backend is running on port 3001
- Verify CORS settings in backend
- Check browser console for errors

### "API keys not working"

- Verify API keys are correct
- Check if you have credits/quota
- Test API keys directly with provider APIs

### "Port already in use"

- Backend (3001): Kill the process or change PORT in `.env`
- Frontend (5173): Vite will automatically try the next available port

## Need Help?

- 📖 Read the full [User Guide](./USER_GUIDE.md)
- 🔧 Check [API Documentation](./API_DOCUMENTATION.md)
- 🚀 Review [Deployment Guide](./DEPLOYMENT.md)
- 🐛 Report issues on GitHub

## Success! 🎉

You now have OpenLLM Monitor running! Start making LLM requests and watch them appear in real-time on your dashboard.

---

**Next Step**: Read the complete [User Guide](./USER_GUIDE.md) to learn about all the powerful features available.
