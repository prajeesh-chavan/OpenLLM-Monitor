@echo off
:: ollama-monitor.bat - A wrapper script for Ollama that logs to OpenLLM Monitor
:: Usage: ollama-monitor run mistral "Hello, how are you?"
:: Or: echo "Hello, how are you?" | ollama-monitor run mistral

if "%1"=="" (
    echo Usage: ollama-monitor run model "prompt"
    echo        echo "prompt" ^| ollama-monitor run model
    exit /b 1
)

:: Execute the Node.js proxy script
node "%~dp0\ollama-proxy.js" %*
