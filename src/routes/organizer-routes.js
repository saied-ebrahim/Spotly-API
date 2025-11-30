import express from "express";
import {
  getAllOrganizers,
  getOrganizerById,
  getOrganizersByUserId,
  getOrganizersByEventId,
} from "../controllers/organizer-controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllOrganizers);
router.get("/user/:userId", getOrganizersByUserId);
router.get("/event/:eventId", getOrganizersByEventId);
router.get("/:id", getOrganizerById);

export default router;

