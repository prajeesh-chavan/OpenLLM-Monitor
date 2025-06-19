# Docker Setup Guide for OpenLLM Monitor

This guide provides comprehensive instructions for setting up OpenLLM Monitor using Docker.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- At least 4GB of available RAM
- At least 10GB of free disk space

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**

```powershell
# Using PowerShell (Recommended)
.\docker-setup.ps1

# Or using Command Prompt
docker-setup.bat
```

**Linux/Mac:**

```bash
chmod +x docker-setup.sh
./docker-setup.sh
```

### Option 2: Manual Setup

1. **Choose your configuration:**

   - `docker-compose.yml` - Standard setup (requires Ollama on host)
   - `docker/docker-compose-with-ollama.yml` - Includes Ollama in Docker
   - `docker/docker-compose.prod.yml` - Production setup with health checks

2. **Start the services:**

```bash
# Standard setup
docker-compose up -d --build

# With Ollama
docker-compose -f docker/docker-compose-with-ollama.yml up -d --build

# Production setup
docker-compose -f docker/docker-compose.prod.yml up -d --build
```

## Configuration Files

### Docker Compose Files

| File                                    | Purpose                    | Use Case                                  |
| --------------------------------------- | -------------------------- | ----------------------------------------- |
| `docker-compose.yml`                    | Standard development setup | When Ollama runs on host machine          |
| `docker/docker-compose-with-ollama.yml` | Complete setup with Ollama | Self-contained environment                |
| `docker/docker-compose.prod.yml`        | Production setup           | Production deployments with health checks |

### Environment Configuration

Copy `.env.docker.template` to `.env` and customize:

```bash
cp .env.docker.template .env
# Edit .env with your preferred settings
```

Key environment variables:

- `MONGODB_URI` - MongoDB connection string
- `OLLAMA_BASE_URL` - Ollama service URL
- `NODE_ENV` - Application environment (development/production)
- `JWT_SECRET` - Secret for JWT token signing
- `CORS_ORIGIN` - Allowed CORS origins

## Services

### Included Services

| Service       | Port  | Description            | Access                    |
| ------------- | ----- | ---------------------- | ------------------------- |
| Frontend      | 3000  | React dashboard        | http://localhost:3000     |
| Backend       | 3001  | Node.js API server     | http://localhost:3001     |
| MongoDB       | 27017 | Database               | mongodb://localhost:27017 |
| Mongo Express | 8081  | Database admin UI      | http://localhost:8081     |
| Ollama        | 11434 | LLM service (optional) | http://localhost:11434    |

### Default Credentials

- **Mongo Express:** admin / admin
- **MongoDB:** admin / password123

## Docker Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build
```

### Maintenance

```bash
# Remove all containers and volumes (DESTRUCTIVE)
docker-compose down -v --remove-orphans

# Clean up Docker system
docker system prune -a

# Check service status
docker-compose ps

# Execute command in container
docker-compose exec backend npm run test
```

## Volumes and Data Persistence

### Data Volumes

- `mongodb_data` - MongoDB database files
- `ollama_data` - Ollama models and data (when using docker/docker-compose-with-ollama.yml)

### Log Files

Application logs are stored in:

- `./logs/backend/` - Backend application logs
- `./logs/mongodb/` - MongoDB logs
- `./logs/nginx/` - Nginx logs (production setup)

### Backup and Restore

**Backup MongoDB:**

```bash
docker-compose exec mongodb mongodump --out /data/backup
docker cp openllm-monitor-mongodb:/data/backup ./backup
```

**Restore MongoDB:**

```bash
docker cp ./backup openllm-monitor-mongodb:/data/backup
docker-compose exec mongodb mongorestore /data/backup
```

## Health Checks

The production setup includes health checks for all services:

- **MongoDB:** Database ping test
- **Backend:** HTTP health endpoint check
- **Frontend:** HTTP server availability check

Check health status:

```bash
docker-compose ps
# Look for "healthy" status
```

## Troubleshooting

### Common Issues

1. **Port Conflicts:**

   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000

   # Change ports in docker-compose.yml
   ports:
     - "3002:3000"  # Use port 3002 instead
   ```

2. **Permission Issues (Linux):**

   ```bash
   sudo chown -R $USER:$USER ./logs
   sudo chmod -R 755 ./logs
   ```

3. **Out of Memory:**

   ```bash
   # Increase Docker memory limit in Docker Desktop settings
   # Or add memory limits to services:
   mem_limit: 1g
   ```

4. **Container Won't Start:**

   ```bash
   # Check logs for specific service
   docker-compose logs backend

   # Check if ports are available
   docker-compose ps
   ```

### Debug Mode

Enable debug logging:

```bash
# Set LOG_LEVEL=debug in .env
LOG_LEVEL=debug

# Restart services
docker-compose restart
```

### Network Issues

```bash
# Check network connectivity
docker-compose exec backend ping mongodb
docker-compose exec frontend wget -O- http://backend:3001/health

# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

## Production Deployment

### Security Considerations

1. **Change default passwords:**

   - Update MongoDB credentials
   - Set strong JWT secrets
   - Use environment-specific passwords

2. **Use HTTPS:**

   - Configure SSL certificates
   - Update CORS settings
   - Set secure cookie flags

3. **Network Security:**
   - Use Docker secrets for sensitive data
   - Implement proper firewall rules
   - Consider using Docker Swarm or Kubernetes

### Performance Optimization

1. **Resource Limits:**

   ```yaml
   deploy:
     resources:
       limits:
         cpus: "0.50"
         memory: 512M
   ```

2. **Database Optimization:**

   - Configure MongoDB indexes
   - Set up MongoDB replica set
   - Use MongoDB monitoring

3. **Caching:**
   - Add Redis for session storage
   - Implement API response caching
   - Use CDN for static assets

## Monitoring and Logging

### Application Monitoring

- Backend health endpoint: `GET /health`
- Database monitoring via Mongo Express
- Container stats: `docker stats`

### Log Management

```bash
# Follow all logs
docker-compose logs -f

# Filter logs by service
docker-compose logs -f backend | grep ERROR

# Export logs
docker-compose logs --no-color > application.log
```

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify service status: `docker-compose ps`
3. Review the troubleshooting section
4. Check GitHub issues for known problems

For additional help, please create an issue in the GitHub repository with:

- Docker version: `docker --version`
- Docker Compose version: `docker-compose --version`
- Operating system
- Error logs
- Steps to reproduce
