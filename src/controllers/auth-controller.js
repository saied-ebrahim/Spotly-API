import expressAsyncHandler from "express-async-handler";
import {
  signUpService,
  loginService,
  refreshTokenService,
  logoutService,
  logoutAllService,
  getUserProfileService,
  getAllUsersService,
} from "../services/auth-service.js";
import { verifyRefreshToken } from "../utils/verifyRefreshToken.js";
import { getCookieOptions } from "../utils/constants.js";
import AppError from "../utils/AppError.js";

/**
 * @desc   Sign up new user
 * @route  POST /api/v1/auth/signup
 * @access Public
 */
export const signUpController = expressAsyncHandler(async (req, res, next) => {
  const userData = req.body;
  const user = await signUpService(userData);

  res.status(201).json({
    status: "success",
    message: "Registration successful",
    data: { user },
  });
});

/**
 * @desc   Login user
 * @route  POST /api/v1/auth/login
 * @access Public
 */
export const loginController = expressAsyncHandler(async (req, res, next) => {
  const { email, password, deviceID } = req.body;

  const { user, accessToken, refreshToken } = await loginService({
    email,
    password,
    deviceID,
  });

  // Set refresh token in cookie
  res.cookie("token", refreshToken, getCookieOptions());

  res.status(200).json({
    status: "success",
    message: "Login successful",
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * @desc   Refresh access token
 * @route  POST /api/v1/auth/refreshToken
 * @access Public
 */
export const refreshTokenController = expressAsyncHandler(async (req, res, next) => {
  const { deviceID } = req.body;
  const { token } = req.cookies;

  if (!deviceID) {
    throw new AppError("Please provide device ID", 400);
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Get raw token for comparison
    const { accessToken, refreshToken } = await refreshTokenService({
      refreshToken: { ...decoded, rawToken: token },
      deviceID,
    });

    // Set new refresh token in cookie
    res.cookie("token", refreshToken, getCookieOptions());

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  } catch (error) {
    // Clear cookie on any error
    res.clearCookie("token");
    throw error;
  }
});

/**
 * @desc   Logout from current device
 * @route  POST /api/v1/auth/logout
 * @access Public
 */
export const logoutController = expressAsyncHandler(async (req, res, next) => {
  const { deviceID } = req.body;
  const { token } = req.cookies;

  if (!deviceID) {
    throw new AppError("Please provide device ID", 400);
  }

  if (!token) {
    throw new AppError("Missing required credentials", 400);
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    await logoutService({
      userEmail: decoded.email,
      deviceID,
      refreshToken: token,
    });

    res.clearCookie("token");
    res.status(200).json({
      status: "success",
      message: "Logout successful",
    });
  } catch (error) {
    // Clear cookie on any error
    res.clearCookie("token");
    throw error;
  }
});

/**
 * @desc   Logout from all devices
 * @route  POST /api/v1/auth/logoutAll
 * @access Public
 */
export const logoutAllController = expressAsyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new AppError("Missing required credentials", 400);
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    await logoutAllService(decoded.email);

    res.clearCookie("token");
    res.status(200).json({
      status: "success",
      message: "Logout from all devices successful",
    });
  } catch (error) {
    // Clear cookie on any error
    res.clearCookie("token");
    throw error;
  }
});

/**
 * @desc   Get current user profile (from token)
 * @route  GET /api/v1/auth/me
 * @access Protected
 */
export const getMeController = expressAsyncHandler(async (req, res, next) => {
  // req.user is set by authMiddleware
  const user = await getUserProfileService(req.user._id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

/**
 * @desc   Get user profile by ID
 * @route  GET /api/v1/auth/profile/:id
 * @access Protected
 */
export const getUserProfileController = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await getUserProfileService(id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

/**
 * @desc   Get all users for dashboard
 * @route  GET /api/v1/auth/users
 * @access Protected (Dashboard)
 */
export const getAllUsersController = expressAsyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  const { users, pagination } = await getAllUsersService({
    page,
    limit,
    search,
  });

  res.status(200).json({
    status: "success",
    results: users.length,
    pagination,
    data: { users },
  });
});
