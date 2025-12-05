import { Router } from "express";
import { getAllOrders, getOrderById } from "../controllers/order-controller.js";
import { authorizeAdmin } from "../middlewares/authorize-admin-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();

router.route("/").get(authMiddleware, authorizeAdmin, getAllOrders);
router.route("/:id").get(authMiddleware, authorizeAdmin, getOrderById);

export default router;
