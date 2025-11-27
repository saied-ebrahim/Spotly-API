import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import AppError from "../utils/AppError.js";
import userModel from "../models/user-model.js";

// ! @desc   Sign up new user
// ! @route  POST /api/v1/auth/signup
// ! @params { firstName, lastName, gender, address, email, password }
const signUpService = expressAsyncHandler(async (req, res, next) => {
  const { firstName, lastName, gender, city, country, state, email, password } = req.body;
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

  const accessToken = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "1d" });
  const refreshToken = jwt.sign({ id: user._id, email }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES || "7d" });
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
  console.log(isValidToken);
  if (!isValidToken) {
    console.warn(`Token reuse detected for user ${user._id}`);
    user.refreshTokens = [];
    await user.save();
    res.clearCookie("token");
    return next(new AppError("Token reuse detected. All sessions revoked.", 403));
  }

  const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "15m" });
  const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES || "7d" });
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  user.refreshTokens = user.refreshTokens.filter((t) => t.deviceID !== deviceID).concat({ deviceID, token: hashedRefreshToken });
  await user.save();

  res.cookie("token", refreshToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 1000 * 60 * 60 * 24 * 7 });

  res.status(200).json({ message: "Token refreshed successfully", accessToken });
});
export { signUpService, loginService, refreshTokenService };
