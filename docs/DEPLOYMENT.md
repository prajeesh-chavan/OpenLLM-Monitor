# OpenLLM Monitor Deployment Guide

This guide covers different deployment options for the OpenLLM Monitor application.

## Quick Start (Development)

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd OpenLLM Monitor

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Frontend setup
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/openllm-monitor

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# LLM Provider API Keys (optional)
OPENAI_API_KEY=your_openai_key_here
MISTRAL_API_KEY=your_mistral_key_here
OPENROUTER_API_KEY=your_openrouter_key_here

# Ollama Configuration (for local LLM)
OLLAMA_BASE_URL=http://localhost:11434
```

### 3. Start Services

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - MongoDB (if local)
mongod
```

### 4. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- API Health: http://localhost:3001/api/health

## Docker Deployment

### Prerequisites

- Docker and Docker Compose
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd OpenLLM Monitor
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Deploy with Docker Compose

```bash
# Development deployment
docker-compose up -d

# Production deployment
docker-compose -f docker/docker-compose.prod.yml up -d
```

### 4. Access Application

- Application: http://localhost:3000
- Backend API: http://localhost:3001/api
- MongoDB Express: http://localhost:8081 (admin:admin)

### Docker Services

- **mongodb**: MongoDB database server
- **mongo-express**: MongoDB web interface
- **backend**: Node.js API server
- **frontend**: React application (Nginx)

## Production Deployment

### Option 1: VPS/Server Deployment

#### Prerequisites

- Ubuntu 20.04+ server
- Domain name (optional)
- SSL certificate (recommended)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx
```

#### 2. Application Setup

```bash
# Clone repository
git clone <repository-url>
cd OpenLLM Monitor

# Backend setup
cd backend
npm ci --production
cp .env.example .env
# Edit .env for production

# Frontend setup
cd ../frontend
npm ci
npm run build
```

#### 3. Production Environment

Edit `backend/.env`:

```env
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/openllm-monitor-prod
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Add your API keys
OPENAI_API_KEY=your_production_key
MISTRAL_API_KEY=your_production_key
```

#### 4. Start with PM2

```bash
cd backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/openllm-monitor
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/OpenLLM Monitor/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/openllm-monitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Cloud Platform Deployment

#### Heroku Deployment

1. **Setup Heroku CLI and login**

```bash
npm install -g heroku
heroku login
```

2. **Create Heroku apps**

```bash
# Backend
heroku create your-app-backend
heroku addons:create mongolab:sandbox -a your-app-backend

# Frontend
heroku create your-app-frontend
heroku buildpacks:add heroku/nodejs -a your-app-frontend
```

3. **Configure environment variables**

```bash
heroku config:set NODE_ENV=production -a your-app-backend
heroku config:set FRONTEND_URL=https://your-app-frontend.herokuapp.com -a your-app-backend
heroku config:set OPENAI_API_KEY=your_key -a your-app-backend
```

4. **Deploy**

```bash
# Backend
git subtree push --prefix=backend heroku-backend main

# Frontend
git subtree push --prefix=frontend heroku-frontend main
```

#### Vercel Deployment (Frontend)

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy frontend**

```bash
cd frontend
vercel --prod
```

3. **Configure environment**

```bash
vercel env add VITE_API_URL production
vercel env add VITE_WS_URL production
```

#### Railway Deployment

1. **Connect GitHub repository**
2. **Deploy backend and frontend separately**
3. **Configure environment variables in dashboard**
4. **Set up MongoDB add-on**

## Database Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create Atlas Account**
   - Go to https://www.mongodb.com/atlas
   - Create a free account and cluster
   - Get connection string from "Connect" → "Connect your application"

2. **Configure Database**
   - Create database: `openllm-monitor`
   - Create user with read/write access
   - Whitelist your IP addresses or allow access from anywhere (0.0.0.0/0)

3. **Connection String Format**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/openllm-monitor
   ```

### Option 2: Local MongoDB Installation

#### Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Install MongoDB as a Windows Service
4. MongoDB will start automatically on system boot

#### macOS (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/community
```

#### Ubuntu/Debian:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 3: Docker MongoDB

#### Using Docker Compose:
```yaml
version: "3.8"
services:
  mongodb:
    image: mongo:6.0
    container_name: openllm-monitor-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: openllm-monitor
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

#### Using Docker Command:
```bash
docker run -d \
  --name openllm-monitor-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=openllm-monitor \
  -v mongodb_data:/data/db \
  mongo:6.0
```

### MongoDB Configuration Examples

#### For Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/openllm-monitor
```

#### For Local Installation:
```env
MONGODB_URI=mongodb://localhost:27017/openllm-monitor
```

#### For Docker with Authentication:
```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/openllm-monitor?authSource=admin
```

### Testing MongoDB Connection

After setup, test the connection:

```bash
cd backend
npm install
npm start
```

Look for: "Connected to MongoDB successfully"

### MongoDB GUI Tools (Optional)

- **MongoDB Compass**: Official GUI tool from MongoDB
- **Robo 3T**: Lightweight MongoDB management tool  
- **Studio 3T**: Professional MongoDB IDE

### MongoDB Troubleshooting

1. **Connection Issues**: Check firewall settings and MongoDB service status
2. **Authentication Errors**: Verify username/password in connection string
3. **Network Access**: For Atlas, add your IP to the whitelist
4. **Port Conflicts**: Ensure port 27017 is not being used by other services

## Environment Configuration

### Backend Environment Variables

| Variable             | Description        | Default         | Required |
| -------------------- | ------------------ | --------------- | -------- |
| `NODE_ENV`           | Environment        | development     | Yes      |
| `PORT`               | Server port        | 3001            | No       |
| `MONGODB_URI`        | MongoDB connection | localhost       | Yes      |
| `FRONTEND_URL`       | Frontend URL       | localhost:5173  | Yes      |
| `OPENAI_API_KEY`     | OpenAI API key     | -               | No       |
| `MISTRAL_API_KEY`    | Mistral API key    | -               | No       |
| `OPENROUTER_API_KEY` | OpenRouter API key | -               | No       |
| `OLLAMA_BASE_URL`    | Ollama URL         | localhost:11434 | No       |

### Frontend Environment Variables

| Variable       | Description     | Default             | Required |
| -------------- | --------------- | ------------------- | -------- |
| `VITE_API_URL` | Backend API URL | /api                | No       |
| `VITE_WS_URL`  | WebSocket URL   | ws://localhost:3001 | No       |

## Health Checks and Monitoring

### Health Check Endpoints

- Backend: `GET /api/health`
- Frontend: `GET /health`

### PM2 Monitoring

```bash
pm2 status
pm2 logs
pm2 monit
```

### Log Files

- Application logs: `backend/logs/`
- PM2 logs: `~/.pm2/logs/`
- Database logs: `/var/log/mongodb/`

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # ... rest of configuration
}
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/openllm-monitor" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/openllm-monitor" /backup/20240101/openllm-monitor
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   - Check MongoDB service status
   - Verify connection string
   - Check firewall settings

2. **Frontend API Calls Failing**

   - Verify CORS settings
   - Check API URL configuration
   - Verify backend is running

3. **WebSocket Connection Issues**

   - Check proxy configuration
   - Verify WebSocket support
   - Check firewall settings

4. **High Memory Usage**
   - Monitor logs collection size
   - Implement log rotation
   - Check for memory leaks

### Log Locations

- Application: `backend/logs/app.log`
- PM2: `~/.pm2/logs/`
- Nginx: `/var/log/nginx/`
- MongoDB: `/var/log/mongodb/`

### Performance Optimization

1. **Database Indexing**

   ```javascript
   db.logs.createIndex({ timestamp: -1 });
   db.logs.createIndex({ provider: 1, timestamp: -1 });
   ```

2. **Log Rotation**

   - Implement log retention policy
   - Archive old logs
   - Monitor disk usage

3. **Caching**
   - Enable Nginx caching
   - Implement Redis for sessions
   - Cache API responses

## Security Considerations

1. **API Keys**

   - Store in environment variables
   - Use different keys for different environments
   - Rotate keys regularly

2. **Database Security**

   - Enable authentication
   - Use strong passwords
   - Restrict IP access

3. **Network Security**

   - Use HTTPS in production
   - Configure firewall
   - Regular security updates

4. **Application Security**
   - Input validation
   - Rate limiting
   - Error handling

## Maintenance

### Regular Tasks

- Update dependencies
- Monitor disk usage
- Check log files
- Backup database
- Monitor performance metrics
- Review error logs

### Updates

```bash
# Update application
git pull origin main
cd backend && npm ci
cd ../frontend && npm ci && npm run build
pm2 restart all
```
