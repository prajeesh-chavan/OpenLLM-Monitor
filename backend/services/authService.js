const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/env");
const logger = require("../utils/logger");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user._id },
      config.jwtSecret + "_refresh",
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return null;
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret + "_refresh");
    } catch (err) {
      return null;
    }
  }

  async register({ email, password, name }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw Object.assign(new Error("Email already registered"), { statusCode: 409 });
    }

    const user = await User.create({ email, password, name });
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    logger.info({ userId: user._id }, "User registered");

    return { user: user.toPublicJSON(), accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
    }

    if (!user.isActive) {
      throw Object.assign(new Error("Account is deactivated"), { statusCode: 403 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    logger.info({ userId: user._id }, "User logged in");

    return { user: user.toPublicJSON(), accessToken, refreshToken };
  }

  async refresh(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw Object.assign(new Error("Invalid refresh token"), { statusCode: 401 });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw Object.assign(new Error("User not found or inactive"), { statusCode: 401 });
    }

    if (user.refreshToken !== refreshToken) {
      throw Object.assign(new Error("Refresh token has been revoked"), { statusCode: 401 });
    }

    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    logger.info({ userId }, "User logged out");
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    return user.toPublicJSON();
  }
}

module.exports = new AuthService();
