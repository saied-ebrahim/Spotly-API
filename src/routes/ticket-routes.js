import {Router} from "express";
import { generateQRCodeController, verifyTicketController, getTicketsByCheckoutController, getTicketsByOrderController, getTicketDetailsController } from "../controllers/ticket-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();

router.get("/generate/:ticketId", generateQRCodeController);
router.get("/verify/:ticketToken", verifyTicketController);
router.get("/checkout/:checkoutId", authMiddleware, getTicketsByCheckoutController);
router.get("/order/:orderId", authMiddleware, getTicketsByOrderController);
router.get("/:ticketId", getTicketDetailsController);

export default router;
