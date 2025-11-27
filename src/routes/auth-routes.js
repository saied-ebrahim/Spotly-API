import express from "express";

import { signUpController, loginController, refreshTokenController } from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/signUp", signUpController);
router.post("/login", loginController);
router.post("/refreshToken", refreshTokenController);

export default router;
