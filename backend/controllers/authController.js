const asyncHandler = require("../middlewares/asyncHandler");
const authService = require("../services/authService");
const ApiResponse = require("../utils/apiResponse");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ApiResponse.created(res, result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return ApiResponse.success(res, result);
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  return ApiResponse.success(res, result);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.userId);
  return ApiResponse.success(res, { message: "Logged out successfully" });
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.userId);
  return ApiResponse.success(res, profile);
});

module.exports = { register, login, refresh, logout, getProfile };
