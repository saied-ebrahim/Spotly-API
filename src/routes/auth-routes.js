import {Router} from "express";

import { signUpController, loginController, refreshTokenController, logoutController, logoutAllController, getMeController, getAllUsersController, updateMeController } from "../controllers/auth-controller.js";
import { loginSchema, signUpSchema, refreshTokenSchema, logoutSchema, updateMeSchema } from "../validations/auth-validation.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import { authorizeAdmin } from "../middlewares/authorize-admin-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();

router.post("/signup", validateMiddleware(signUpSchema), signUpController);
router.post("/login", validateMiddleware(loginSchema), loginController);
router.post("/refreshToken", validateMiddleware(refreshTokenSchema), refreshTokenController);
router.post("/logout", validateMiddleware(logoutSchema), logoutController);
router.post("/logoutAll", logoutAllController);
router.get("/me", authMiddleware, getMeController);
router.get("/users", authMiddleware, authorizeAdmin, getAllUsersController);
router.post("/updateMe", authMiddleware, validateMiddleware(updateMeSchema), updateMeController);

export default router;
