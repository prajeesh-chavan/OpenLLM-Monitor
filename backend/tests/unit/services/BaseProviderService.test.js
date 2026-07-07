const BaseProviderService = require("../../../services/BaseProviderService");

class TestProvider extends BaseProviderService {
  constructor() {
    super("test", {
      baseUrl: "https://api.test.com/v1",
      apiKey: "test-key",
      defaultModel: "test-model",
    });
  }
}

const mockParams = {
  requestId: "req-123",
  prompt: "Hello",
  model: "test-model",
  systemMessage: "",
  temperature: 0.7,
  maxTokens: 100,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stop: null,
};

describe("BaseProviderService", () => {
  let service;

  beforeEach(() => {
    service = new TestProvider();
  });

  it("should initialize with correct provider name", () => {
    expect(service.providerName).toBe("test");
  });

  it("should set initial config values", () => {
    expect(service.baseUrl).toBe("https://api.test.com/v1");
    expect(service.apiKey).toBe("test-key");
    expect(service.defaultModel).toBe("test-model");
  });

  it("should update API key", () => {
    service.updateApiKey("new-key");
    expect(service.apiKey).toBe("new-key");
  });

  it("should update base URL", () => {
    service.updateBaseUrl("https://new.test.com");
    expect(service.baseUrl).toBe("https://new.test.com");
  });

  it("should build send result with all fields", () => {
    const result = service.buildSendResult(
      mockParams,
      "Hello world",
      { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      { promptCost: 0.001, completionCost: 0.002, totalCost: 0.003, currency: "USD" },
      150,
      [],
      {},
      "stop"
    );
    expect(result.status).toBe("success");
    expect(result.completion).toBe("Hello world");
    expect(result.model).toBe("test-model");
    expect(result.tokenUsage.totalTokens).toBe(30);
    expect(result.cost.totalCost).toBe(0.003);
    expect(result.latency).toBe(150);
    expect(result.requestId).toBe("req-123");
    expect(result.timestamp).toBeUndefined();
  });

  it("should build error result", () => {
    const error = new Error("API failure");
    const result = service.buildErrorResult(mockParams, error, 200);
    expect(result.status).toBe("error");
    expect(result.error.message).toBe("API failure");
    expect(result.completion).toBe("");
    expect(result.requestId).toBe("req-123");
    expect(result.latency).toBe(200);
  });

  it("should throw for unimplemented sendPrompt", async () => {
    await expect(service.sendPrompt({})).rejects.toThrow("sendPrompt() not implemented for test");
  });

  it("should return empty array for listModels", async () => {
    const models = await service.listModels();
    expect(models).toEqual([]);
  });

  it("should return false for testConnection when no models", async () => {
    const connected = await service.testConnection();
    expect(connected).toBe(false);
  });

  it("should estimate tokens roughly", () => {
    const count = service.estimateTokens("Hello, how are you today?");
    expect(count).toBeGreaterThan(0);
    expect(Number.isInteger(count)).toBe(true);
  });
});
