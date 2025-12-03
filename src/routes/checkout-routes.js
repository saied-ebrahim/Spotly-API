import express from "express";
import { checkoutController, completeOrderController, cancelOrderController } from "../controllers/checkout-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/", authMiddleware, checkoutController);
router.get("/complete", authMiddleware, completeOrderController);
router.get("/cancel", cancelOrderController);

export default router;
