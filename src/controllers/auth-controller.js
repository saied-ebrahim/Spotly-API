import { signUpService, loginService, refreshTokenService } from "../services/auth-service.js";

const signUpController = signUpService;
const loginController = loginService;
const refreshTokenController = refreshTokenService;

export { signUpController, loginController, refreshTokenController };
