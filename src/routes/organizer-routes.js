import express from "express";
import {
  getAllOrganizers,
  getOrganizerById,
  getOrganizersByUserId,
  getOrganizersByEventId,
} from "../controllers/organizer-controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/organizers:
 *   get:
 *     summary: Get all organizers
 *     tags: [Organizers]
 *     responses:
 *       200:
 *         description: List of all organizers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizers:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get("/", getAllOrganizers);

/**
 * @swagger
 * /api/v1/organizers/user/{userId}:
 *   get:
 *     summary: Get organizers by user ID
 *     tags: [Organizers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: List of organizers for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizers:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: User not found
 */
router.get("/user/:userId", getOrganizersByUserId);

/**
 * @swagger
 * /api/v1/organizers/event/{eventId}:
 *   get:
 *     summary: Get organizers by event ID
 *     tags: [Organizers]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: List of organizers for the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizers:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Event not found
 */
router.get("/event/:eventId", getOrganizersByEventId);

/**
 * @swagger
 * /api/v1/organizers/{id}:
 *   get:
 *     summary: Get organizer by ID
 *     tags: [Organizers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organizer ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Organizer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizer:
 *                       type: object
 *       404:
 *         description: Organizer not found
 */
router.get("/:id", getOrganizerById);

export default router;

