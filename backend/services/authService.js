const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/env");
const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

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
      throw new AppError("Email already registered", 409);
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
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError("Account is deactivated", 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
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
      throw new AppError("Invalid refresh token", 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError("User not found or inactive", 401);
    }

    if (user.refreshToken !== refreshToken) {
      throw new AppError("Refresh token has been revoked", 401);
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
      throw new AppError("User not found", 404);
    }
    return user.toPublicJSON();
  }
}

module.exports = new AuthService();
