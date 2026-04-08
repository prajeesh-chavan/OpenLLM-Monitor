const jwt = require("jsonwebtoken");
const config = require("../config/env");

/**
 * JWT Authentication Middleware
 * Verifies Bearer token in Authorization header
 */
const authenticate = (req, res, next) => {
  // Skip auth if JWT_SECRET is not configured (development without auth)
  if (!config.jwtSecret) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Provide Bearer token in Authorization header.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please login again.",
      });
    }
    return res.status(401).json({
      success: false,
      error: "Invalid token.",
    });
  }
};

/**
 * Generate a JWT token (utility for login/setup)
 */
const generateToken = (payload, expiresIn = "24h") => {
  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

module.exports = { authenticate, generateToken };
