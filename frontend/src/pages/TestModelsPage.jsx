import React, { useState, useEffect } from "react";
import {
  BeakerIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CpuChipIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store";
import ApiService from "../services/api";
import toast from "react-hot-toast";

const TestModelsPage = () => {
  const { notificationSettings } = useAppStore();
  const [testConfigs, setTestConfigs] = useState([
    {
      id: 1,
      prompt: "",
      provider: "openai",
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 1000,
      systemMessage: "You are a helpful assistant.",
      isRunning: false,
      result: null,
      error: null,
    },
  ]);
  const [compareMode, setCompareMode] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [availableModels, setAvailableModels] = useState({});
  const [loadingModels, setLoadingModels] = useState(false);

  // Load saved prompts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("openllm-monitor-test-prompts");
    if (saved) {
      try {
        setSavedPrompts(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load saved prompts:", error);
      }
    }
  }, []);

  // Save prompts to localStorage
  const savePrompt = (prompt, name) => {
    const newPrompt = {
      id: Date.now(),
      name: name || "Untitled Prompt",
      prompt,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedPrompts, newPrompt];
    setSavedPrompts(updated);
    localStorage.setItem("openllm-monitor-test-prompts", JSON.stringify(updated));
    toast.success("Prompt saved successfully!");
  };

  const addTestConfig = () => {
    const newConfig = {
      id: Date.now(),
      prompt: "",
      provider: "openai",
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 1000,
      systemMessage: "You are a helpful assistant.",
      isRunning: false,
      result: null,
      error: null,
    };
    setTestConfigs([...testConfigs, newConfig]);
  };

  const removeTestConfig = (id) => {
    if (testConfigs.length > 1) {
      setTestConfigs(testConfigs.filter(config => config.id !== id));
    }
  };

  const updateTestConfig = (id, updates) => {
    setTestConfigs(configs =>
      configs.map(config =>
        config.id === id ? { ...config, ...updates } : config
      )
    );
  };

  const runTest = async (configId) => {
    const config = testConfigs.find(c => c.id === configId);
    if (!config.prompt.trim()) {
      toast.error("Please enter a prompt to test");
      return;
    }

    updateTestConfig(configId, { isRunning: true, error: null });    try {
      const startTime = Date.now();
      const response = await ApiService.testPrompt({
        provider: config.provider,
        model: config.model,
        prompt: config.prompt,
        systemMessage: config.systemMessage,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        stream: false,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (response.success) {
        updateTestConfig(configId, {
          isRunning: false,
          result: {
            ...response.data,
            duration,
            timestamp: new Date().toISOString(),
          },
        });
        toast.success("Test completed successfully!");
      } else {
        updateTestConfig(configId, {
          isRunning: false,
          error: response.error || "Test failed",
        });
        toast.error("Test failed");
      }
    } catch (error) {
      console.error("Test failed:", error);
      updateTestConfig(configId, {
        isRunning: false,
        error: error.message || "Network error occurred",
      });
      toast.error("Test failed: " + (error.message || "Network error"));
    }
  };

  const runAllTests = async () => {
    const validConfigs = testConfigs.filter(config => config.prompt.trim());
    if (validConfigs.length === 0) {
      toast.error("Please enter prompts to test");
      return;
    }

    toast.success(`Running ${validConfigs.length} tests...`);
    for (const config of validConfigs) {
      await runTest(config.id);
      // Small delay between tests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const loadSavedPrompt = (configId, savedPrompt) => {
    updateTestConfig(configId, { prompt: savedPrompt.prompt });
    toast.success("Prompt loaded!");
  };

  const loadExamplePrompt = (configId, example) => {
    updateTestConfig(configId, { 
      prompt: example.prompt,
      systemMessage: example.systemMessage || "You are a helpful assistant."
    });
    toast.success("Example loaded!");
  };

  // Example prompts for quick testing
  const examplePrompts = [
    {
      name: "Creative Writing",
      prompt: "Write a short story about a robot discovering emotions for the first time.",
      systemMessage: "You are a creative writing assistant."
    },
    {
      name: "Code Review",
      prompt: "Review this Python function and suggest improvements:\n\ndef calculate_factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * calculate_factorial(n-1)",
      systemMessage: "You are a senior software engineer providing code reviews."
    },
    {
      name: "Data Analysis",
      prompt: "Explain the key insights from this sales data trend: Sales increased 15% in Q1, decreased 5% in Q2, increased 25% in Q3, and remained flat in Q4.",
      systemMessage: "You are a data analyst helping interpret business metrics."
    },
    {
      name: "Technical Documentation",
      prompt: "Write API documentation for a REST endpoint that creates a new user account.",
      systemMessage: "You are a technical writer creating clear, comprehensive documentation."
    },
    {
      name: "Problem Solving",
      prompt: "A farmer has 100 animals consisting of cows, pigs, and chickens. If there are 70 heads and 200 legs total, how many of each animal are there?",
      systemMessage: "You are a mathematics tutor helping solve word problems step by step."
    }
  ];

  // Load available models
  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const response = await ApiService.getTestModels();
        if (response.success) {
          setAvailableModels(response.data);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
        // Fallback to default models
        setAvailableModels({
          openai: ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"],
          ollama: ["llama2", "mistral", "phi3:mini"],
          mistral: ["mistral-tiny", "mistral-small", "mistral-medium"],
          openrouter: ["openai/gpt-3.5-turbo", "anthropic/claude-3-haiku"],
        });
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <BeakerIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Models</h1>
              <p className="text-sm text-gray-500">
                Test your prompts directly with any LLM provider
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                compareMode
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ArrowsRightLeftIcon className="h-4 w-4" />
              <span>Compare Mode</span>
            </button>

            <button
              onClick={addTestConfig}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Test</span>
            </button>

            <button
              onClick={runAllTests}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlayIcon className="h-4 w-4" />
              <span>Run All Tests</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">        <div className={`grid gap-6 ${compareMode && testConfigs.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {testConfigs.map((config, index) => (
            <div
              key={config.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm relative"
            >              {/* Loading Overlay */}
              {config.isRunning && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/90 to-purple-50/90 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="relative mb-6">
                      {/* Outer rotating ring */}
                      <div className="w-20 h-20 border-4 border-gray-200 rounded-full mx-auto"></div>
                      {/* Main spinning ring */}
                      <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin mx-auto"></div>
                      {/* Inner pulsing core */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse shadow-lg"></div>
                      </div>
                      {/* Orbiting dots */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 relative animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
                          <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 animate-pulse shadow-md"></div>
                          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full transform -translate-x-1/2 animate-pulse shadow-md" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center justify-center space-x-2">
                        <SparklesIcon className="h-6 w-6 text-blue-600 animate-pulse" />
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                          AI Thinking...
                        </span>
                      </h4>
                      <p className="text-sm text-gray-700 max-w-xs mx-auto font-medium">
                        Processing your prompt with <span className="font-bold text-blue-600">{config.model}</span>
                      </p>
                      <div className="flex items-center justify-center space-x-1 text-xs text-gray-600 mt-4">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce shadow-sm"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="ml-2 font-semibold">Generating response</span>
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-300/50">
                        <p className="text-xs text-gray-600 flex items-center justify-center space-x-1 font-medium">
                          <ClockIcon className="h-3 w-3" />
                          <span>This may take up to 2 minutes for complex prompts</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Config Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <SparklesIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Test {index + 1}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => runTest(config.id)}
                    disabled={config.isRunning || !config.prompt.trim()}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {config.isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-3 w-3" />
                        <span>Run</span>
                      </>
                    )}
                  </button>

                  {testConfigs.length > 1 && (
                    <button
                      onClick={() => removeTestConfig(config.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Configuration */}
              <div className="p-4 space-y-4">
                {/* Provider and Model Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider
                    </label>
                    <select
                      value={config.provider}
                      onChange={(e) =>
                        updateTestConfig(config.id, { provider: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="ollama">Ollama</option>
                      <option value="mistral">Mistral</option>
                      <option value="openrouter">OpenRouter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <select
                      value={config.model}
                      onChange={(e) =>
                        updateTestConfig(config.id, { model: e.target.value })
                      }
                      disabled={loadingModels}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {loadingModels ? (
                        <option value="">Loading models...</option>
                      ) : (
                        availableModels[config.provider]?.map(model => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        )) || <option value="">No models available</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* System Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Message
                  </label>
                  <textarea
                    value={config.systemMessage}
                    onChange={(e) =>
                      updateTestConfig(config.id, { systemMessage: e.target.value })
                    }
                    placeholder="You are a helpful assistant..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Prompt */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Prompt
                      </label>
                      <div className="flex items-center space-x-2">
                        {/* Example Prompts Dropdown */}
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const example = examplePrompts.find(ex => ex.name === e.target.value);
                              if (example) loadExamplePrompt(config.id, example);
                              e.target.value = "";
                            }
                          }}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="">Load example...</option>
                          {examplePrompts.map(example => (
                            <option key={example.name} value={example.name}>
                              {example.name}
                            </option>
                          ))}
                        </select>
                        
                        {/* Saved Prompts Dropdown */}
                        {savedPrompts.length > 0 && (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                const saved = savedPrompts.find(p => p.id.toString() === e.target.value);
                                if (saved) loadSavedPrompt(config.id, saved);
                                e.target.value = "";
                              }
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Load saved...</option>
                            {savedPrompts.map(saved => (
                              <option key={saved.id} value={saved.id}>
                                {saved.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  <textarea
                    value={config.prompt}
                    onChange={(e) =>
                      updateTestConfig(config.id, { prompt: e.target.value })
                    }
                    placeholder="Enter your prompt here..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {config.prompt.length} characters
                    </span>
                    {config.prompt.trim() && (
                      <button
                        onClick={() => {
                          const name = prompt("Enter a name for this prompt:");
                          if (name) savePrompt(config.prompt, name);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Save Prompt
                      </button>
                    )}
                  </div>
                </div>

                {/* Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature: {config.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) =>
                        updateTestConfig(config.id, { temperature: parseFloat(e.target.value) })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={config.maxTokens}
                      onChange={(e) =>
                        updateTestConfig(config.id, { maxTokens: parseInt(e.target.value) })
                      }
                      min="1"
                      max="4000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              {(config.result || config.error) && (
                <div className="border-t border-gray-200 p-4">
                  {config.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        <h4 className="font-medium text-red-800">Test Failed</h4>
                      </div>
                      <p className="text-red-700 text-sm">{config.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Success Header */}
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <h4 className="font-medium text-green-800">Test Completed</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(config.result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <ClockIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-lg font-semibold text-blue-900">
                              {config.result.duration}ms
                            </span>
                          </div>
                          <p className="text-xs text-blue-600 mt-1">Response Time</p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <CpuChipIcon className="h-4 w-4 text-green-600" />
                            <span className="text-lg font-semibold text-green-900">
                              {config.result.tokenUsage?.totalTokens || 0}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">Total Tokens</p>
                        </div>                        <div className="bg-yellow-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <CurrencyDollarIcon className="h-4 w-4 text-yellow-600" />
                            <span className="text-lg font-semibold text-yellow-900">
                              ${(config.result.cost?.totalCost || 0).toFixed(4)}
                            </span>
                          </div>
                          <p className="text-xs text-yellow-600 mt-1">Estimated Cost</p>
                        </div>
                      </div>

                      {/* Response */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">Response</h5>
                          <button
                            onClick={() => copyToClipboard(config.result.response || config.result.completion)}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                            <span>Copy</span>
                          </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                            {config.result.response || config.result.completion || "No response content"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Saved Prompts */}
        {savedPrompts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Prompts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPrompts.map(saved => (
                <div key={saved.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{saved.name}</h3>
                    <button
                      onClick={() => {
                        const updated = savedPrompts.filter(p => p.id !== saved.id);
                        setSavedPrompts(updated);
                        localStorage.setItem("openllm-monitor-test-prompts", JSON.stringify(updated));
                        toast.success("Prompt deleted");
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{saved.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(saved.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => loadSavedPrompt(testConfigs[0].id, saved)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Use in Test 1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestModelsPage;
