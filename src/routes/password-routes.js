import express from "express";

import { forgetPasswordController, resetPasswordLinkController, resetPasswordController } from "../controllers/password-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import { forgetPasswordSchema, resetPasswordSchema } from "../validations/password-validation.js";

const router = express.Router();

router.post("/forget-password", validateMiddleware(forgetPasswordSchema), forgetPasswordController);
router.get("/reset-password-link/:userID/:token", resetPasswordLinkController);
router.post("/reset-password/:userID/:token", validateMiddleware(resetPasswordSchema), resetPasswordController);

export default router;
