import express from "express";

import { signUpController, loginController, refreshTokenController } from "../controllers/auth-controller.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import { loginSchema, signUpSchema } from "../validations/auth-validation.js";

const router = express.Router();

router.post("/signUp", validateMiddleware(signUpSchema), signUpController);
router.post("/login", validateMiddleware(loginSchema), loginController);
router.post("/refreshToken", refreshTokenController);

export default router;
