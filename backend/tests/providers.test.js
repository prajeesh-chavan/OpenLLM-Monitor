const request = require("supertest");
const app = require("./testApp");

describe("Providers Controller", () => {
  describe("GET /api/providers", () => {
    it("should return all provider configurations", async () => {
      const response = await request(app).get("/api/providers").expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("openai");
      expect(response.body.data).toHaveProperty("ollama");
      expect(response.body.data).toHaveProperty("openrouter");
      expect(response.body.data).toHaveProperty("mistral"); // Check OpenAI provider structure
      const openaiProvider = response.body.data.openai;
      expect(openaiProvider).toHaveProperty("name");
      expect(openaiProvider).toHaveProperty("baseUrl");
      expect(openaiProvider).toHaveProperty("hasApiKey");
      expect(openaiProvider).toHaveProperty("models");
      expect(Array.isArray(openaiProvider.models)).toBe(true);
    });
  });

  describe("GET /api/providers/stats", () => {
    it("should return provider usage statistics", async () => {
      const response = await request(app)
        .get("/api/providers/stats")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("overview");
      expect(response.body.data).toHaveProperty("providers");
      expect(Array.isArray(response.body.data.providers)).toBe(true);
    });
  });

  describe("GET /api/providers/recommendations", () => {
    it("should return provider recommendations for translation tasks", async () => {
      const response = await request(app)
        .get("/api/providers/recommendations?useCase=translation")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("recommendations");
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
      expect(response.body.data.recommendations.length).toBeGreaterThan(0);
    });

    it("should return provider recommendations for coding tasks", async () => {
      const response = await request(app)
        .get("/api/providers/recommendations?useCase=coding")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("recommendations");
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });

    it("should return provider recommendations for creative tasks", async () => {
      const response = await request(app)
        .get("/api/providers/recommendations?useCase=creative")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("recommendations");
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });

    it("should return provider recommendations for analysis tasks", async () => {
      const response = await request(app)
        .get("/api/providers/recommendations?useCase=analysis")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("recommendations");
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });

    it("should return default recommendations for unknown use case", async () => {
      const response = await request(app)
        .get("/api/providers/recommendations?useCase=unknown")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("recommendations");
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
    });
  });

  describe("GET /api/providers/comparison", () => {
    it("should return provider comparison data", async () => {
      const response = await request(app)
        .get("/api/providers/comparison")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("comparison");
      expect(Array.isArray(response.body.data.comparison)).toBe(true);

      // Check comparison structure
      if (response.body.data.comparison.length > 0) {
        const firstProvider = response.body.data.comparison[0];
        expect(firstProvider).toHaveProperty("provider");
        expect(firstProvider).toHaveProperty("metrics");
      }
    });
  });

  describe("POST /api/providers/test-connection", () => {
    it("should test OpenAI connection", async () => {
      const response = await request(app)
        .post("/api/providers/test-connection")
        .send({ provider: "openai" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("connected");
      expect(response.body.data).toHaveProperty("provider", "openai");
    });

    it("should test Ollama connection", async () => {
      const response = await request(app)
        .post("/api/providers/test-connection")
        .send({ provider: "ollama" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("connected");
      expect(response.body.data).toHaveProperty("provider", "ollama");
    });

    it("should return 400 for invalid provider", async () => {
      await request(app)
        .post("/api/providers/test-connection")
        .send({ provider: "invalid-provider" })
        .expect(400);
    });

    it("should return 400 for missing provider", async () => {
      await request(app)
        .post("/api/providers/test-connection")
        .send({})
        .expect(400);
    });
  });
});
