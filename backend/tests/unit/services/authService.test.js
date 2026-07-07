const jwt = require("jsonwebtoken");
const authService = require("../../../services/authService");
const config = require("../../../config/env");

describe("AuthService", () => {
  const mockUser = {
    _id: "507f191e810c19729de860ea",
    email: "test@example.com",
    role: "user",
    toPublicJSON: function () {
      return { id: this._id, email: this.email, role: this.role, name: "Test" };
    },
  };

  describe("generateAccessToken", () => {
    it("should generate a valid JWT", () => {
      const token = authService.generateAccessToken(mockUser);
      expect(token).toBeDefined();
      const decoded = jwt.verify(token, config.jwtSecret);
      expect(decoded.userId).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh JWT", () => {
      const token = authService.generateRefreshToken(mockUser);
      expect(token).toBeDefined();
      const decoded = jwt.verify(token, config.jwtSecret + "_refresh");
      expect(decoded.userId).toBe(mockUser._id);
    });
  });

  describe("verifyAccessToken", () => {
    it("should return decoded payload for valid token", () => {
      const token = authService.generateAccessToken(mockUser);
      const decoded = authService.verifyAccessToken(token);
      expect(decoded.userId).toBe(mockUser._id);
    });

    it("should return null for expired token", () => {
      const expired = jwt.sign({ userId: mockUser._id }, config.jwtSecret, { expiresIn: "0s" });
      expect(authService.verifyAccessToken(expired)).toBeNull();
    });

    it("should return null for invalid token", () => {
      expect(authService.verifyAccessToken("invalid-token")).toBeNull();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should return decoded for valid refresh token", () => {
      const token = authService.generateRefreshToken(mockUser);
      const decoded = authService.verifyRefreshToken(token);
      expect(decoded.userId).toBe(mockUser._id);
    });

    it("should return null for invalid refresh token", () => {
      expect(authService.verifyRefreshToken("bad")).toBeNull();
    });
  });
});
