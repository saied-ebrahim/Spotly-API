import express from "express";
import { createTag, getAllTags, getTagById, updateTag, deleteTag } from "../controllers/tag-controller.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { createTagValidation, updateTagValidation } from "../validations/tag-validation.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: List of all tags
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
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 */
router.get("/", getAllTags);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Tag details
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
 *                     tag:
 *                       type: object
 *       404:
 *         description: Tag not found
 */
router.get("/:id", getTagById);

/**
 * @swagger
 * /api/v1/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Music"
 *     responses:
 *       201:
 *         description: Tag successfully created
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
 *                     tag:
 *                       type: object
 *       400:
 *         description: Validation error or tag already exists
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, validateMiddleware(createTagValidation), createTag);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   patch:
 *     summary: Update a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Music Festival"
 *     responses:
 *       200:
 *         description: Tag successfully updated
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
 *                     tag:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 */
router.patch("/:id", authMiddleware, validateMiddleware(updateTagValidation), updateTag);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Tag successfully deleted
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
 *                   example: "Tag deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 */
router.delete("/:id", authMiddleware, deleteTag);

export default router;
