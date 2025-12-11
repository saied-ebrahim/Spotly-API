import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import { forgotPasswordService, resetPasswordLinkService, resetPasswordService } from "../services/password-service.js";

/**
 * @desc   Forget password
 * @route  POST /api/v1/password/forgot-password
 * @access Public
 */
export const forgotPasswordController = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required", 400);
  const link = await forgotPasswordService(req, email);
  res.status(200).json({ message: "Check your email for password reset instructions", link });
});

/**
 * @desc   Reset password link
 * @route  GET /api/v1/password/reset-password-link/:userID/:token
 * @access Public
 * @note  Redirect to reset password page
 */
export const resetPasswordLinkController = expressAsyncHandler(async (req, res) => {
  const { userID } = req.params;
  const { token } = await resetPasswordLinkService(userID, req.params.token);
  res.render("index", { userID, token });
});

/**
 * @desc   Reset password
 * @route  POST /api/v1/password/reset-password/:userID/:token
 * @access Public
 */
export const resetPasswordController = expressAsyncHandler(async (req, res) => {
  const { userID, token } = req.params;
  const { password } = req.body;
  if (!password) throw new AppError("Password is required", 400);
  await resetPasswordService(userID, token, password);
  res.status(200).json({ message: "Password reset successfully" });
});
