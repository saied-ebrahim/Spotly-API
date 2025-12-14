import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import userModel from "../models/user-model.js";

export const authMiddleware = expressAsyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new AppError("Invalid or expired token. Please log in again.", 401));
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new AppError("The user belonging to this token does no longer exist.", 401));
  }

  req.user = user;
  next();
});

export default authMiddleware;
