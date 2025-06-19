const request = require("supertest");
const app = require("./testApp");

describe("Replay Controller", () => {
  describe("POST /api/replay", () => {
    it("should replay a prompt with OpenAI", async () => {
      const response = await request(app)
        .post("/api/replay")
        .send({
          provider: "openai",
          model: "gpt-3.5-turbo",
          prompt: "What is the capital of France?",
          maxTokens: 100,
          temperature: 0.7,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("response");
      expect(response.body.data).toHaveProperty("tokenUsage");
      expect(response.body.data).toHaveProperty("cost");
      expect(response.body.data).toHaveProperty("duration");
    });

    it("should replay a prompt with Ollama", async () => {
      const response = await request(app)
        .post("/api/replay")
        .send({
          provider: "ollama",
          model: "llama2",
          prompt: "What is the capital of France?",
          maxTokens: 100,
          temperature: 0.7,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("response");
      expect(response.body.data).toHaveProperty("tokenUsage");
      expect(response.body.data).toHaveProperty("duration");
    });

    it("should return 400 for missing required fields", async () => {
      await request(app)
        .post("/api/replay")
        .send({
          provider: "openai",
          // Missing model and prompt
        })
        .expect(400);
    });

    it("should return 400 for invalid provider", async () => {
      await request(app)
        .post("/api/replay")
        .send({
          provider: "invalid-provider",
          model: "some-model",
          prompt: "test prompt",
        })
        .expect(400);
    });
  });

  describe("POST /api/replay/log/:logId", () => {
    // This would require creating a test log first
    it("should return 400 for invalid log ID format", async () => {
      await request(app)
        .post("/api/replay/log/invalid-id")
        .send({})
        .expect(400);
    });
  });

  describe("POST /api/replay/compare", () => {
    it("should compare multiple provider responses", async () => {
      const response = await request(app)
        .post("/api/replay/compare")
        .send({
          prompt: "What is the capital of France?",
          providers: [
            { provider: "openai", model: "gpt-3.5-turbo" },
            { provider: "ollama", model: "llama2" },
          ],
          maxTokens: 100,
          temperature: 0.7,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("results");
      expect(Array.isArray(response.body.data.results)).toBe(true);
      expect(response.body.data.results.length).toBe(2);

      // Check structure of each result
      response.body.data.results.forEach((result) => {
        expect(result).toHaveProperty("provider");
        expect(result).toHaveProperty("model");
        expect(result).toHaveProperty("response");
        expect(result).toHaveProperty("duration");
      });
    });

    it("should return 400 for missing prompt", async () => {
      await request(app)
        .post("/api/replay/compare")
        .send({
          providers: [{ provider: "openai", model: "gpt-3.5-turbo" }],
        })
        .expect(400);
    });

    it("should return 400 for missing providers", async () => {
      await request(app)
        .post("/api/replay/compare")
        .send({
          prompt: "test prompt",
        })
        .expect(400);
    });
  });

  describe("POST /api/replay/estimate", () => {
    it("should estimate cost for OpenAI", async () => {
      const response = await request(app)
        .post("/api/replay/estimate")
        .send({
          provider: "openai",
          model: "gpt-3.5-turbo",
          prompt: "What is the capital of France?",
          maxTokens: 100,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("estimatedCost");
      expect(response.body.data).toHaveProperty("promptTokens");
      expect(response.body.data).toHaveProperty("maxCompletionTokens");
      expect(typeof response.body.data.estimatedCost).toBe("number");
    });

    it("should estimate cost for Ollama (free)", async () => {
      const response = await request(app)
        .post("/api/replay/estimate")
        .send({
          provider: "ollama",
          model: "llama2",
          prompt: "What is the capital of France?",
          maxTokens: 100,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("estimatedCost");
      expect(response.body.data.estimatedCost).toBe(0);
    });

    it("should return 400 for missing required fields", async () => {
      await request(app)
        .post("/api/replay/estimate")
        .send({
          provider: "openai",
          // Missing model and prompt
        })
        .expect(400);
    });
  });

  describe("GET /api/replay/models", () => {
    it("should return available models for all providers", async () => {
      const response = await request(app).get("/api/replay/models").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("models");
      expect(response.body.data.models).toHaveProperty("openai");
      expect(response.body.data.models).toHaveProperty("ollama");
      expect(response.body.data.models).toHaveProperty("openrouter");
      expect(response.body.data.models).toHaveProperty("mistral");

      // Check that each provider has an array of models
      Object.values(response.body.data.models).forEach((providerModels) => {
        expect(Array.isArray(providerModels)).toBe(true);
      });
    });
    it("should return models for specific provider", async () => {
      const response = await request(app)
        .get("/api/replay/models?provider=openai")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("models");
      expect(Array.isArray(response.body.data.models)).toBe(true);
      // Models array might be empty if API key is not configured in test environment
      // This is acceptable for testing - just ensure the endpoint works
    });
  });

  describe("GET /api/replay/connection/:provider", () => {
    it("should test OpenAI connection", async () => {
      const response = await request(app)
        .get("/api/replay/connection/openai")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("connected");
      expect(response.body.data).toHaveProperty("provider", "openai");
    });

    it("should test Ollama connection", async () => {
      const response = await request(app)
        .get("/api/replay/connection/ollama")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("connected");
      expect(response.body.data).toHaveProperty("provider", "ollama");
    });

    it("should return 400 for invalid provider", async () => {
      await request(app)
        .get("/api/replay/connection/invalid-provider")
        .expect(400);
    });
  });
});
