import jwt from "jsonwebtoken";
import AppError from "./AppError.js";

/**
 * Verifies refresh token from cookies and returns decoded token
 * @param {string} token - Refresh token from cookies
 * @returns {Object} Decoded token
 * @throws {AppError} If token is invalid or expired
 */
export const verifyRefreshToken = (token) => {
  if (!token) {
    throw new AppError("No token found", 401);
  }

  try {
    return jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
};

