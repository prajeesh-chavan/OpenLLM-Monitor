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
          maxTokens: 100,
          temperature: 0.7,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("response");
      expect(response.body.data).toHaveProperty("tokenUsage");
      expect(response.body.data).toHaveProperty("cost");
      expect(response.body.data).toHaveProperty("duration");
      expect(response.body.data).toHaveProperty("provider");
      expect(response.body.data).toHaveProperty("model");
    });

    it("should test a prompt with Ollama", async () => {
      const response = await request(app)
        .post("/api/test/prompt")
        .send({
          provider: "ollama",
          model: "llama2",
          prompt: "Hello, how are you?",
          maxTokens: 50,
          temperature: 0.5,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("response");
      expect(response.body.data.provider).toBe("ollama");
      expect(response.body.data.model).toBe("llama2");
    });

    it("should return error for missing prompt", async () => {
      const response = await request(app)
        .post("/api/test/prompt")
        .send({
          provider: "openai",
          model: "gpt-3.5-turbo",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });

    it("should return error for unsupported provider", async () => {
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
      expect(Array.isArray(response.body.data.openai)).toBe(true);
    });
  });

  describe("POST /api/test/estimate", () => {
    it("should return cost estimate", async () => {
      const response = await request(app)
        .post("/api/test/estimate")
        .send({
          provider: "openai",
          model: "gpt-3.5-turbo",
          prompt: "What is machine learning?",
          maxTokens: 100,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("estimatedCost");
      expect(response.body.data).toHaveProperty("tokenUsage");
      expect(typeof response.body.data.estimatedCost).toBe("number");
    });
  });

  describe("POST /api/test/validate", () => {
    it("should validate valid configuration", async () => {
      const response = await request(app)
        .post("/api/test/validate")
        .send({
          provider: "openai",
          model: "gpt-3.5-turbo",
          prompt: "This is a valid test prompt with sufficient content.",
          temperature: 0.7,
          maxTokens: 100,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(Array.isArray(response.body.data.errors)).toBe(true);
      expect(Array.isArray(response.body.data.warnings)).toBe(true);
    });

    it("should return errors for invalid configuration", async () => {
      const response = await request(app)
        .post("/api/test/validate")
        .send({
          provider: "invalid",
          model: "",
          prompt: "",
          temperature: 3.0,
          maxTokens: 5000,
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
          prompt: "Explain quantum computing in simple terms.",
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
      expect(response.body.data).toHaveProperty("summary");
      expect(Array.isArray(response.body.data.results)).toBe(true);
      expect(response.body.data.results).toHaveLength(2);
    });
  });
});
