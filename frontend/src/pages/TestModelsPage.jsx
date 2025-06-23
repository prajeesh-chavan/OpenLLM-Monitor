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
  ChevronDownIcon,
  ChevronUpIcon,
  LightBulbIcon,
  CodeBracketIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ArrowLeftIcon,
  BookmarkIcon,
  RocketLaunchIcon,
  TrophyIcon,
  ScaleIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  HeartIcon,
  BoltIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useAppStore } from "../store";
import ApiService from "../services/api";
import toast from "react-hot-toast";

const TestModelsPage = () => {
  const { notificationSettings } = useAppStore();
  const [currentStep, setCurrentStep] = useState("template"); // template, test, results
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [testConfigs, setTestConfigs] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [availableModels, setAvailableModels] = useState({});
  const [loadingModels, setLoadingModels] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonMetrics, setComparisonMetrics] = useState(null);

  // Enhanced template system with categorization
  const templateCategories = [
    {
      id: "quick-start",
      name: "Quick Start",
      icon: RocketLaunchIcon,
      color: "emerald",
      description: "Get started in seconds",
      templates: [
        {
          id: "simple-chat",
          name: "Simple Chat",
          description: "Basic conversation with AI",
          prompt: "Hello! Can you help me understand how neural networks work?",
          systemMessage: "You are a helpful AI assistant.",
          icon: ChatBubbleBottomCenterTextIcon,
          tags: ["beginner", "chat"],
          estimatedTime: "30s",
        },
        {
          id: "quick-question",
          name: "Quick Question",
          description: "Ask any question",
          prompt:
            "What are the main differences between REST and GraphQL APIs?",
          systemMessage: "You are a knowledgeable technical expert.",
          icon: MagnifyingGlassIcon,
          tags: ["qa", "fast"],
          estimatedTime: "45s",
        },
      ],
    },
    {
      id: "development",
      name: "Development",
      icon: CodeBracketIcon,
      color: "blue",
      description: "Code review, debugging, and development tasks",
      templates: [
        {
          id: "code-review",
          name: "Code Review",
          description: "Get feedback on your code",
          prompt: `Review this Python function and suggest improvements:

def calculate_factorial(n):
    if n == 0:
        return 1
    else:
        return n * calculate_factorial(n-1)

Please check for efficiency, readability, and best practices.`,
          systemMessage:
            "You are a senior software engineer providing constructive code reviews. Focus on code quality, performance, and best practices.",
          icon: CodeBracketIcon,
          tags: ["code", "review", "python"],
          estimatedTime: "2min",
        },
        {
          id: "debug-help",
          name: "Debug Assistant",
          description: "Help fix bugs and errors",
          prompt: `I'm getting this error in my JavaScript code:

TypeError: Cannot read property 'map' of undefined

The code is:
const items = fetchData();
const listItems = items.map(item => <li key={item.id}>{item.name}</li>);

What could be causing this and how do I fix it?`,
          systemMessage:
            "You are an expert debugging assistant. Provide clear explanations of errors and practical solutions.",
          icon: SparklesIcon,
          tags: ["debug", "javascript", "error"],
          estimatedTime: "1min",
        },
        {
          id: "api-docs",
          name: "API Documentation",
          description: "Generate API documentation",
          prompt:
            "Write comprehensive API documentation for a REST endpoint that creates a new user account. Include request/response examples, error codes, and authentication requirements.",
          systemMessage:
            "You are a technical writer creating clear, comprehensive API documentation.",
          icon: DocumentTextIcon,
          tags: ["api", "docs", "rest"],
          estimatedTime: "3min",
        },
      ],
    },
    {
      id: "creative",
      name: "Creative",
      icon: PencilSquareIcon,
      color: "purple",
      description: "Writing, brainstorming, and creative tasks",
      templates: [
        {
          id: "story-writing",
          name: "Creative Writing",
          description: "Generate creative content",
          prompt:
            "Write a short story about a robot discovering emotions for the first time. Make it touching and thought-provoking.",
          systemMessage:
            "You are a creative writing assistant with a talent for emotional storytelling.",
          icon: PencilSquareIcon,
          tags: ["creative", "story", "fiction"],
          estimatedTime: "2min",
        },
        {
          id: "brainstorm",
          name: "Brainstorming",
          description: "Generate ideas and solutions",
          prompt:
            "I need creative ideas for a mobile app that helps people reduce food waste. Can you brainstorm 10 innovative features?",
          systemMessage:
            "You are a creative innovation consultant skilled at generating unique, practical ideas.",
          icon: LightBulbIcon,
          tags: ["brainstorm", "ideas", "innovation"],
          estimatedTime: "1min",
        },
      ],
    },
    {
      id: "analysis",
      name: "Analysis",
      icon: ChartBarIcon,
      color: "amber",
      description: "Data analysis and insights",
      templates: [
        {
          id: "data-analysis",
          name: "Data Insights",
          description: "Analyze trends and patterns",
          prompt:
            "Analyze this sales data trend and provide actionable insights: Q1: +15% growth, Q2: -5% decline, Q3: +25% growth, Q4: flat. What patterns do you see and what should we do next?",
          systemMessage:
            "You are a senior data analyst providing strategic business insights.",
          icon: ChartBarIcon,
          tags: ["data", "analysis", "business"],
          estimatedTime: "2min",
        },
        {
          id: "problem-solving",
          name: "Problem Solving",
          description: "Solve complex problems step-by-step",
          prompt:
            "A farmer has 100 animals: cows, pigs, and chickens. There are 70 heads and 200 legs total. How many of each animal are there? Please solve step-by-step.",
          systemMessage:
            "You are a mathematics tutor who explains problems clearly with step-by-step solutions.",
          icon: MagnifyingGlassIcon,
          tags: ["math", "logic", "solving"],
          estimatedTime: "1min",
        },
      ],
    },
  ];

  // Load saved prompts and check if first time
  useEffect(() => {
    const saved = localStorage.getItem("openllm-monitor-test-prompts");
    const hasUsedBefore = localStorage.getItem("openllm-monitor-has-tested");

    if (saved) {
      try {
        setSavedPrompts(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load saved prompts:", error);
      }
    }

    setIsFirstTime(!hasUsedBefore);
  }, []);

  // Initialize with a default config when moving to test step
  const initializeTestConfig = (template) => {
    const newConfig = {
      id: Date.now(),
      prompt: template.prompt,
      provider: "openai",
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 1000,
      systemMessage: template.systemMessage,
      isRunning: false,
      result: null,
      error: null,
      templateId: template.id,
      templateName: template.name,
    };
    setTestConfigs([newConfig]);
    setSelectedTemplate(template);
    setCurrentStep("test");

    // Mark as used
    localStorage.setItem("openllm-monitor-has-tested", "true");
    setIsFirstTime(false);
  };

  const startFromScratch = () => {
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
    setTestConfigs([newConfig]);
    setSelectedTemplate(null);
    setCurrentStep("test");
    localStorage.setItem("openllm-monitor-has-tested", "true");
    setIsFirstTime(false);
  };

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
    localStorage.setItem(
      "openllm-monitor-test-prompts",
      JSON.stringify(updated)
    );
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
      setTestConfigs(testConfigs.filter((config) => config.id !== id));
    }
  };

  const updateTestConfig = (id, updates) => {
    setTestConfigs((configs) =>
      configs.map((config) =>
        config.id === id ? { ...config, ...updates } : config
      )
    );
  };

  const runTest = async (configId) => {
    const config = testConfigs.find((c) => c.id === configId);
    if (!config.prompt.trim()) {
      toast.error("Please enter a prompt to test");
      return;
    }

    updateTestConfig(configId, { isRunning: true, error: null });
    try {
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
    const validConfigs = testConfigs.filter((config) => config.prompt.trim());
    if (validConfigs.length === 0) {
      toast.error("Please enter prompts to test");
      return;
    }

    toast.success(`Running ${validConfigs.length} tests...`);
    for (const config of validConfigs) {
      await runTest(config.id);
      // Small delay between tests to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 500));
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
  const getColorClasses = (color) => {
    const colors = {
      emerald: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        hover: "hover:bg-emerald-100",
        text: "text-emerald-700",
        icon: "text-emerald-600",
        accent: "bg-emerald-100",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        hover: "hover:bg-blue-100",
        text: "text-blue-700",
        icon: "text-blue-600",
        accent: "bg-blue-100",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        hover: "hover:bg-purple-100",
        text: "text-purple-700",
        icon: "text-purple-600",
        accent: "bg-purple-100",
      },
      amber: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        hover: "hover:bg-amber-100",
        text: "text-amber-700",
        icon: "text-amber-600",
        accent: "bg-amber-100",
      },
    };
    return colors[color] || colors.blue;
  };

  // Enhanced comparison analysis functions
  const analyzeComparison = (completedConfigs) => {
    if (completedConfigs.length < 2) return null;

    const results = completedConfigs.map((config) => ({
      id: config.id,
      model: config.model,
      provider: config.provider,
      result: config.result,
      response: config.result?.response || config.result?.completion || "",
      duration: config.result?.duration || 0,
      tokens: config.result?.tokenUsage?.totalTokens || 0,
      cost: config.result?.cost?.totalCost || 0,
    }));

    // Performance analysis
    const fastest = results.reduce((prev, curr) =>
      prev.duration < curr.duration ? prev : curr
    );
    const cheapest = results.reduce((prev, curr) =>
      prev.cost < curr.cost ? prev : curr
    );
    const mostTokens = results.reduce((prev, curr) =>
      prev.tokens > curr.tokens ? prev : curr
    );

    // Response quality analysis (simple heuristics)
    const responseAnalysis = results.map((result) => ({
      ...result,
      wordCount: result.response.split(/\s+/).length,
      sentenceCount: result.response.split(/[.!?]+/).length,
      readabilityScore: calculateReadabilityScore(result.response),
      completenessScore: calculateCompletenessScore(
        result.response,
        selectedTemplate
      ),
    }));

    const mostComplete = responseAnalysis.reduce((prev, curr) =>
      prev.completenessScore > curr.completenessScore ? prev : curr
    );
    const mostReadable = responseAnalysis.reduce((prev, curr) =>
      prev.readabilityScore > curr.readabilityScore ? prev : curr
    );

    // Generate insights
    const insights = generateInsights(results, responseAnalysis);

    return {
      performance: { fastest, cheapest, mostTokens },
      quality: { mostComplete, mostReadable },
      insights,
      detailed: responseAnalysis,
    };
  };

  const calculateReadabilityScore = (text) => {
    // Simple readability heuristic (0-100)
    const avgWordsPerSentence =
      text.split(/\s+/).length / Math.max(text.split(/[.!?]+/).length, 1);
    const avgCharsPerWord = text.length / Math.max(text.split(/\s+/).length, 1);

    // Prefer shorter sentences and words for readability
    const sentenceScore = Math.max(0, 100 - (avgWordsPerSentence - 15) * 2);
    const wordScore = Math.max(0, 100 - (avgCharsPerWord - 5) * 5);

    return Math.round((sentenceScore + wordScore) / 2);
  };

  const calculateCompletenessScore = (response, template) => {
    // Simple completeness heuristic based on response length and key elements
    const baseScore = Math.min(response.length / 10, 80); // Length component

    let bonusScore = 0;
    if (template?.tags?.includes("code") && response.includes("```"))
      bonusScore += 20;
    if (template?.tags?.includes("analysis") && response.includes("conclusion"))
      bonusScore += 15;
    if (response.includes("example") || response.includes("for instance"))
      bonusScore += 10;

    return Math.min(100, Math.round(baseScore + bonusScore));
  };

  const generateInsights = (results, analysis) => {
    const insights = [];

    // Performance insights
    const speedDiff =
      Math.max(...results.map((r) => r.duration)) -
      Math.min(...results.map((r) => r.duration));
    if (speedDiff > 1000) {
      const fastest = results.find(
        (r) => r.duration === Math.min(...results.map((res) => res.duration))
      );
      insights.push({
        type: "performance",
        icon: BoltIcon,
        title: "Speed Winner",
        description: `${fastest.model} is ${Math.round(
          speedDiff / 1000
        )}x faster than the slowest model`,
        model: fastest.model,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      });
    }

    // Cost insights
    const costDiff =
      Math.max(...results.map((r) => r.cost)) -
      Math.min(...results.map((r) => r.cost));
    if (costDiff > 0.001) {
      const cheapest = results.find(
        (r) => r.cost === Math.min(...results.map((res) => res.cost))
      );
      insights.push({
        type: "cost",
        icon: CurrencyDollarIcon,
        title: "Most Cost-Effective",
        description: `${cheapest.model} costs ${
          Math.round(costDiff * 10000) / 10000
        }$ less per request`,
        model: cheapest.model,
        color: "text-green-600",
        bg: "bg-green-50",
      });
    }

    // Quality insights
    const qualityLeader = analysis.reduce((prev, curr) =>
      prev.completenessScore + prev.readabilityScore >
      curr.completenessScore + curr.readabilityScore
        ? prev
        : curr
    );
    insights.push({
      type: "quality",
      icon: TrophyIcon,
      title: "Quality Leader",
      description: `${qualityLeader.model} provides the most complete and readable response`,
      model: qualityLeader.model,
      color: "text-purple-600",
      bg: "bg-purple-50",
    });

    return insights;
  };

  const generateComparisonReport = () => {
    const completedConfigs = testConfigs.filter((config) => config.result);
    const analysis = analyzeComparison(completedConfigs);

    if (!analysis) {
      toast.error("Need at least 2 completed tests to generate report");
      return;
    }

    // Generate downloadable report
    const reportData = {
      timestamp: new Date().toISOString(),
      prompt: completedConfigs[0]?.prompt,
      template: selectedTemplate?.name || "Custom",
      comparison: analysis,
      configs: completedConfigs.map((config) => ({
        provider: config.provider,
        model: config.model,
        settings: {
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        },
        result: config.result,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model-comparison-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Comparison report downloaded!");
  };

  // Auto-analyze when compare mode is active and tests complete
  useEffect(() => {
    if (compareMode && testConfigs.length >= 2) {
      const completedConfigs = testConfigs.filter(
        (config) => config.result && !config.error
      );
      if (completedConfigs.length >= 2) {
        const analysis = analyzeComparison(completedConfigs);
        setComparisonMetrics(analysis);
        setShowComparison(true);
      }
    }
  }, [testConfigs, compareMode]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            {" "}
            <div className="flex items-center space-x-4">
              {/* Main Back to Dashboard Button */}
              {currentStep == "template" && (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              )}

              {currentStep !== "template" && (
                <button
                  onClick={() => setCurrentStep("template")}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Back to Templates</span>
                </button>
              )}

              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl shadow-lg">
                  <BeakerIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    AI Model Testing
                  </h1>
                  <p className="text-sm text-gray-600">
                    {currentStep === "template"
                      ? "Choose a template or start from scratch"
                      : selectedTemplate
                      ? `Testing: ${selectedTemplate.name}`
                      : "Custom test configuration"}
                  </p>
                </div>
              </div>
            </div>
            {currentStep === "test" && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    showAdvanced
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  <span>Advanced</span>
                  {showAdvanced ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>{" "}
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    compareMode
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ArrowsRightLeftIcon className="h-4 w-4" />
                  <span>Compare</span>
                  {compareMode && (
                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                      {testConfigs.filter((c) => c.result).length}/
                      {testConfigs.length}
                    </span>
                  )}
                </button>
                {compareMode && comparisonMetrics && (
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      showComparison
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    }`}
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>{showComparison ? "Hide" : "Show"} Analysis</span>
                  </button>
                )}
                <button
                  onClick={addTestConfig}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Test</span>
                </button>
                <button
                  onClick={runAllTests}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <PlayIcon className="h-4 w-4" />
                  <span>Run All</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {currentStep === "template" && (
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section for First Time Users */}
            {isFirstTime && (
              <div className="mb-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
                  <SparklesIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to AI Model Testing
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  Test any prompt across different AI models, compare responses,
                  and find the perfect model for your use case. Start with a
                  template or create your own custom test.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4" />
                  <span>Most tests complete in under 2 minutes</span>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <button
                onClick={startFromScratch}
                className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-blue-400 hover:from-blue-50 hover:to-blue-100 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-lg mb-4 group-hover:shadow-xl transition-shadow duration-300">
                    <PlusIcon className="h-8 w-8 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Start from Scratch
                  </h3>
                  <p className="text-gray-600">
                    Create a custom test with your own prompt and settings
                  </p>
                </div>
              </button>

              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-2xl p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10" />
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-lg mb-4">
                    <RocketLaunchIcon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Use Templates
                  </h3>
                  <p className="text-gray-600">
                    Get started quickly with pre-built templates for common
                    tasks
                  </p>
                  <div className="mt-4 flex items-center space-x-2">
                    <StarIcon className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-emerald-700 font-medium">
                      Recommended for beginners
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Categories */}
            <div className="space-y-8">
              {templateCategories.map((category) => {
                const colorClasses = getColorClasses(category.color);
                const IconComponent = category.icon;

                return (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 ${colorClasses.accent} rounded-lg`}>
                        <IconComponent
                          className={`h-5 w-5 ${colorClasses.icon}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.templates.map((template) => {
                        const TemplateIcon = template.icon;
                        return (
                          <button
                            key={template.id}
                            onClick={() => initializeTestConfig(template)}
                            className={`group text-left p-6 ${colorClasses.bg} ${colorClasses.border} border rounded-xl ${colorClasses.hover} transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div
                                className={`p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200`}
                              >
                                <TemplateIcon
                                  className={`h-5 w-5 ${colorClasses.icon}`}
                                />
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <ClockIcon className="h-3 w-3" />
                                <span>{template.estimatedTime}</span>
                              </div>
                            </div>

                            <h4
                              className={`font-semibold mb-2 ${colorClasses.text}`}
                            >
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {template.description}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-white/50 text-xs text-gray-600 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Saved Prompts Section */}
            {savedPrompts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <BookmarkIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Your Saved Prompts
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quickly reuse your previous prompts
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedPrompts.slice(0, 6).map((saved) => (
                    <button
                      key={saved.id}
                      onClick={() => {
                        const template = {
                          id: `saved-${saved.id}`,
                          name: saved.name,
                          prompt: saved.prompt,
                          systemMessage: "You are a helpful assistant.",
                        };
                        initializeTestConfig(template);
                      }}
                      className="group text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {saved.name}
                        </h4>
                        <DocumentTextIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {saved.prompt}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(saved.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}{" "}
        {currentStep === "test" && testConfigs.length > 0 && (
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Comparison Dashboard */}
            {compareMode && showComparison && comparisonMetrics && (
              <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <ScaleIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          Intelligent Comparison Analysis
                        </h3>
                        <p className="text-white/90">
                          AI-powered insights across{" "}
                          {testConfigs.filter((c) => c.result).length} model
                          responses
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={generateComparisonReport}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      <span>Export Report</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Key Insights */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <LightBulbIcon className="h-5 w-5 text-amber-600" />
                      <span>Key Insights</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {comparisonMetrics.insights.map((insight, index) => {
                        const IconComponent = insight.icon;
                        return (
                          <div
                            key={index}
                            className={`${insight.bg} border border-gray-200 rounded-xl p-4`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <IconComponent
                                  className={`h-5 w-5 ${insight.color}`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-900 mb-1">
                                  {insight.title}
                                </h5>
                                <p className="text-sm text-gray-700 mb-2">
                                  {insight.description}
                                </p>
                                <span className="inline-flex items-center px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                                  {insight.model}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Performance Metrics */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <ChartBarIcon className="h-5 w-5 text-blue-600" />
                      <span>Performance Comparison</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-blue-900">
                            Fastest Response
                          </h5>
                          <BoltIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-900 mb-1">
                          {comparisonMetrics.performance.fastest.duration}ms
                        </div>
                        <p className="text-sm text-blue-700">
                          {comparisonMetrics.performance.fastest.model}
                        </p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-green-900">
                            Most Cost-Effective
                          </h5>
                          <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-900 mb-1">
                          $
                          {comparisonMetrics.performance.cheapest.cost.toFixed(
                            4
                          )}
                        </div>
                        <p className="text-sm text-green-700">
                          {comparisonMetrics.performance.cheapest.model}
                        </p>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-purple-900">
                            Highest Quality
                          </h5>
                          <TrophyIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-purple-900 mb-1">
                          {Math.round(
                            comparisonMetrics.quality.mostComplete
                              .completenessScore
                          )}
                          %
                        </div>
                        <p className="text-sm text-purple-700">
                          {comparisonMetrics.quality.mostComplete.model}
                        </p>
                      </div>
                    </div>
                  </div>{" "}
                  {/* Response Analysis */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <AcademicCapIcon className="h-5 w-5 text-indigo-600" />
                      <span>Response Analysis</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Model
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Speed
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Cost
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Tokens
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Quality
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">
                              Readability
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonMetrics.detailed.map((item, index) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">
                                    {item.model}
                                  </span>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {item.provider}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      item.duration ===
                                      comparisonMetrics.performance.fastest
                                        .duration
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                    }`}
                                  ></div>
                                  <span className="text-sm">
                                    {item.duration}ms
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      item.cost ===
                                      comparisonMetrics.performance.cheapest
                                        .cost
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                    }`}
                                  ></div>
                                  <span className="text-sm">
                                    ${item.cost.toFixed(4)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {item.tokens}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-purple-600 h-2 rounded-full"
                                      style={{
                                        width: `${item.completenessScore}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm">
                                    {item.completenessScore}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{
                                        width: `${item.readabilityScore}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm">
                                    {item.readabilityScore}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Response Comparison */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <DocumentTextIcon className="h-5 w-5 text-green-600" />
                      <span>Response Comparison</span>
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {comparisonMetrics.detailed
                        .slice(0, 2)
                        .map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900">
                                {item.model}
                              </h5>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {item.wordCount} words
                                </span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">
                                  {item.sentenceCount} sentences
                                </span>
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {item.response.length > 500
                                  ? item.response.substring(0, 500) + "..."
                                  : item.response}
                              </pre>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">
                                    Quality:
                                  </span>
                                  <div className="w-12 bg-gray-200 rounded-full h-1">
                                    <div
                                      className="bg-purple-600 h-1 rounded-full"
                                      style={{
                                        width: `${item.completenessScore}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">
                                    Readability:
                                  </span>
                                  <div className="w-12 bg-gray-200 rounded-full h-1">
                                    <div
                                      className="bg-blue-600 h-1 rounded-full"
                                      style={{
                                        width: `${item.readabilityScore}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => copyToClipboard(item.response)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              >
                                <DocumentDuplicateIcon className="h-3 w-3" />
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  {/* Recommendations */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                      <span>Smart Recommendations</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">
                          Best for Production
                        </h5>
                        <p className="text-sm text-gray-700">
                          Consider{" "}
                          <strong>
                            {comparisonMetrics.performance.fastest.model}
                          </strong>{" "}
                          for speed-critical applications and{" "}
                          <strong>
                            {comparisonMetrics.performance.cheapest.model}
                          </strong>{" "}
                          for cost optimization.
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">
                          Best for Quality
                        </h5>
                        <p className="text-sm text-gray-700">
                          <strong>
                            {comparisonMetrics.quality.mostComplete.model}
                          </strong>{" "}
                          provides the most comprehensive responses for complex
                          tasks requiring detailed output.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`grid gap-6 ${
                compareMode && testConfigs.length > 1
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {testConfigs.map((config, index) => (
                <div
                  key={config.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg relative overflow-hidden"
                >
                  {/* Loading Overlay */}
                  {config.isRunning && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/90 to-purple-50/90 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
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
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xl font-bold text-gray-900 flex items-center justify-center space-x-2">
                            <SparklesIcon className="h-6 w-6 text-blue-600 animate-pulse" />
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                              AI Thinking...
                            </span>
                          </h4>
                          <p className="text-sm text-gray-700 max-w-xs mx-auto font-medium">
                            Processing your prompt with{" "}
                            <span className="font-bold text-blue-600">
                              {config.model}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test Config Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <SparklesIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {config.templateName || `Test ${index + 1}`}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => runTest(config.id)}
                        disabled={config.isRunning || !config.prompt.trim()}
                        className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                      >
                        {config.isRunning ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Running...</span>
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-3 w-3" />
                            <span>Run Test</span>
                          </>
                        )}
                      </button>

                      {testConfigs.length > 1 && (
                        <button
                          onClick={() => removeTestConfig(config.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Configuration */}
                  <div className="p-6 space-y-6">
                    {/* Basic Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Provider
                        </label>
                        <select
                          value={config.provider}
                          onChange={(e) =>
                            updateTestConfig(config.id, {
                              provider: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                            updateTestConfig(config.id, {
                              model: e.target.value,
                            })
                          }
                          disabled={loadingModels}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          {loadingModels ? (
                            <option value="">Loading models...</option>
                          ) : (
                            availableModels[config.provider]?.map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            )) || <option value="">No models available</option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Prompt
                        </label>
                        {config.prompt.trim() && (
                          <button
                            onClick={() => {
                              const name = prompt(
                                "Enter a name for this prompt:"
                              );
                              if (name) savePrompt(config.prompt, name);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Save Prompt
                          </button>
                        )}
                      </div>
                      <textarea
                        value={config.prompt}
                        onChange={(e) =>
                          updateTestConfig(config.id, {
                            prompt: e.target.value,
                          })
                        }
                        placeholder="Enter your prompt here..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {config.prompt.length} characters
                        </span>
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    {showAdvanced && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        {/* System Message */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            System Message
                          </label>
                          <textarea
                            value={config.systemMessage}
                            onChange={(e) =>
                              updateTestConfig(config.id, {
                                systemMessage: e.target.value,
                              })
                            }
                            placeholder="You are a helpful assistant..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                          />
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
                                updateTestConfig(config.id, {
                                  temperature: parseFloat(e.target.value),
                                })
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
                                updateTestConfig(config.id, {
                                  maxTokens: parseInt(e.target.value),
                                })
                              }
                              min="1"
                              max="4000"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Results */}
                  {(config.result || config.error) && (
                    <div className="border-t border-gray-200/50 p-6">
                      {config.error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                            <h4 className="font-medium text-red-800">
                              Test Failed
                            </h4>
                          </div>
                          <p className="text-red-700 text-sm">{config.error}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {" "}
                          {/* Success Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              <h4 className="font-medium text-green-800">
                                Test Completed
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  config.result.timestamp
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                            {/* Comparison badges */}
                            {compareMode && comparisonMetrics && (
                              <div className="flex items-center space-x-1">
                                {comparisonMetrics.performance.fastest.id ===
                                  config.id && (
                                  <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                    <BoltIcon className="h-3 w-3 mr-1" />
                                    Fastest
                                  </span>
                                )}
                                {comparisonMetrics.performance.cheapest.id ===
                                  config.id && (
                                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                    Cheapest
                                  </span>
                                )}
                                {comparisonMetrics.quality.mostComplete.id ===
                                  config.id && (
                                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                    <TrophyIcon className="h-3 w-3 mr-1" />
                                    Best Quality
                                  </span>
                                )}
                              </div>
                            )}
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
                              <p className="text-xs text-blue-600 mt-1">
                                Response Time
                              </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <CpuChipIcon className="h-4 w-4 text-green-600" />
                                <span className="text-lg font-semibold text-green-900">
                                  {config.result.tokenUsage?.totalTokens || 0}
                                </span>
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                Total Tokens
                              </p>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <CurrencyDollarIcon className="h-4 w-4 text-yellow-600" />
                                <span className="text-lg font-semibold text-yellow-900">
                                  $
                                  {(config.result.cost?.totalCost || 0).toFixed(
                                    4
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-yellow-600 mt-1">
                                Estimated Cost
                              </p>
                            </div>
                          </div>
                          {/* Response */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">
                                Response
                              </h5>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    config.result.response ||
                                      config.result.completion
                                  )
                                }
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                                <span>Copy</span>
                              </button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                {config.result.response ||
                                  config.result.completion ||
                                  "No response content"}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TestModelsPage;
