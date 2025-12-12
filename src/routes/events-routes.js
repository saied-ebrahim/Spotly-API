import express from "express";
import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } from "../controllers/event-controller.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { authorizeEventOrganizer } from "../middlewares/authorize-event-middleware.js";
import { createEventValidation, updateEventValidation } from "../validations/event-validation.js";
import ordersRoutes from "../routes/orders-routes.js";
import analyticsRoutes from "../routes/analytics-routes.js";

const router = express.Router();
router.use("/orders", ordersRoutes);
router.use("/analytics", analyticsRoutes);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", authMiddleware, validateMiddleware(createEventValidation), createEvent);
router.patch("/:id", authMiddleware, authorizeEventOrganizer, validateMiddleware(updateEventValidation), updateEvent);
router.delete("/:id", authMiddleware, authorizeEventOrganizer, deleteEvent);

export default router;
