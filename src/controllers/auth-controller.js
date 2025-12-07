import expressAsyncHandler from "express-async-handler";
import { signUpService, loginService, refreshTokenService, logoutService, logoutAllService, getUserProfileService, getAllUsersService, updatemeService } from "../services/auth-service.js";
import verifyToken from "../utils/verifyRefreshToken.js";
import { getCookieOptions } from "../utils/constants.js";
import AppError from "../utils/AppError.js";

/**
 * @desc   Sign up new user
 * @route  POST /api/v1/auth/signup
 * @access Public
 */
export const signUpController = expressAsyncHandler(async (req, res) => {
  const userData = req.body;
  await signUpService(userData);
  res.status(201).json({ message: "Registration successful" });
});

/**
 * @desc   Login user
 * @route  POST /api/v1/auth/login
 * @access Public
 */
export const loginController = expressAsyncHandler(async (req, res) => {
  const loginData = req.body;
  const { accessToken, refreshToken } = await loginService(loginData);
  res.cookie("token", refreshToken, getCookieOptions());
  res.status(200).json({ message: "Login successful", token: accessToken });
});

/**
 * @desc   Refresh access token
 * @route  POST /api/v1/auth/refreshToken
 * @access Public
 */
export const refreshTokenController = expressAsyncHandler(async (req, res) => {
  const { deviceID } = req.body;
  const { token } = req.cookies;

  if (!deviceID) {
    throw new AppError("Device ID is required", 400);
  }

  if (!token) {
    throw new AppError("Refresh token is missing. Please log in again.", 401);
  }

  try {
    const decoded = verifyToken(token, process.env.REFRESH_SECRET);
    const { accessToken, refreshToken } = await refreshTokenService({ refreshToken: { ...decoded, rawToken: token }, deviceID });
    res.cookie("token", refreshToken, getCookieOptions());
    res.status(200).json({ message: "Token refreshed successfully", token: accessToken });
  } catch (error) {
    res.clearCookie("token");
    throw error;
  }
});

/**
 * @desc   Logout from current device
 * @route  POST /api/v1/auth/logout
 * @access Public
 */
export const logoutController = expressAsyncHandler(async (req, res) => {
  const { deviceID } = req.body;
  const { token } = req.cookies;

  if (!deviceID) {
    throw new AppError("Device ID is required", 400);
  }

  if (!token) {
    throw new AppError("Refresh token is missing. Please log in first.", 401);
  }

  try {
    const decoded = verifyToken(token, process.env.REFRESH_SECRET);

    await logoutService({ userEmail: decoded.email, deviceID, refreshToken: token });

    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.clearCookie("token");
    throw error;
  }
});

/**
 * @desc   Logout from all devices
 * @route  POST /api/v1/auth/logoutAll
 * @access Public
 */
export const logoutAllController = expressAsyncHandler(async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    throw new AppError("Missing required credentials. Please log in first.", 401);
  }

  try {
    const decoded = verifyToken(token, process.env.REFRESH_SECRET);
    await logoutAllService(decoded.email);
    res.clearCookie("token");
    res.status(200).json({ message: "Logout from all devices successful" });
  } catch (error) {
    res.clearCookie("token");
    throw error;
  }
});

/**
 * @desc   Get current user profile (from token)
 * @route  GET /api/v1/auth/me
 * @access Protected
 */
export const getMeController = expressAsyncHandler(async (req, res) => {
  const user = await getUserProfileService(req.user._id);
  res.status(200).json({ status: "success", data: { user } });
});

/**
 * @desc   Get all users
 * @route  GET /api/v1/auth/users
 * @access Protected (Admin only)
 * @query  page, limit, search
 */
export const getAllUsersController = expressAsyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || "";

  if (page < 1) throw new AppError("Page number must be greater than 0", 400);
  if (limit < 1 || limit > 100) throw new AppError("Limit must be between 1 and 100", 400);

  const { users, pagination } = await getAllUsersService({ page, limit, search });

  res.status(200).json({ status: "success", results: users.length, pagination, data: { users } });
});

// @desc Update me
// @route PUT /api/v1/auth/updateMe
// @access Protected
export const updateMeController = expressAsyncHandler(async (req, res) => {
  const userID = req.user.id;
  const newUser = await updatemeService(userID, req.body);
  res.status(200).json({ status: "success", data: { user: newUser } });
});

/**
 * @desc   Get user profile by ID
 * @route  GET /api/v1/auth/profile/:id
 * @access Protected
 */
// ! export const getUserProfileController = expressAsyncHandler(async (req, res) => {
//   const { id } = req.params;

//   // Validate MongoDB ObjectId format
//   const mongoose = (await import("mongoose")).default;
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new AppError("Invalid user ID format", 400);
//   }

//   const user = await getUserProfileService(id);

//   res.status(200).json({
//     status: "success",
//     data: { user },
//   });
// });
