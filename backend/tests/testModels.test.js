const request = require("supertest");
const app = require("./testApp");

describe("Test Controller", () => {
  describe("POST /api/test/prompt", () => {
    it("should test a prompt with OpenAI", async () => {
      const response = await request(app)
        .post("/api/test/prompt")
        .send({
          provider: "openai",
          model: "gpt-3.5-turbo",
          prompt: "What is the capital of France?",
          systemMessage: "You are a helpful assistant.",
          temperature: 0.7,
          maxTokens: 100,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("response");
      expect(response.body.data).toHaveProperty("tokenUsage");
      expect(response.body.data).toHaveProperty("cost");
      expect(response.body.data).toHaveProperty("duration");
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/test/prompt")
        .send({
          provider: "openai",
          // Missing model and prompt
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });

    it("should handle unsupported provider", async () => {
      const response = await request(app)
        .post("/api/test/prompt")
        .send({
          provider: "unsupported",
          model: "test-model",
          prompt: "Test prompt",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Unsupported provider");
    });
  });

  describe("GET /api/test/models", () => {
    it("should return available models", async () => {
      const response = await request(app)
        .get("/api/test/models")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("openai");
      expect(response.body.data).toHaveProperty("ollama");
      expect(response.body.data).toHaveProperty("mistral");
      expect(response.body.data).toHaveProperty("openrouter");
    });
  });

  describe("POST /api/test/estimate", () => {
    it("should return cost estimate", async () => {
      const response = await request(app)
        .post("/api/test/estimate")
        .send({
          provider: "openai",
          model: "gpt-3.5-turbo",
          prompt: "What is the capital of France?",
          maxTokens: 100,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("estimatedCost");
      expect(response.body.data).toHaveProperty("tokenUsage");
    });
  });

  describe("POST /api/test/validate", () => {
    it("should validate configuration", async () => {
      const response = await request(app)
        .post("/api/test/validate")
        .send({
          provider: "openai",
          model: "gpt-3.5-turbo",
          prompt: "What is the capital of France?",
          temperature: 0.7,
          maxTokens: 100,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("valid");
      expect(response.body.data.valid).toBe(true);
    });

    it("should detect invalid configuration", async () => {
      const response = await request(app)
        .post("/api/test/validate")
        .send({
          provider: "invalid",
          model: "",
          prompt: "",
          temperature: 5, // Invalid temperature
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errors.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/test/compare", () => {
    it("should compare multiple models", async () => {
      const response = await request(app)
        .post("/api/test/compare")
        .send({
          prompt: "What is the capital of France?",
          models: [
            {
              provider: "openai",
              model: "gpt-3.5-turbo",
              temperature: 0.7,
              maxTokens: 100,
            },
            {
              provider: "ollama",
              model: "llama2",
              temperature: 0.7,
              maxTokens: 100,
            },
          ],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("results");
      expect(response.body.data.results).toHaveLength(2);
      expect(response.body.data).toHaveProperty("summary");
    });
  });
});
