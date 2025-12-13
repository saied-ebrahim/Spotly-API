import {Router} from "express";

import { forgotPasswordController, resetPasswordLinkController, resetPasswordController, changePasswordController } from "../controllers/password-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import { forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "../validations/password-validation.js";

const router = Router();

router.post("/forgot-password", validateMiddleware(forgotPasswordSchema), forgotPasswordController);
router.get("/reset-password-link/:userID/:token", resetPasswordLinkController);
router.post("/reset-password/:userID/:token", validateMiddleware(resetPasswordSchema), resetPasswordController);
router.post("/change-password", authMiddleware, validateMiddleware(changePasswordSchema), changePasswordController);

export default router;
