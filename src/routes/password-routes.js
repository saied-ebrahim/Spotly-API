import express from "express";

import { forgotPasswordController, resetPasswordLinkController, resetPasswordController } from "../controllers/password-controller.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import { forgotPasswordSchema, resetPasswordSchema } from "../validations/password-validation.js";

const router = express.Router();

router.post("/forgot-password", validateMiddleware(forgotPasswordSchema), forgotPasswordController);
router.get("/reset-password-link/:userID/:token", resetPasswordLinkController);
router.post("/reset-password/:userID/:token", validateMiddleware(resetPasswordSchema), resetPasswordController);

export default router;
