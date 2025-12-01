import bcrypt from "bcryptjs";
import AppError from "../utils/AppError.js";
import userModel from "../models/user-model.js";
import generateToken from "../utils/generateToken.js";
import { MAX_REFRESH_TOKENS_PER_USER } from "../utils/constants.js";

export const signUpService = async (userData) => {
  const { firstName, lastName, gender, address, email, password } = userData;
  if (!firstName || !lastName || !gender || !address || !email || !password) {
    throw new AppError("Please provide all required fields", 400);
  }

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const user = await userModel.create({ firstName, lastName, gender, address, email, password });

  if (!user) {
    throw new AppError("Registration failed!", 500);
  }
};

export const loginService = async (loginData) => {
  const { email, password, deviceID } = loginData;
  if (!email || !password || !deviceID) {
    throw new AppError("Please provide all required fields", 400);
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email", 401);
  }

  const checkPassword = await user.comparePassword(password);
  if (!checkPassword) {
    throw new AppError("Invalid password", 401);
  }

  const { accessToken, refreshToken } = generateToken(user);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  const deviceIndex = user.refreshTokens.findIndex((token) => token.deviceID === deviceID);
  if (deviceIndex !== -1) {
    user.refreshTokens[deviceIndex].token = hashedRefreshToken;
  } else {
    if (user.refreshTokens.length >= MAX_REFRESH_TOKENS_PER_USER) {
      user.refreshTokens.shift();
    }
    user.refreshTokens.push({ deviceID, token: hashedRefreshToken });
  }
  await user.save();

  return { accessToken, refreshToken };
};

export const refreshTokenService = async ({ refreshToken, deviceID }) => {
  const user = await userModel.findOne({ email: refreshToken.email });
  if (!user) {
    throw new AppError("User does not exist", 404);
  }

  const deviceToken = user.refreshTokens.find((t) => t.deviceID === deviceID);
  if (!deviceToken) {
    throw new AppError("Unauthorized device", 401);
  }

  const isValidToken = await bcrypt.compare(refreshToken.rawToken, deviceToken.token);
  if (!isValidToken) {
    user.refreshTokens = [];
    await user.save();
    throw new AppError("Token reuse detected. All sessions revoked.", 403);
  }

  const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

  const deviceIndex = user.refreshTokens.findIndex((t) => t.deviceID === deviceID);
  user.refreshTokens[deviceIndex].token = hashedRefreshToken;
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutService = async ({ userEmail, deviceID, refreshToken }) => {
  const user = await userModel.findOne({ email: userEmail });
  if (!user) {
    throw new AppError("User does not exist", 404);
  }

  const targetDevice = user.refreshTokens.find((t) => t.deviceID === deviceID);
  if (!targetDevice) {
    throw new AppError("Device not found", 404);
  }

  const isValidToken = await bcrypt.compare(refreshToken, targetDevice.token);
  if (!isValidToken) {
    user.refreshTokens = user.refreshTokens.filter((t) => t.deviceID !== deviceID);
    await user.save();
    throw new AppError("Invalid token", 401);
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t.deviceID !== deviceID);
  await user.save();
};

export const logoutAllService = async (userEmail) => {
  const user = await userModel.findOne({ email: userEmail });
  if (!user) {
    throw new AppError("User does not exist", 404);
  }
  user.refreshTokens = [];
  await user.save();
};

export const getUserProfileService = async (userId) => {
  const user = await userModel.findById(userId).select("-password -refreshTokens");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const getAllUsersService = async ({ page = 1, limit = 5, search = "" } = {}) => {
  const skip = (page - 1) * limit;

  const searchQuery = {};
  if (search) {
    searchQuery.$or = [{ firstName: { $regex: search, $options: "i" } }, { lastName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  }

  const users = await userModel.find(searchQuery).select("-password -refreshTokens").sort({ createdAt: -1 }).skip(skip).limit(limit);

  const total = await userModel.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / limit);

  return {
    pagination: { totalPages, currentPage: page, totalUsers: total, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    users,
  };
};
