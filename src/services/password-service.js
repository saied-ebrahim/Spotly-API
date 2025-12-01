import bcrypt from "bcryptjs/dist/bcrypt.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import userModel from "../models/user-model.js";
import verifyToken from "../utils/verifyRefreshToken.js";
import { sendEmail } from "../utils/emailSender.js";

export const forgetPasswordService = async (req, email) => {
  const user = await userModel.findOne({ email });
  if (!user) throw new AppError("User does not exist", 404);

  const secret = process.env.JWT_SECRET + user.password;
  const token = jwt.sign({ id: user._id, email, name: `${user.firstName} ${user.lastName}` }, secret, { expiresIn: "10m" });
  const link = `${req.protocol}://${req.get("host")}/api/v1/password/reset-password-link/${user._id}/${token}`;

  const html = `<p>Click <a href="${link}">reset password link</a> to reset your password</p>`;
  await sendEmail(user.email, "Reset Password", html);
  return link;
};

export const resetPasswordLinkService = async (userID, token) => {
  const user = await userModel.findById(userID);
  if (!user) throw new AppError("User does not exist", 404);

  const secret = process.env.JWT_SECRET + user.password;
  const decoded = verifyToken(token, secret);
  if (!decoded) throw new AppError("Invalid token", 400);
  return { email: user.email };
};

export const resetPasswordService = async (userID, token, password) => {
  const user = await userModel.findById(userID);
  if (!user) throw new AppError("User does not exist", 404);

  const secret = process.env.JWT_SECRET + user.password;
  const decoded = verifyToken(token, secret);
  if (!decoded) throw new AppError("Invalid token", 400);

  user.password = password;
  await user.save();
};
