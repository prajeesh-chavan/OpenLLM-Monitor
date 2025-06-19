const Log = require("../models/Log");

/**
 * Test utility functions for database management
 */
class TestUtils {
  /**
   * Comprehensive database cleanup with verification
   */ static async cleanDatabase() {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Delete all documents
        await Log.deleteMany({});

        // Wait for deletion to complete
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Verify cleanup was successful
        const count = await Log.countDocuments({});
        if (count === 0) {
          return; // Success
        }

        console.warn(
          `Cleanup attempt ${attempt + 1} failed, ${count} documents remain`
        );
        attempt++;

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(
          `Database cleanup error on attempt ${attempt + 1}:`,
          error
        );
        attempt++;

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    }

    throw new Error(`Failed to clean database after ${maxRetries} attempts`);
  }

  /**
   * Create test logs with verification
   */
  static async createTestLogs(count = 25, suffix = "") {
    // Ensure clean state first
    await this.cleanDatabase();

    const timestamp = Date.now();
    const testLogs = Array.from({ length: count }, (_, i) => ({
      requestId: `test-${suffix}-${i + 1}-${timestamp}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      provider: i % 2 === 0 ? "openai" : "ollama",
      model: i % 2 === 0 ? "gpt-3.5-turbo" : "llama2",
      prompt: `Test prompt ${i + 1}`,
      completion: `Test response ${i + 1}`,
      tokenUsage: {
        promptTokens: 10 + i,
        completionTokens: 20 + i,
        totalTokens: 30 + i * 2,
      },
      cost: {
        promptCost: 0.0005 * (i + 1),
        completionCost: 0.0005 * (i + 1),
        totalCost: 0.001 * (i + 1),
        currency: "USD",
      },
      latency: 1000 + i * 100,
      status: i % 5 === 0 ? "error" : "success",
      createdAt: new Date(Date.now() - i * 60000),
    }));
    const result = await Log.insertMany(testLogs);

    // Wait for indexing and ensure data is available
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Verify insertion
    const actualCount = await Log.countDocuments({});
    if (actualCount !== count) {
      throw new Error(`Expected ${count} logs, but found ${actualCount}`);
    }

    return result;
  }

  /**
   * Create analytics test data with verification
   */
  static async createAnalyticsTestData(suffix = "") {
    // Ensure clean state first
    await this.cleanDatabase();

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const timestamp = Date.now();

    const testLogs = [
      {
        requestId: `analytics-test-1-${suffix}-${timestamp}`,
        provider: "openai",
        model: "gpt-3.5-turbo",
        prompt: "Test prompt 1",
        completion: "Test response 1",
        tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: {
          promptCost: 0.0005,
          completionCost: 0.0005,
          totalCost: 0.001,
          currency: "USD",
        },
        latency: 1000,
        status: "success",
        createdAt: oneHourAgo,
      },
      {
        requestId: `analytics-test-2-${suffix}-${timestamp}`,
        provider: "ollama",
        model: "llama2",
        prompt: "Test prompt 2",
        completion: "Test response 2",
        tokenUsage: { promptTokens: 15, completionTokens: 25, totalTokens: 40 },
        cost: {
          promptCost: 0.001,
          completionCost: 0.001,
          totalCost: 0.002,
          currency: "USD",
        },
        latency: 1500,
        status: "success",
        createdAt: twoHoursAgo,
      },
      {
        requestId: `analytics-test-3-${suffix}-${timestamp}`,
        provider: "openai",
        model: "gpt-4",
        prompt: "Test prompt 3",
        completion: "",
        tokenUsage: { promptTokens: 12, completionTokens: 0, totalTokens: 12 },
        cost: {
          promptCost: 0.003,
          completionCost: 0,
          totalCost: 0.003,
          currency: "USD",
        },
        latency: 500,
        status: "error",
        error: { message: "API error", code: "RATE_LIMIT" },
        createdAt: twoHoursAgo,
      },
    ];
    const result = await Log.insertMany(testLogs);

    // Wait for indexing and ensure data is available
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Verify insertion
    const actualCount = await Log.countDocuments({});
    if (actualCount !== 3) {
      throw new Error(
        `Expected 3 logs for analytics test, but found ${actualCount}`
      );
    }

    return result;
  }

  /**
   * Create specific test data for log stats
   */
  static async createStatsTestData(suffix = "") {
    // Ensure clean state first
    await this.cleanDatabase();

    const timestamp = Date.now();
    const testLogs = [
      {
        requestId: `stats-test-1-${suffix}-${timestamp}`,
        provider: "openai",
        model: "gpt-3.5-turbo",
        prompt: "Test prompt 1",
        completion: "Test response 1",
        tokenUsage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
        cost: {
          promptCost: 0.0005,
          completionCost: 0.0005,
          totalCost: 0.001,
          currency: "USD",
        },
        latency: 1000,
        status: "success",
        createdAt: new Date(),
      },
      {
        requestId: `stats-test-2-${suffix}-${timestamp}`,
        provider: "ollama",
        model: "llama2",
        prompt: "Test prompt 2",
        completion: "Test response 2",
        tokenUsage: {
          promptTokens: 15,
          completionTokens: 25,
          totalTokens: 40,
        },
        cost: {
          promptCost: 0.001,
          completionCost: 0.001,
          totalCost: 0.002,
          currency: "USD",
        },
        latency: 1500,
        status: "error",
        createdAt: new Date(),
      },
    ];

    const result = await Log.insertMany(testLogs);

    // Wait for indexing
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Verify insertion
    const actualCount = await Log.countDocuments({});
    if (actualCount !== 2) {
      throw new Error(
        `Expected 2 logs for stats test, but found ${actualCount}`
      );
    }

    return result;
  }
}

module.exports = TestUtils;
