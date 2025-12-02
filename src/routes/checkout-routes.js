import express from "express";
import { checkoutController, completeOrderController, canceleOrderController } from "../controllers/checkout-controller.js";

const router = express.Router();

router.post("/", checkoutController);
router.get("/complete", completeOrderController);
router.get("/cancel", canceleOrderController);

export default router;
