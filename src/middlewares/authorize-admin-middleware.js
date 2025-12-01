import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";

export const authorizeAdmin = expressAsyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new AppError("You are not authorized to perform this action. Admin access required.", 403);
  }
  next();
});



