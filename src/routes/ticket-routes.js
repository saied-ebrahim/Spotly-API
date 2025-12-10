import express from "express";
import { generateQRCodeController, verifyTicketController, getTicketsByCheckoutController, getTicketsByOrderController, getTicketDetailsController } from "../controllers/ticket-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = express.Router();

/**
 * @desc   Generate or retrieve QR Code for a ticket
 * @route  GET /api/v1/tickets/generate/:ticketId
 * @access Protected (Ticket owner or Admin only)
 * @note   This route is mainly used as a fallback/recovery mechanism:
 *         - If QR code was deleted from R2
 *         - If QR code generation failed during checkout
 *         - For old tickets created before QR code system
 *         - Normal flow: QR codes are auto-generated during checkout
 */
router.get("/generate/:ticketId", generateQRCodeController);

/**
 * @desc   Verify ticket by QR Code (JWT token)
 * @route  GET /api/v1/tickets/verify/:ticketToken
 * @access Public
 * @note   ticketToken is a JWT token containing ticketId, eventId, and userId
 */
router.get("/verify/:ticketToken", verifyTicketController);

/**
 * @desc   Get all tickets for a specific checkout
 * @route  GET /api/v1/tickets/checkout/:checkoutId
 * @access Protected (Checkout owner or Admin only)
 */
router.get("/checkout/:checkoutId", authMiddleware, getTicketsByCheckoutController);

/**
 * @desc   Get all tickets for a specific order
 * @route  GET /api/v1/tickets/order/:orderId
 * @access Protected (Order owner or Admin only)
 */
router.get("/order/:orderId", authMiddleware, getTicketsByOrderController);

/**
 * @desc   Get ticket details
 * @route  GET /api/v1/tickets/:ticketId
 * @access Public
 */
router.get("/:ticketId", getTicketDetailsController);

export default router;
