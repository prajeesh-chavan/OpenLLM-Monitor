const express = require("express");
const request = require("supertest");

jest.mock("mongoose", () => {
  class MockSchema {
    constructor() { this.pre = jest.fn().mockReturnThis(); this.method = jest.fn().mockReturnThis(); this.statics = jest.fn().mockReturnThis(); this.index = jest.fn().mockReturnThis(); this.virtual = jest.fn().mockReturnThis(); }
  }
  MockSchema.Types = { Mixed: Object, ObjectId: String };
  return { connect: jest.fn().mockResolvedValue(true), model: jest.fn().mockReturnValue({}), Schema: MockSchema, Types: { ObjectId: { isValid: jest.fn().mockReturnValue(true) } } };
});

jest.mock("../../../services/apiKeyService", () => ({
  loadAll: jest.fn().mockResolvedValue({}),
  getAll: jest.fn().mockReturnValue({}),
  getEffectiveApiKey: jest.fn().mockReturnValue(null),
  get: jest.fn().mockReturnValue(null),
}));

jest.mock("../../../models/User", () => {
  const UserModel = jest.fn().mockImplementation(() => ({
    _id: "507f191e810c19729de860ea",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    isActive: true,
    refreshToken: null,
    toPublicJSON() { return { id: this._id, email: this.email, name: this.name, role: this.role, isActive: this.isActive }; },
    save: jest.fn().mockResolvedValue(true),
  }));
  UserModel.findOne = jest.fn();
  UserModel.findById = jest.fn();
  UserModel.findByIdAndUpdate = jest.fn();
  UserModel.create = jest.fn();
  return UserModel;
});

jest.mock("../../../models/Log", () => ({}));
jest.mock("../../../models/ProviderSettings", () => ({ find: jest.fn().mockResolvedValue([]), findOne: jest.fn(), findOneAndUpdate: jest.fn(), deleteOne: jest.fn() }));
jest.mock("../../../utils/logger", () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), fatal: jest.fn() }));

const authRoutes = require("../../../routes/auth");

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  // error handler for validation errors
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ success: false, error: "Invalid JSON" });
    next(err);
  });
  return app;
}

describe("Auth API", () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 for empty body", async () => {
      const res = await request(app).post("/api/auth/register").send({}).expect(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid email", async () => {
      const res = await request(app).post("/api/auth/register").send({ email: "not-an-email", password: "password123", name: "Test" }).expect(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for short password", async () => {
      const res = await request(app).post("/api/auth/register").send({ email: "test@example.com", password: "short", name: "Test" }).expect(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 for empty body", async () => {
      const res = await request(app).post("/api/auth/login").send({}).expect(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should return 400 for missing refreshToken", async () => {
      const res = await request(app).post("/api/auth/refresh").send({}).expect(400);
      expect(res.body.success).toBe(false);
    });
  });
});
