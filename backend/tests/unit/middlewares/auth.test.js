const { authenticate, optionalAuth, requireRole } = require("../../../middlewares/auth");
const authService = require("../../../services/authService");

function mockReq(headers = {}) {
  return { headers };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("auth middleware", () => {
  let validToken;

  beforeAll(() => {
    const user = { _id: "507f191e810c19729de860ea", email: "a@b.com", role: "admin" };
    validToken = authService.generateAccessToken(user);
  });

  describe("authenticate", () => {
    it("should call next() with valid token", () => {
      const req = mockReq({ authorization: `Bearer ${validToken}` });
      const res = mockRes();
      const next = jest.fn();

      authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe("507f191e810c19729de860ea");
    });

    it("should return 401 if no token", () => {
      const req = mockReq({});
      const res = mockRes();
      const next = jest.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is invalid", () => {
      const req = mockReq({ authorization: "Bearer bad-token" });
      const res = mockRes();
      const next = jest.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("optionalAuth", () => {
    it("should set req.user if valid token", () => {
      const req = mockReq({ authorization: `Bearer ${validToken}` });
      const next = jest.fn();

      optionalAuth(req, {}, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it("should call next() without req.user if no token", () => {
      const req = mockReq({});
      const next = jest.fn();

      optionalAuth(req, {}, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe("requireRole", () => {
    it("should call next() if role matches", () => {
      const req = { user: { role: "admin" } };
      const res = mockRes();
      const next = jest.fn();

      requireRole("admin")(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should return 403 if role does not match", () => {
      const req = { user: { role: "user" } };
      const res = mockRes();
      const next = jest.fn();

      requireRole("admin")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if no user", () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();

      requireRole("admin")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
