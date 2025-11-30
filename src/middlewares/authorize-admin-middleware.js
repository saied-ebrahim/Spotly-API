import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";

/**
 * Authorization middleware - Verifies that the current user has admin role
 * Must be used after authMiddleware
 */
export const authorizeAdmin = expressAsyncHandler(async (req, res, next) => {
  // Check if user has admin role
  if (req.user.role !== "admin") {
    throw new AppError("You are not authorized to perform this action. Admin access required.", 403);
  }

  next();
});


