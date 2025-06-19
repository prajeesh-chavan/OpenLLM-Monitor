# Quick Setup Verification

After following the setup instructions, run this checklist to verify everything is working:

## ✅ Verification Checklist

### 1. Services Running

- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API responding at http://localhost:3001/api/health
- [ ] MongoDB connected (check logs)
- [ ] WebSocket connection established

### 2. Dashboard Features

- [ ] Dashboard loads without errors
- [ ] Real-time updates working
- [ ] Navigation between pages works
- [ ] No console errors in browser

### 3. API Functionality

- [ ] Can view existing logs
- [ ] Can create new test requests
- [ ] Analytics data displays correctly
- [ ] Provider configurations accessible

### 4. Database

- [ ] MongoDB collections created
- [ ] Sample data visible
- [ ] Queries performing well
- [ ] Indexes created properly

## 🧪 Test Commands

```bash
# Test backend health
curl http://localhost:3001/api/health

# Test API info
curl http://localhost:3001/api/info

# Test logs endpoint
curl http://localhost:3001/api/logs

# Test provider endpoint
curl http://localhost:3001/api/providers
```

## 🔧 Common Issues

- **Port conflicts**: Change ports in docker-compose.yml
- **MongoDB not starting**: Check Docker container logs
- **Frontend not loading**: Verify Vite dev server is running
- **API not responding**: Check backend logs for errors

## 📊 Expected Response

A healthy API should return:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```
