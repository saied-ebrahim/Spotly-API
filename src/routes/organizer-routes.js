import express from "express";
import { getAllOrganizers, getOrganizersByUserId, getOrganizersByEventId } from "../controllers/organizer-controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/organizers:
 *   get:
 *     summary: Get all organizers
 *     description: Returns all organizer entries. Each entry represents one user organizing one event. A user can have multiple entries if they organize multiple events.
 *     tags: [Organizers]
 *     responses:
 *       200:
 *         description: List of all organizers (each entry = one user organizing one event)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 results:
 *                   type: number
 *                   example: 10
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
 *     summary: Get all events organized by a specific user
 *     description: Returns an array of all organizer entries for a user. Since a user can organize multiple events, this endpoint returns all events they are organizing.
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
 *         description: List of all events organized by the user (can be multiple events)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 results:
 *                   type: number
 *                   description: Number of events organized by this user
 *                   example: 3
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizers:
 *                       type: array
 *                       description: Array of organizer entries, each representing one event organized by this user
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userID:
 *                             type: object
 *                             description: User information
 *                           eventID:
 *                             type: object
 *                             description: Event information
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
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

export default router;
