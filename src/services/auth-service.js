import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import AppError from "../utils/AppError.js";
import UserModel from "../models/user-model.js";

// ! @desc   Sign up new user
// ! @route  POST /api/v1/auth/signup
// ! @params { firstName, lastName, gender, address, email, password }
// ! @access Public
const signUpService = expressAsyncHandler(async (req, res, next) => {
  const { firstName, lastName, gender, city, country, state, email, password } = req.body;
  if (!firstName || !lastName || !gender || !city || !country || !state || !email || !password) {
    return next(new AppError("Please provide all required fields", 400));
  }
  const user = await UserModel.create({ firstName, lastName, gender, address: { city, country, state }, email, password });
  !user ? next(new AppError("Registration failed!", 500)) : res.status(201).json({ message: "Registration successful" });
});

// ! @desc   Login user
// ! @route  POST /api/v1/auth/login
// ! @params { email, password }
// ! @access Public
const loginService = expressAsyncHandler(async (req, res, next) => {
  const { email, password, deviceID } = req.body;
  if (!email || !password || !deviceID) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const user = await UserModel.findOne({ email });
  if (!user) return next(new AppError("User is not exist", 404));

  const checkPassword = await user.comparePassword(password);
  if (!checkPassword) return next(new AppError("Wrong Password", 401));

  const accessToken = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "1d" });
  const refreshToken = jwt.sign({ id: user._id, email }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES || "7d" });
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  const device = user.refreshTokens.find((token) => token.deviceID === deviceID);
  device ? (device.token = hashedRefreshToken) : user.refreshTokens.push({ deviceID, token: hashedRefreshToken });
  await user.save();

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.status(200).json({ message: "Login successful", token: accessToken });
});

export { signUpService, loginService };
