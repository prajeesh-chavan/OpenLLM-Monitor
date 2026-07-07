const authService = require("../services/authService");
const ApiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return ApiResponse.success(res, result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return ApiResponse.badRequest(res, "Refresh token is required");
    const result = await authService.refresh(refreshToken);
    return ApiResponse.success(res, result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

const logout = async (req, res) => {
  try {
    await authService.logout(req.user.userId);
    return ApiResponse.success(res, { message: "Logged out successfully" });
  } catch (error) {
    logger.error({ err: error }, "Logout failed");
    return ApiResponse.error(res, "Logout failed", 500, error.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.userId);
    return ApiResponse.success(res, profile);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = { register, login, refresh, logout, getProfile };
