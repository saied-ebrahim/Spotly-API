import jwt from "jsonwebtoken";
import AppError from "./AppError.js";

const verifyToken = (token, secret) => {
  if (!token) {
    throw new AppError("No token found", 401);
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
};

export default verifyToken;
