import express from "express";

import { signUpController, loginController, refreshTokenController, logoutController, logoutAllController, getMeController, getAllUsersController } from "../controllers/auth-controller.js";
import { loginSchema, signUpSchema, refreshTokenSchema, logoutSchema } from "../validations/auth-validation.js";
import validateMiddleware from "../middlewares/validation-middleware.js";
import { authorizeAdmin } from "../middlewares/authorize-admin-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - gender
 *               - address
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "john"
 *               lastName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "doe"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: "male"
 *               address:
 *                 type: object
 *                 required:
 *                   - city
 *                   - country
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: "cairo"
 *                   country:
 *                     type: string
 *                     example: "egypt"
 *                   state:
 *                     type: string
 *                     example: "cairo"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 15
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User successfully registered
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
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       400:
 *         description: Validation error or user already exists
 */
router.post("/signup", validateMiddleware(signUpSchema), signUpController);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceID
 *               - email
 *               - password
 *             properties:
 *               deviceID:
 *                 type: string
 *                 example: "device-12345"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 15
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User successfully logged in
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
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validateMiddleware(loginSchema), loginController);

/**
 * @swagger
 * /api/v1/auth/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceID
 *             properties:
 *               deviceID:
 *                 type: string
 *                 example: "device-12345"
 *     responses:
 *       200:
 *         description: Token successfully refreshed
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
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refreshToken", validateMiddleware(refreshTokenSchema), refreshTokenController);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user from current device
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceID
 *             properties:
 *               deviceID:
 *                 type: string
 *                 example: "device-12345"
 *     responses:
 *       200:
 *         description: User successfully logged out
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", validateMiddleware(logoutSchema), logoutController);

/**
 * @swagger
 * /api/v1/auth/logoutAll:
 *   post:
 *     summary: Logout user from all devices
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User successfully logged out from all devices
 *       401:
 *         description: Unauthorized
 */
router.post("/logoutAll", logoutAllController);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
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
 *                     user:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, getMeController);

/**
 * @swagger
 * /api/v1/auth/profile/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: User profile
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
 *                     user:
 *                       type: object
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
// router.get("/profile/:id", authMiddleware, getUserProfileController);

/**
 * @swagger
 * /api/v1/auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
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
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/users", authMiddleware, authorizeAdmin, getAllUsersController);

export default router;
