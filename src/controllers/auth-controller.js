import { signUpService, loginService } from "../services/auth-service.js";

const signUpController = signUpService;
const loginController = loginService;

export { signUpController, loginController };
