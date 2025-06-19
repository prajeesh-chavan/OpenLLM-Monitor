# MongoDB Setup Guide for OpenLLM Monitor

## Option 1: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/atlas
2. Create a free account and cluster
3. Get connection string from "Connect" → "Connect your application"
4. Update backend/.env with your connection string

## Option 2: Local MongoDB Installation

### Windows:

1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Install MongoDB as a Windows Service
4. MongoDB will start automatically on system boot

### macOS (using Homebrew):

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/community
```

### Ubuntu/Debian:

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 3: Docker

### Using Docker Compose:

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

### Using Docker Command:

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

## Configuration

After setting up MongoDB, update your backend/.env file:

### For Atlas:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/openllm-monitor
```

### For Local Installation:

```
MONGODB_URI=mongodb://localhost:27017/openllm-monitor
```

### For Docker with Authentication:

```
MONGODB_URI=mongodb://admin:password123@localhost:27017/openllm-monitor?authSource=admin
```

## Testing the Connection

Run the backend server to test the MongoDB connection:

```bash
cd backend
npm install
npm start
```

Look for the message: "Connected to MongoDB successfully"

## MongoDB GUI Tools (Optional)

- **MongoDB Compass**: Official GUI tool from MongoDB
- **Robo 3T**: Lightweight MongoDB management tool
- **Studio 3T**: Professional MongoDB IDE

## Troubleshooting

1. **Connection Issues**: Check firewall settings and MongoDB service status
2. **Authentication Errors**: Verify username/password in connection string
3. **Network Access**: For Atlas, add your IP to the whitelist
4. **Port Conflicts**: Ensure port 27017 is not being used by other services
