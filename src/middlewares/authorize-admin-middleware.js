import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";

/**
 * Admin authorization middleware with monitoring/logging
 * Allows admin to access all routes and operations
 */
export const authorizeAdmin = expressAsyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role !== "admin") {
    throw new AppError("You are not authorized to perform this action. Admin access required.", 403);
  }

  // Log admin action for monitoring (optional - can be enhanced with database logging)
  if (process.env.NODE_ENV === "development") {
    console.log(`[ADMIN ACTION] ${req.method} ${req.originalUrl} - Admin: ${req.user.email} (${req.user._id})`);
  }

  // Set flag to indicate admin access for use in controllers/services
  req.isAdmin = true;
  next();
});

/**
 * Optional middleware to allow admin OR regular user access
 * Useful for routes where admin can bypass restrictions
 */
export const authorizeAdminOrOwner = expressAsyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  // Admin has full access
  if (req.user.role === "admin") {
    req.isAdmin = true;
    return next();
  }

  // Regular users continue with normal authorization
  next();
});
