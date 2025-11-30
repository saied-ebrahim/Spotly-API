import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event-controller.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { authorizeEventOrganizer } from "../middlewares/authorize-event-middleware.js";
import { createEventValidation, updateEventValidation } from "../validations/event-validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected routes (require authentication)
router.post("/", authMiddleware, validateMiddleware(createEventValidation), createEvent);
router.patch("/:id", authMiddleware, authorizeEventOrganizer, validateMiddleware(updateEventValidation), updateEvent);
router.delete("/:id", authMiddleware, authorizeEventOrganizer, deleteEvent);

export default router;
