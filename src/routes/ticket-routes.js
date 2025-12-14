import { Router } from "express";
import { generateQRCodeController, verifyTicketController, getTicketsByCheckoutController, getTicketsByOrderController, getTicketDetailsController, getAllTicketsController } from "../controllers/ticket-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();

router.get("/generate/:ticketId", authMiddleware, generateQRCodeController);
router.get("/verify/:ticketToken", authMiddleware, verifyTicketController);
router.get("/checkout/:checkoutId", authMiddleware, getTicketsByCheckoutController);
router.get("/order/:orderId", authMiddleware, getTicketsByOrderController);
router.get("/orders", authMiddleware, getAllTicketsController);
router.get("/:ticketId", getTicketDetailsController);

export default router;
