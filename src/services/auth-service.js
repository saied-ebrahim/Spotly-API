import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import AppError from "../utils/AppError.js";
import userModel from "../models/user-model.js";
import generateToken from "../utils/genreateToken.js";

// ! @desc   Sign up new user
// ! @route  POST /api/v1/auth/signup
// ! @params { firstName, lastName, gender, address, email, password }
const signUpService = expressAsyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    gender,
    address: { city, country, state },
    email,
    password,
  } = req.body;
  if (!firstName || !lastName || !gender || !city || !country || !state || !email || !password) {
    return next(new AppError("Please provide all required fields", 400));
  }
  const user = await userModel.create({ firstName, lastName, gender, address: { city, country, state }, email, password });
  !user ? next(new AppError("Registration failed!", 500)) : res.status(201).json({ message: "Registration successful" });
});

// ! @desc   Login user
// ! @route  POST /api/v1/auth/login
// ! @params { email, password }
const loginService = expressAsyncHandler(async (req, res, next) => {
  const { email, password, deviceID } = req.body;
  if (!email || !password || !deviceID) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const user = await userModel.findOne({ email });
  if (!user) return next(new AppError("User is not exist", 404));

  const checkPassword = await user.comparePassword(password);
  if (!checkPassword) return next(new AppError("Wrong Password", 401));

  const { accessToken, refreshToken } = generateToken(user);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  const device = user.refreshTokens.find((token) => token.deviceID === deviceID);
  device ? (device.token = hashedRefreshToken) : user.refreshTokens.push({ deviceID, token: hashedRefreshToken });
  await user.save();

  res.cookie("token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.status(200).json({ message: "Login successful", token: accessToken });
});

// ! @desc   Refresh token
// ! @route  POST /api/v1/auth/refreshToken
// ! @params { deviceID }
const refreshTokenService = expressAsyncHandler(async (req, res, next) => {
  const { deviceID } = req.body;
  if (!deviceID) return next(new AppError("Please provide device ID", 400));

  const { token } = req.cookies;
  if (!token) return next(new AppError("No token found", 401));

  let decode;
  try {
    decode = jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (error) {
    res.clearCookie("token");
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await userModel.findOne({ email: decode.email });
  if (!user) {
    res.clearCookie("token");
    return next(new AppError("User does not exist", 404));
  }

  const deviceToken = user.refreshTokens.find((t) => t.deviceID === deviceID);
  if (!deviceToken) {
    res.clearCookie("token");
    return next(new AppError("Unauthorized device", 401));
  }

  const isValidToken = await bcrypt.compare(token, deviceToken.token);
  if (!isValidToken) {
    console.warn(`Token reuse detected for user ${user._id}`);
    user.refreshTokens = [];
    await user.save();
    res.clearCookie("token");
    return next(new AppError("Token reuse detected. All sessions revoked.", 403));
  }
  const { accessToken, refreshToken } = generateToken(user);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  user.refreshTokens = user.refreshTokens.filter((t) => t.deviceID !== deviceID).concat({ deviceID, token: hashedRefreshToken });
  await user.save();

  res.cookie("token", refreshToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 1000 * 60 * 60 * 24 * 7 });
  res.status(200).json({ message: "Token refreshed successfully", accessToken });
});

// ! @desc   Logout from current device
// ! @route  POST /api/v1/auth/logout
// ! @params { deviceID }
const logoutService = expressAsyncHandler(async (req, res, next) => {
  const { deviceID } = req.body;
  const { token } = req.cookies;

  if (!deviceID || !token) {
    return next(new AppError("Missing required credentials", 400));
  }

  let decode;
  try {
    decode = jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (err) {
    res.clearCookie("token");
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await userModel.findOne({ email: decode.email });
  if (!user) {
    res.clearCookie("token");
    return next(new AppError("Unauthorized user", 401));
  }

  const targetDevice = user.refreshTokens.find((t) => t.deviceID === deviceID);
  if (!targetDevice) {
    res.clearCookie("token");
    return next(new AppError("Device not found", 401));
  }

  const isValidToken = await bcrypt.compare(token, targetDevice.token);
  if (!isValidToken) {
    user.refreshTokens = user.refreshTokens.filter((t) => t.deviceID !== deviceID);
    await user.save();
    res.clearCookie("token");
    return next(new AppError("Invalid token", 401));
  }

  await userModel.findOneAndUpdate({ email: decode.email, "refreshTokens.deviceID": deviceID }, { $pull: { refreshTokens: { deviceID } } });
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

// ! @desc   Logout from all devices
// ! @route  POST /api/v1/auth/logoutAll
// ! @params { deviceID }
const logoutAllService = expressAsyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError("Missing required credentials", 400));
  }

  let decode;
  try {
    decode = jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (err) {
    res.clearCookie("token");
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await userModel.findOne({ email: decode.email });
  if (!user) {
    res.clearCookie("token");
    return next(new AppError("Unauthorized user", 401));
  }

  await userModel.findOneAndUpdate({ email: decode.email }, { $set: { refreshTokens: [] } });
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

export { signUpService, loginService, refreshTokenService, logoutService, logoutAllService };
