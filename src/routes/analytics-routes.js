import Router from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import { getEventNetIncome, getEventRevenue, getNetIncome, getRevenue, getTicketsSold, getTicketsAvailable, getEventTicketsSold, getEventTicketsAvailable } from "../controllers/analytics-controller.js";

const router = Router({ mergeParams: true });

router.get("/revenue", authMiddleware, getRevenue);
router.get("/:id/revenue", authMiddleware, getEventRevenue);
router.get("/net-income", authMiddleware, getNetIncome);
router.get("/:id/net-income", authMiddleware, getEventNetIncome);
router.get("/tickets-sold", authMiddleware, getTicketsSold);
router.get("/:id/tickets-sold", authMiddleware, getEventTicketsSold);
router.get("/tickets-available", getTicketsAvailable);
router.get("/:id/tickets-available", getEventTicketsAvailable);

export default router;
