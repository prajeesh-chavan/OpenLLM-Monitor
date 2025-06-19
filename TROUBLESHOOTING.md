# OpenLLM Monitor - Troubleshooting Guide

_Guide and project by Prajeesh Chavan_

## 🔧 Common Issues and Solutions

This guide helps you quickly diagnose and resolve common issues with OpenLLM Monitor.

## 🚨 Quick Diagnostics

### System Health Check

Before diving into specific issues, run this quick health check:

1. **Backend Health**: Visit `http://localhost:3001/api/health`

   - Should return: `{"status":"OK","timestamp":"...","uptime":"..."}`

2. **Frontend Access**: Visit `http://localhost:5173`

   - Should load the dashboard

3. **Database Connection**: Check backend logs for MongoDB connection messages

4. **WebSocket Status**: Look for connection indicator in the dashboard header

## 🏗️ Setup and Installation Issues

### Issue: MongoDB Connection Failed

**Symptoms:**

- Backend logs show "MongoDB connection error"
- Dashboard shows no data
- API endpoints return database errors

**Solutions:**

1. **Check MongoDB Status**

   ```powershell
   # Check if MongoDB is running
   Get-Process mongod

   # Start MongoDB service (Windows)
   net start MongoDB

   # Start MongoDB manually
   mongod
   ```

2. **Verify Connection String**

   ```env
   # In backend/.env
   MONGODB_URI=mongodb://localhost:27017/openllm-monitor

   # For MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/openllm-monitor
   ```

3. **Test Connection**

   ```powershell
   # Test with mongo shell
   mongo mongodb://localhost:27017/openllm-monitor

   # Test with mongosh (newer versions)
   mongosh mongodb://localhost:27017/openllm-monitor
   ```

4. **Check Firewall Settings**
   - Ensure port 27017 is not blocked
   - Check Windows Firewall settings
   - Verify network connectivity

### Issue: "Port Already in Use" Error

**Symptoms:**

- Backend fails to start with "EADDRINUSE" error
- Frontend shows port conflict

**Solutions:**

1. **Find Process Using Port**

   ```powershell
   # Find process on port 3001 (backend)
   netstat -ano | findstr 3001

   # Kill the process
   taskkill /PID <process_id> /F
   ```

2. **Change Port Configuration**

   ```env
   # In backend/.env
   PORT=3002
   ```

   ```env
   # Update FRONTEND_URL accordingly
   FRONTEND_URL=http://localhost:5173
   ```

3. **Use Different Ports**
   - Backend: Try ports 3001, 3002, 8000, 8080
   - Frontend: Vite will auto-select available ports

### Issue: Dependencies Installation Failed

**Symptoms:**

- `npm install` fails with errors
- Missing package errors
- Build failures

**Solutions:**

1. **Clear npm Cache**

   ```powershell
   npm cache clean --force
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Check Node.js Version**

   ```powershell
   node --version  # Should be 18+
   npm --version   # Should be 8+
   ```

3. **Use Correct Package Manager**

   ```powershell
   # If using npm
   npm install

   # If using yarn
   yarn install

   # If using pnpm
   pnpm install
   ```

4. **Install Missing Dependencies**

   ```powershell
   # Backend common issues
   cd backend
   npm install express mongoose cors dotenv

   # Frontend common issues
   cd frontend
   npm install react react-dom vite
   ```

## 🔌 API and Backend Issues

### Issue: API Endpoints Not Responding

**Symptoms:**

- Frontend shows "Network Error"
- API calls return 404 or 500 errors
- No data loading in dashboard

**Solutions:**

1. **Check Backend Server Status**

   ```powershell
   # In backend directory
   npm run dev

   # Look for these messages:
   # "Server running on port 3001"
   # "MongoDB connected successfully"
   ```

2. **Verify API Endpoints**

   ```powershell
   # Test basic endpoints
   curl http://localhost:3001/api/health
   curl http://localhost:3001/api/logs
   ```

3. **Check CORS Configuration**

   ```javascript
   // In backend/app.js
   app.use(
     cors({
       origin: process.env.FRONTEND_URL || "http://localhost:5173",
       credentials: true,
     })
   );
   ```

4. **Review Backend Logs**
   - Look for error messages in console
   - Check for unhandled promise rejections
   - Verify middleware is properly configured

### Issue: LLM Provider API Errors

**Symptoms:**

- Provider requests fail
- "Invalid API key" errors
- Provider-specific error messages

**Solutions:**

1. **Verify API Keys**

   ```env
   # In backend/.env - make sure keys are correct
   OPENAI_API_KEY=sk-...
   OPENROUTER_API_KEY=sk-or-...
   MISTRAL_API_KEY=...
   ```

2. **Test API Keys Directly**

   ```powershell
   # Test OpenAI key
   curl -H "Authorization: Bearer YOUR_API_KEY" https://api.openai.com/v1/models

   # Test OpenRouter key
   curl -H "Authorization: Bearer YOUR_API_KEY" https://openrouter.ai/api/v1/models
   ```

3. **Check Provider Status**

   - Visit provider status pages
   - Check for service outages
   - Verify account limits and quotas

4. **Review Rate Limits**
   - Check if you're hitting rate limits
   - Implement proper retry logic
   - Consider upgrading provider plans

### Issue: WebSocket Connection Problems

**Symptoms:**

- Dashboard shows "Disconnected" status
- No real-time updates
- WebSocket errors in browser console

**Solutions:**

1. **Check WebSocket Configuration**

   ```javascript
   // In backend/server.js
   const io = require("socket.io")(server, {
     cors: {
       origin: process.env.FRONTEND_URL,
       methods: ["GET", "POST"],
     },
   });
   ```

2. **Verify Frontend WebSocket Connection**

   ```javascript
   // In frontend/src/services/websocket.js
   const socket = io("http://localhost:3001");
   ```

3. **Check Browser Console**

   - Look for WebSocket connection errors
   - Check for CORS issues
   - Verify network connectivity

4. **Test WebSocket Manually**
   - Use browser dev tools Network tab
   - Look for WebSocket upgrade requests
   - Check connection status

## 🖥️ Frontend Issues

### Issue: Dashboard Not Loading

**Symptoms:**

- Blank white screen
- JavaScript errors in console
- Build failures

**Solutions:**

1. **Check Browser Console**

   ```
   F12 -> Console tab
   Look for error messages
   ```

2. **Verify Frontend Server**

   ```powershell
   cd frontend
   npm run dev

   # Look for: "Local: http://localhost:5173"
   ```

3. **Clear Browser Cache**

   - Hard refresh: Ctrl+F5
   - Clear cache and cookies
   - Try incognito/private mode

4. **Check Build Process**

   ```powershell
   # In frontend directory
   npm run build

   # Check for build errors
   # Test with preview
   npm run preview
   ```

### Issue: Data Not Displaying

**Symptoms:**

- Dashboard shows but no data
- Empty tables and charts
- Loading spinners stuck

**Solutions:**

1. **Check API Connectivity**

   ```javascript
   // Open browser console and test
   fetch("http://localhost:3001/api/logs")
     .then((r) => r.json())
     .then(console.log);
   ```

2. **Verify Backend Data**

   ```powershell
   # Check if there's data in MongoDB
   mongo openllm-monitor
   db.logs.count()
   db.logs.findOne()
   ```

3. **Check Network Tab**

   - F12 -> Network tab
   - Look for failed API requests
   - Check response status codes

4. **Review State Management**
   - Check if Zustand store is updating
   - Verify data is being fetched correctly
   - Check for JavaScript errors preventing updates

### Issue: Charts Not Rendering

**Symptoms:**

- Empty chart areas
- Chart loading errors
- Recharts-related errors

**Solutions:**

1. **Check Chart Data Format**

   ```javascript
   // Verify data structure matches chart expectations
   console.log("Chart data:", chartData);
   ```

2. **Verify Recharts Installation**

   ```powershell
   cd frontend
   npm install recharts
   ```

3. **Check Browser Compatibility**

   - Test in different browsers
   - Check for SVG support issues
   - Verify JavaScript is enabled

4. **Review Chart Configuration**
   ```javascript
   // Ensure proper chart props
   <LineChart data={data} width={500} height={300}>
     <XAxis dataKey="name" />
     <YAxis />
     <Line type="monotone" dataKey="value" />
   </LineChart>
   ```

## 🗄️ Database Issues

### Issue: Database Performance Problems

**Symptoms:**

- Slow query responses
- High CPU usage
- Timeout errors

**Solutions:**

1. **Check Database Indexes**

   ```javascript
   // In MongoDB shell
   db.logs.getIndexes();

   // Create missing indexes
   db.logs.createIndex({ timestamp: -1 });
   db.logs.createIndex({ provider: 1, timestamp: -1 });
   ```

2. **Monitor Database Performance**

   ```javascript
   // Check slow queries
   db.setProfilingLevel(2, { slowms: 100 });
   db.system.profile.find().limit(5).sort({ ts: -1 });
   ```

3. **Optimize Queries**

   ```javascript
   // Use efficient query patterns
   db.logs
     .find({ timestamp: { $gte: new Date() } })
     .sort({ timestamp: -1 })
     .limit(100);
   ```

4. **Consider Data Archiving**
   ```javascript
   // Archive old logs
   db.logs.deleteMany({
     timestamp: {
       $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
     },
   });
   ```

### Issue: Data Inconsistency

**Symptoms:**

- Incorrect counts or metrics
- Missing data entries
- Duplicate records

**Solutions:**

1. **Validate Data Integrity**

   ```javascript
   // Check for duplicates
   db.logs.aggregate([
     { $group: { _id: "$requestId", count: { $sum: 1 } } },
     { $match: { count: { $gt: 1 } } },
   ]);
   ```

2. **Fix Data Issues**

   ```javascript
   // Remove duplicates
   db.logs.aggregate([
     { $group: { _id: "$requestId", doc: { $first: "$$ROOT" } } },
     { $replaceRoot: { newRoot: "$doc" } },
     { $out: "logs_deduplicated" },
   ]);
   ```

3. **Implement Data Validation**
   ```javascript
   // Add validation to schema
   const logSchema = new mongoose.Schema({
     requestId: { type: String, required: true, unique: true },
     // ... other fields
   });
   ```

## 🔐 Security and Authentication Issues

### Issue: API Key Security Concerns

**Symptoms:**

- API keys exposed in logs
- Security warnings
- Unauthorized access concerns

**Solutions:**

1. **Secure API Key Storage**

   ```env
   # Never commit .env files to version control
   # Use environment variables in production
   OPENAI_API_KEY=sk-...
   ```

2. **Implement API Key Rotation**

   ```javascript
   // Regularly rotate API keys
   // Implement key validation
   if (!process.env.OPENAI_API_KEY) {
     throw new Error("OPENAI_API_KEY is required");
   }
   ```

3. **Add Request Sanitization**
   ```javascript
   // Remove sensitive data from logs
   const sanitizedRequest = {
     ...request,
     headers: { ...request.headers, authorization: "[REDACTED]" },
   };
   ```

## 📊 Performance Optimization

### Issue: Slow Dashboard Performance

**Symptoms:**

- Long loading times
- Laggy interactions
- High memory usage

**Solutions:**

1. **Optimize Database Queries**

   ```javascript
   // Use pagination
   const logs = await Log.find({})
     .sort({ timestamp: -1 })
     .limit(50)
     .skip(page * 50);
   ```

2. **Implement Caching**

   ```javascript
   // Cache frequently accessed data
   const cachedStats = await redis.get("dashboard-stats");
   if (!cachedStats) {
     const stats = await calculateStats();
     await redis.setex("dashboard-stats", 300, JSON.stringify(stats));
   }
   ```

3. **Optimize Frontend Rendering**

   ```javascript
   // Use React.memo for expensive components
   const ExpensiveComponent = React.memo(({ data }) => {
     // Component logic
   });

   // Debounce search inputs
   const debouncedSearch = useDebounce(searchTerm, 300);
   ```

4. **Reduce Bundle Size**
   ```powershell
   # Analyze bundle size
   npm run build
   npm install --save-dev webpack-bundle-analyzer
   ```

## 🛠️ Development and Debugging

### Issue: Development Environment Issues

**Symptoms:**

- Hot reload not working
- Build errors in development
- Environment inconsistencies

**Solutions:**

1. **Fix Hot Reload Issues**

   ```javascript
   // In vite.config.js
   export default defineConfig({
     plugins: [react()],
     server: {
       host: true,
       port: 5173,
       watch: {
         usePolling: true,
       },
     },
   });
   ```

2. **Resolve Build Errors**

   ```powershell
   # Clear all caches
   rm -rf node_modules/.cache
   rm -rf .vite
   npm install
   ```

3. **Environment Consistency**

   ```powershell
   # Use same Node.js version
   node --version

   # Use .nvmrc file
   echo "18.17.0" > .nvmrc
   nvm use
   ```

### Issue: Testing Problems

**Symptoms:**

- Tests failing unexpectedly
- Setup issues
- Mock problems

**Solutions:**

1. **Fix Test Environment**

   ```javascript
   // In jest.config.js
   module.exports = {
     testEnvironment: "node",
     setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
   };
   ```

2. **Mock External Dependencies**

   ```javascript
   // Mock LLM providers in tests
   jest.mock("../services/openaiService", () => ({
     makeRequest: jest.fn().mockResolvedValue({
       data: { choices: [{ message: { content: "Test response" } }] },
     }),
   }));
   ```

3. **Database Testing**
   ```javascript
   // Use test database
   const MONGODB_URI =
     process.env.NODE_ENV === "test"
       ? "mongodb://localhost:27017/openllm-monitor-test"
       : process.env.MONGODB_URI;
   ```

## 🚨 Emergency Procedures

### Complete System Reset

If everything fails, try this complete reset:

1. **Stop All Services**

   ```powershell
   # Stop all Node.js processes
   Get-Process node | Stop-Process -Force

   # Stop MongoDB
   net stop MongoDB
   ```

2. **Clean Installation**

   ```powershell
   # Remove node_modules
   rm -rf backend/node_modules
   rm -rf frontend/node_modules

   # Remove lock files
   rm backend/package-lock.json
   rm frontend/package-lock.json

   # Fresh install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Reset Database**

   ```javascript
   // In MongoDB shell
   use openllm-monitor
   db.dropDatabase()
   ```

4. **Restart Everything**

   ```powershell
   # Start MongoDB
   mongod

   # Start backend
   cd backend && npm run dev

   # Start frontend
   cd frontend && npm run dev
   ```

## 📞 Getting Additional Help

### Before Asking for Help

1. **Check the logs** - Most issues show up in console logs
2. **Try basic troubleshooting** - Restart, clear cache, check connections
3. **Search existing issues** - Your problem might already be solved
4. **Gather information** - Error messages, browser info, system details

### Information to Include in Bug Reports

- Operating System and version
- Node.js and npm versions
- Browser type and version
- Complete error messages
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if relevant

### Resources

- 📖 [User Guide](./USER_GUIDE.md) - Complete usage documentation
- 🚀 [Quick Start](./QUICK_START.md) - Get up and running fast
- 🔧 [API Documentation](./API_DOCUMENTATION.md) - API reference
- 🏗️ [README](./README.md) - Project overview and setup

---

## 💡 Pro Tips

- **Keep backups** - Regular database backups prevent data loss
- **Monitor logs** - Set up log monitoring for early issue detection
- **Update regularly** - Keep dependencies updated for security and performance
- **Use development tools** - Browser dev tools are your best friend
- **Test in isolation** - Isolate problems by testing components separately

Remember: Most issues have simple solutions. Start with the basics and work your way up to more complex troubleshooting steps!
