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
import { createEventValidation } from "../validations/event-validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected routes (require authentication)
router.post("/", authMiddleware, validateMiddleware(createEventValidation), createEvent);
router.patch("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);

export default router;
