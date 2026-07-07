const authService = require("../services/authService");
const ApiResponse = require("../utils/apiResponse");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.unauthorized(res, "No token provided");
  }

  const token = authHeader.split(" ")[1];
  const decoded = authService.verifyAccessToken(token);
  if (!decoded) {
    return ApiResponse.unauthorized(res, "Invalid or expired token");
  }

  req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
  next();
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = authService.verifyAccessToken(token);
    if (decoded) {
      req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    }
  }
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, "Authentication required");
    }
    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, "Insufficient permissions");
    }
    next();
  };
};

module.exports = { authenticate, optionalAuth, requireRole };
