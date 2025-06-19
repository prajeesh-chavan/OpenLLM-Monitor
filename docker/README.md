# Docker Configuration Files

This directory contains Docker-related configuration files and utilities for the OpenLLM Monitor project.

## Files Overview

### Docker Compose Files

- `docker-compose.prod.yml` - Production environment configuration
- `docker-compose-with-ollama.yml` - Configuration that includes Ollama service
- `docker-compose.yml.new` - Alternative/backup compose configuration

### Validation Scripts

- `docker-validate.ps1` - PowerShell script to validate Docker setup
- `docker-validate.sh` - Shell script to validate Docker setup

## Main Files (in root directory)

- `../docker-compose.yml` - Main Docker compose file for development
- `../docker-setup.sh` - Linux/Mac setup script
- `../docker-setup.ps1` - PowerShell setup script
- `../docker-setup.bat` - Windows batch setup script

## Usage

To use the alternative compose files from the root directory:

```bash
# Production environment
docker-compose -f docker/docker-compose.prod.yml up

# With Ollama
docker-compose -f docker/docker-compose-with-ollama.yml up

# Validate setup
./docker/docker-validate.sh  # Linux/Mac
./docker/docker-validate.ps1  # PowerShell
```
