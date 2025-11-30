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

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events
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
 *                     events:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get("/", getAllEvents);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Event details
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
 *                     event:
 *                       type: object
 *       404:
 *         description: Event not found
 */
router.get("/:id", getEventById);

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - time
 *               - location
 *               - media
 *               - tags
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Summer Music Festival"
 *               description:
 *                 type: string
 *                 example: "A great music festival with amazing artists"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-15"
 *               time:
 *                 type: string
 *                 example: "18:00"
 *               location:
 *                 type: object
 *                 required:
 *                   - country
 *                   - city
 *                   - address
 *                   - latitude
 *                   - longitude
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "Egypt"
 *                   city:
 *                     type: string
 *                     example: "Cairo"
 *                   address:
 *                     type: string
 *                     example: "123 Main Street"
 *                   latitude:
 *                     type: number
 *                     example: 30.0444
 *                   longitude:
 *                     type: number
 *                     example: 31.2357
 *               media:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - mediaType
 *                     - mediaUrl
 *                   properties:
 *                     mediaType:
 *                       type: string
 *                       enum: [image, video]
 *                       example: "image"
 *                     mediaUrl:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *               analytics:
 *                 type: object
 *                 properties:
 *                   ticketsAvailable:
 *                     type: integer
 *                     minimum: 0
 *                     example: 1000
 *                   ticketsSold:
 *                     type: integer
 *                     minimum: 0
 *                     example: 0
 *                   totalRevenue:
 *                     type: number
 *                     minimum: 0
 *                     example: 0
 *                   waitingListCount:
 *                     type: integer
 *                     minimum: 0
 *                     example: 0
 *                   likes:
 *                     type: integer
 *                     minimum: 0
 *                     example: 0
 *                   dislikes:
 *                     type: integer
 *                     minimum: 0
 *                     example: 0
 *               tags:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011"]
 *               category:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011"]
 *               organizer:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Event successfully created
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
 *                     event:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, validateMiddleware(createEventValidation), createEvent);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   patch:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Summer Music Festival"
 *               description:
 *                 type: string
 *                 example: "A great music festival with amazing artists"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-15"
 *               time:
 *                 type: string
 *                 example: "18:00"
 *               location:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "Egypt"
 *                   city:
 *                     type: string
 *                     example: "Cairo"
 *                   address:
 *                     type: string
 *                     example: "123 Main Street"
 *                   latitude:
 *                     type: number
 *                     example: 30.0444
 *                   longitude:
 *                     type: number
 *                     example: 31.2357
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - mediaType
 *                     - mediaUrl
 *                   properties:
 *                     mediaType:
 *                       type: string
 *                       enum: [image, video]
 *                       example: "image"
 *                     mediaUrl:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *               analytics:
 *                 type: object
 *                 properties:
 *                   ticketsAvailable:
 *                     type: integer
 *                     minimum: 0
 *                   ticketsSold:
 *                     type: integer
 *                     minimum: 0
 *                   totalRevenue:
 *                     type: number
 *                     minimum: 0
 *                   waitingListCount:
 *                     type: integer
 *                     minimum: 0
 *                   likes:
 *                     type: integer
 *                     minimum: 0
 *                   dislikes:
 *                     type: integer
 *                     minimum: 0
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Event successfully updated
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
 *                     event:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only event organizer can update
 *       404:
 *         description: Event not found
 */
router.patch("/:id", authMiddleware, authorizeEventOrganizer, validateMiddleware(updateEventValidation), updateEvent);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Event successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Event deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only event organizer can delete
 *       404:
 *         description: Event not found
 */
router.delete("/:id", authMiddleware, authorizeEventOrganizer, deleteEvent);

export default router;
