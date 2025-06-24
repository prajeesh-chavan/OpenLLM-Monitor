const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./testApp");
const Log = require("../models/Log");
const TestUtils = require("./testUtils");

// Test database
const MONGODB_URI =
  process.env.MONGODB_URI

describe("Logs Controller", () => {
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
  describe("GET /api/logs", () => {
    it("should return paginated logs", async () => {
      await TestUtils.createTestLogs(25, "paginated");

      const response = await request(app)
        .get("/api/logs?page=1&limit=10")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.logs).toHaveLength(10);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(3);
      expect(response.body.data.pagination.totalCount).toBe(25);
    });

    it("should filter logs by provider", async () => {
      await TestUtils.createTestLogs(25, "provider");

      const response = await request(app)
        .get("/api/logs?provider=openai")
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.logs.forEach((log) => {
        expect(log.provider).toBe("openai");
      });
    });
    it("should filter logs by status", async () => {
      await TestUtils.createTestLogs(25, "status");

      const response = await request(app)
        .get("/api/logs?status=error")
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.logs.forEach((log) => {
        expect(log.status).toBe("error");
      });
    });
    it("should search logs by prompt", async () => {
      await TestUtils.createTestLogs(25, "search");

      const response = await request(app)
        .get("/api/logs?search=prompt 1")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.logs.length).toBeGreaterThan(0);
    });
    it("should sort logs by different fields", async () => {
      await TestUtils.createTestLogs(25, "sorting");

      const response = await request(app)
        .get("/api/logs?sortBy=cost&sortOrder=desc")
        .expect(200);
      expect(response.body.success).toBe(true);
      const costs = response.body.data.logs.map((log) => log.cost.totalCost);
      for (let i = 1; i < costs.length; i++) {
        expect(costs[i]).toBeLessThanOrEqual(costs[i - 1]);
      }
    });
  });
  describe("GET /api/logs/:id", () => {
    let testLogId;

    beforeEach(async () => {
      const testLog = new Log({
        requestId: `test-single-request-1-${Date.now()}-${Math.random()}`,
        provider: "openai",
        model: "gpt-3.5-turbo",
        prompt: "Test prompt",
        completion: "Test response",
        tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: {
          promptCost: 0.0005,
          completionCost: 0.0005,
          totalCost: 0.001,
          currency: "USD",
        },
        latency: 1000,
        status: "success",
        createdAt: new Date(),
      });

      const saved = await testLog.save();
      testLogId = saved._id.toString();
    });

    it("should return a specific log by ID", async () => {
      const response = await request(app)
        .get(`/api/logs/${testLogId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.log._id).toBe(testLogId);
      expect(response.body.data.log.provider).toBe("openai");
    });

    it("should return 404 for non-existent log", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app).get(`/api/logs/${fakeId}`).expect(404);
    });

    it("should return 400 for invalid log ID", async () => {
      await request(app).get("/api/logs/invalid-id").expect(400);
    });
  });
  describe("DELETE /api/logs/:id", () => {
    let testLogId;

    beforeEach(async () => {
      const testLog = new Log({
        requestId: `test-single-request-2-${Date.now()}-${Math.random()}`,
        provider: "openai",
        model: "gpt-3.5-turbo",
        prompt: "Test prompt",
        completion: "Test response",
        tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        cost: {
          promptCost: 0.0005,
          completionCost: 0.0005,
          totalCost: 0.001,
          currency: "USD",
        },
        latency: 1000,
        status: "success",
        createdAt: new Date(),
      });

      const saved = await testLog.save();
      testLogId = saved._id.toString();
    });

    it("should delete a log successfully", async () => {
      const response = await request(app)
        .delete(`/api/logs/${testLogId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain("deleted");

      // Verify log is deleted
      const deletedLog = await Log.findById(testLogId);
      expect(deletedLog).toBeNull();
    });

    it("should return 404 for non-existent log", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app).delete(`/api/logs/${fakeId}`).expect(404);
    });
  });
  describe("DELETE /api/logs/bulk", () => {
    let testLogIds;

    beforeEach(async () => {
      const testLogs = [
        {
          requestId: `test-bulk-request-1-${Date.now()}-${Math.random()}`,
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
          requestId: `test-bulk-request-2-${Date.now()}-${Math.random()}`,
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
          status: "success",
          createdAt: new Date(),
        },
      ];

      const saved = await Log.insertMany(testLogs);
      testLogIds = saved.map((log) => log._id.toString());
    });

    it("should delete multiple logs", async () => {
      const response = await request(app)
        .delete("/api/logs/bulk")
        .send({ ids: testLogIds })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedCount).toBe(2);

      // Verify logs are deleted
      const remainingLogs = await Log.find({ _id: { $in: testLogIds } });
      expect(remainingLogs).toHaveLength(0);
    });

    it("should return 400 for invalid request body", async () => {
      await request(app).delete("/api/logs/bulk").send({}).expect(400);
    });
  });
  describe("GET /api/logs/stats", () => {
    beforeEach(async () => {
      await TestUtils.createStatsTestData("stats");
    });

    it("should return log statistics", async () => {
      const response = await request(app).get("/api/logs/stats").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("overview");
      expect(response.body.data).toHaveProperty("providerStats");
      expect(response.body.data).toHaveProperty("recentActivity");

      const { overview } = response.body.data;
      expect(overview.totalRequests).toBe(2);
      expect(overview.successRate).toBe(50);
      expect(overview.totalCost).toBeCloseTo(0.003, 3);
    });

    it("should filter stats by timeframe", async () => {
      const response = await request(app)
        .get("/api/logs/stats?timeframe=1")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview.totalRequests).toBe(2);
    });
  });
});
