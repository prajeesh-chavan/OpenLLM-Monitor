# Ollama Connection Troubleshooting Guide

If you're encountering issues connecting to Ollama from OpenLLM Monitor, use this guide to troubleshoot and resolve the problems.

## Common Error: "Ollama connection test failed: connect ECONNREFUSED ::1:11434"

This error indicates that the OpenLLM Monitor backend cannot connect to Ollama on the expected address and port.

## Solution Options

### Option 1: If running Ollama directly on your host machine

When running OpenLLM Monitor in Docker and Ollama directly on your host machine:

1. Make sure Ollama is actually running on your host machine:

   ```powershell
   # Check if Ollama is running
   curl http://localhost:11434/api/version
   ```

2. If you're starting from scratch, use the updated `docker-compose.yml` which includes the `host.docker.internal` configuration.

3. If using an existing deployment, restart the backend container with the updated configuration:
   ```powershell
   docker-compose down backend
   docker-compose up -d backend
   ```

### Option 2: Run everything in Docker (including Ollama)

For a fully containerized setup:

1. Use the `docker-compose-with-ollama.yml` file:

   ```powershell
   docker-compose -f docker-compose-with-ollama.yml up -d
   ```

2. The first time you run this, you'll need to pull an Ollama model:
   ```powershell
   docker exec openllm-monitor-ollama ollama pull llama2
   ```

## Verifying Your Ollama Connection

To verify the Ollama connection from inside the backend container:

```powershell
docker exec openllm-monitor-backend curl -s http://host.docker.internal:11434/api/version
# Or if using the all-Docker setup:
docker exec openllm-monitor-backend curl -s http://ollama:11434/api/version
```

## Common Issues

1. **Firewall blocking connections**: Make sure your firewall allows connections to port 11434.

2. **Docker network issues**: If using custom Docker networks, ensure the containers can route to each other.

3. **Ollama not started**: Make sure the Ollama service is running.

4. **Docker on Windows network specifics**: Windows Docker Desktop sometimes requires additional configuration for host access.

## Need More Help?

If you're still experiencing issues, try the following:

1. Check the Ollama logs: `docker logs openllm-monitor-ollama` (if using Docker)
2. Check the backend logs: `docker logs openllm-monitor-backend`
3. Verify your Docker network setup: `docker network inspect openllm-network`
