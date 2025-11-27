import express from "express";

import { signUpController, loginController } from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/signUp", signUpController);
router.post("/login", loginController);

export default router;
