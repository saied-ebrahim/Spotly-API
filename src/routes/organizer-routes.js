import {Router} from "express";
import eventsRoutes from "../routes/events-routes.js";
import { getAllOrganizers, getOrganizersByUserId, getOrganizersByEventId } from "../controllers/organizer-controller.js";

const router = Router();

router.get("/", getAllOrganizers);
router.use("/events", eventsRoutes);
router.get("/user/:userId", getOrganizersByUserId);
router.get("/event/:eventId", getOrganizersByEventId);

export default router;
