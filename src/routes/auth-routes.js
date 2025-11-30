import express from "express";

import {
  signUpController,
  loginController,
  refreshTokenController,
  logoutController,
  logoutAllController,
  getMeController,
  getUserProfileController,
  getAllUsersController,
} from "../controllers/auth-controller.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import {
  loginSchema,
  signUpSchema,
  refreshTokenSchema,
  logoutSchema,
} from "../validations/auth-validation.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { authorizeAdmin } from "../middlewares/authorize-admin-middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", validateMiddleware(signUpSchema), signUpController);
router.post("/login", validateMiddleware(loginSchema), loginController);
router.post("/refreshToken", validateMiddleware(refreshTokenSchema), refreshTokenController);
router.post("/logout", validateMiddleware(logoutSchema), logoutController);
router.post("/logoutAll", logoutAllController);

// Protected routes (require authentication)
router.get("/me", authMiddleware, getMeController);
router.get("/profile/:id", authMiddleware, getUserProfileController);
router.get("/users", authMiddleware, authorizeAdmin, getAllUsersController); // Dashboard - Admin only

export default router;
