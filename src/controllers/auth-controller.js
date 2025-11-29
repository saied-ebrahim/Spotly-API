import { signUpService, loginService, refreshTokenService, logoutService, logoutAllService } from "../services/auth-service.js";

const signUpController = signUpService;
const loginController = loginService;
const refreshTokenController = refreshTokenService;
const logoutController = logoutService;
const logoutAllController = logoutAllService;

export { signUpController, loginController, refreshTokenController, logoutController, logoutAllController };
