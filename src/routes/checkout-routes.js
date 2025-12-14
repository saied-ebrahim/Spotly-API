import {Router} from "express";
import { checkoutController, completeOrderController, cancelOrderController, webhookController } from "../controllers/checkout-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();

router.post("/", authMiddleware, checkoutController);
router.post("/webhook", webhookController);
router.get("/complete", completeOrderController);
router.get("/cancel/:orderID/:eventID", cancelOrderController);

export default router;
