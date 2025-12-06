import { Router } from "express";
import { getAllOrders, getOrderById, getOrdersForOrganizer } from "../controllers/order-controller.js";
import { authorizeAdmin } from "../middlewares/authorize-admin-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();
router.route("/").get(authMiddleware, getOrdersForOrganizer).get(authMiddleware, authorizeAdmin, getAllOrders);
router.get("/:id", authMiddleware, getOrderById);

export default router;
