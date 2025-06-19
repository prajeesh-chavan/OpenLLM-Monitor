const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./testApp");
const Log = require("../models/Log");
const TestUtils = require("./testUtils");

// Test database - use in-memory database for testing
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://prajeeshchavan:23072004@cluster0.arjzpru.mongodb.net/openllm-monitor-test?retryWrites=true&w=majority&appName=Cluster0";

describe("Analytics Controller", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
    }
  }, 60000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }, 30000);

  beforeEach(async () => {
    // Use comprehensive database cleanup
    await TestUtils.cleanDatabase();
  });

  afterEach(async () => {
    // Clean up after each test to ensure isolation
    await TestUtils.cleanDatabase();
  });

  describe("GET /api/analytics/stats", () => {
    it("should return comprehensive statistics", async () => {
      await TestUtils.createAnalyticsTestData("stats");

      const response = await request(app)
        .get("/api/analytics/stats")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("overview");
      expect(response.body.data).toHaveProperty("providerStats");
      expect(response.body.data).toHaveProperty("modelStats");
      expect(response.body.data).toHaveProperty("timeRangeStats");

      const { overview } = response.body.data;
      expect(overview.totalRequests).toBe(3);
      expect(overview.successRate).toBeCloseTo(66.67, 2);
      expect(overview.totalCost).toBeCloseTo(0.006, 3);
      expect(overview.avgDuration).toBeCloseTo(1000, 0);
    });
  });

  describe("GET /api/analytics/usage", () => {
    it("should return usage analytics with timeframe", async () => {
      await TestUtils.createAnalyticsTestData("usage");

      const response = await request(app)
        .get("/api/analytics/usage?timeframe=24")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("hourlyStats");
      expect(response.body.data).toHaveProperty("requestVolume");
      expect(response.body.data).toHaveProperty("tokenUsage");
    });
  });

  describe("GET /api/analytics/performance", () => {
    it("should return performance metrics", async () => {
      await TestUtils.createAnalyticsTestData("performance");

      const response = await request(app)
        .get("/api/analytics/performance")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("responseTime");
      expect(response.body.data).toHaveProperty("errorRate");
      expect(response.body.data).toHaveProperty("latencyDistribution");
    });
  });

  describe("GET /api/analytics/costs", () => {
    it("should return cost analytics", async () => {
      await TestUtils.createAnalyticsTestData("costs");

      const response = await request(app)
        .get("/api/analytics/costs")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("totalCost");
      expect(response.body.data).toHaveProperty("costByProvider");
      expect(response.body.data).toHaveProperty("costByModel");
      expect(response.body.data).toHaveProperty("costTrend");
    });
  });

  describe("GET /api/analytics/providers", () => {
    it("should return provider comparison", async () => {
      await TestUtils.createAnalyticsTestData("providers");

      const response = await request(app)
        .get("/api/analytics/providers")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("providerComparison");
      expect(response.body.data).toHaveProperty("modelComparison");
      expect(Array.isArray(response.body.data.providerComparison)).toBe(true);
    });
  });

  describe("GET /api/analytics/errors", () => {
    it("should return error analytics", async () => {
      await TestUtils.createAnalyticsTestData("errors");

      const response = await request(app)
        .get("/api/analytics/errors")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("errorRate");
      expect(response.body.data).toHaveProperty("errorsByType");
      expect(response.body.data).toHaveProperty("errorsByProvider");
      expect(response.body.data.errorRate).toBeCloseTo(33.33, 2);
    });
  });

  describe("GET /api/analytics/trends", () => {
    it("should return trend analysis", async () => {
      await TestUtils.createAnalyticsTestData("trends");

      const response = await request(app)
        .get("/api/analytics/trends")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("insights");
      expect(response.body.data).toHaveProperty("patterns");
      expect(response.body.data).toHaveProperty("predictions");
    });
  });

  describe("GET /api/analytics/export", () => {
    beforeEach(async () => {
      await TestUtils.createAnalyticsTestData("export");
    });

    it("should export analytics data as CSV", async () => {
      const response = await request(app)
        .get("/api/analytics/export?format=csv")
        .expect(200);

      expect(response.headers["content-type"]).toContain("text/csv");
      expect(response.headers["content-disposition"]).toContain("attachment");
    });

    it("should export analytics data as JSON", async () => {
      const response = await request(app)
        .get("/api/analytics/export?format=json")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("analytics");
    });
  });
});
