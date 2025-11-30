import bcrypt from "bcryptjs";
import AppError from "../utils/AppError.js";
import userModel from "../models/user-model.js";
import generateToken from "../utils/generateToken.js";
import { MAX_REFRESH_TOKENS_PER_USER } from "../utils/constants.js";

/**
 * Sign up a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user (without password)
 */
export const signUpService = async (userData) => {
  const { firstName, lastName, gender, address, email, password } = userData;

  // Check if user already exists
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const user = await userModel.create({
    firstName,
    lastName,
    gender,
    address,
    email,
    password,
  });

  if (!user) {
    throw new AppError("Registration failed!", 500);
  }

  // Return user without password
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;

  return userObject;
};

/**
 * Login user and generate tokens
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @param {string} credentials.deviceID - Device identifier
 * @returns {Promise<Object>} User data and tokens
 */
export const loginService = async ({ email, password, deviceID }) => {
  const user = await userModel.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const checkPassword = await user.comparePassword(password);
  if (!checkPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const { accessToken, refreshToken } = generateToken(user);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  // Check if device already exists
  const deviceIndex = user.refreshTokens.findIndex((token) => token.deviceID === deviceID);
  
  if (deviceIndex !== -1) {
    // Update existing device token
    user.refreshTokens[deviceIndex].token = hashedRefreshToken;
  } else {
    // Add new device token
    // Limit number of devices
    if (user.refreshTokens.length >= MAX_REFRESH_TOKENS_PER_USER) {
      // Remove oldest device (first in array)
      user.refreshTokens.shift();
    }
    user.refreshTokens.push({ deviceID, token: hashedRefreshToken });
  }

  await user.save();

  return {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token using refresh token
 * @param {Object} params - Refresh token parameters
 * @param {string} params.refreshToken - Refresh token from cookie
 * @param {string} params.deviceID - Device identifier
 * @returns {Promise<Object>} New access token and refresh token
 */
export const refreshTokenService = async ({ refreshToken, deviceID }) => {
  const user = await userModel.findOne({ email: refreshToken.email });
  if (!user) {
    throw new AppError("User does not exist", 404);
  }

  const deviceToken = user.refreshTokens.find((t) => t.deviceID === deviceID);
  if (!deviceToken) {
    throw new AppError("Unauthorized device", 401);
  }

  // Verify token matches stored hash
  const isValidToken = await bcrypt.compare(refreshToken.rawToken, deviceToken.token);
  if (!isValidToken) {
    // Token reuse detected - security breach
    user.refreshTokens = [];
    await user.save();
    throw new AppError("Token reuse detected. All sessions revoked.", 403);
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

  // Update device token
  const deviceIndex = user.refreshTokens.findIndex((t) => t.deviceID === deviceID);
  user.refreshTokens[deviceIndex].token = hashedRefreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout from current device
 * @param {Object} params - Logout parameters
 * @param {string} params.userEmail - User email from token
 * @param {string} params.deviceID - Device identifier
 * @param {string} params.refreshToken - Refresh token for verification
 * @returns {Promise<void>}
 */
export const logoutService = async ({ userEmail, deviceID, refreshToken }) => {
  const user = await userModel.findOne({ email: userEmail });
  if (!user) {
    throw new AppError("User does not exist", 404);
  }

  const targetDevice = user.refreshTokens.find((t) => t.deviceID === deviceID);
  if (!targetDevice) {
    throw new AppError("Device not found", 404);
  }

  // Verify token before logout
  const isValidToken = await bcrypt.compare(refreshToken, targetDevice.token);
  if (!isValidToken) {
    // Invalid token - remove device anyway for security
    user.refreshTokens = user.refreshTokens.filter((t) => t.deviceID !== deviceID);
    await user.save();
    throw new AppError("Invalid token", 401);
  }

  // Remove device token
  user.refreshTokens = user.refreshTokens.filter((t) => t.deviceID !== deviceID);
  await user.save();
};

/**
 * Logout from all devices
 * @param {string} userEmail - User email from token
 * @returns {Promise<void>}
 */
export const logoutAllService = async (userEmail) => {
  const user = await userModel.findOne({ email: userEmail });
  if (!user) {
    throw new AppError("User does not exist", 404);
  }

  user.refreshTokens = [];
  await user.save();
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data (without password and refreshTokens)
 */
export const getUserProfileService = async (userId) => {
  const user = await userModel.findById(userId).select("-password -refreshTokens");
  
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

/**
 * Get all users for dashboard (with pagination and filtering)
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.search - Search term for name or email
 * @returns {Promise<Object>} Users data with pagination info
 */
export const getAllUsersService = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = {};
  if (search) {
    searchQuery.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Get users with pagination
  const users = await userModel
    .find(searchQuery)
    .select("-password -refreshTokens")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await userModel.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / limit);

  return {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
