import expressAsyncHandler from "express-async-handler";
import {
  generateQRCodeService,
  verifyTicketService,
  getTicketsByCheckoutService,
  getTicketsByOrderService,
  getTicketDetailsService,
  getAllTicketsService,
} from "../services/ticket-service.js";

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
export const generateQRCodeController = expressAsyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const user = req.user || null;

  const result = await generateQRCodeService(ticketId, user);
  res.json(result);
});

/**
 * @desc   Verify ticket by QR Code (JWT token)
 * @route  GET /api/v1/tickets/verify/:ticketToken
 * @access Public
 * @note   ticketToken is a JWT token containing ticketId, eventId, and userId
 */
export const verifyTicketController = expressAsyncHandler(async (req, res) => {
  const { ticketToken } = req.params;

  const result = await verifyTicketService(ticketToken);
  res.json(result);
});

/**
 * @desc   Get all tickets for a specific checkout
 * @route  GET /api/v1/tickets/checkout/:checkoutId
 * @access Protected (Checkout owner or Admin only)
 */
export const getTicketsByCheckoutController = expressAsyncHandler(async (req, res) => {
  const { checkoutId } = req.params;
  const userId = req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  const result = await getTicketsByCheckoutService(checkoutId, userId, isAdmin);
  res.json(result);
});

/**
 * @desc   Get all tickets for a specific order
 * @route  GET /api/v1/tickets/order/:orderId
 * @access Protected (Order owner or Admin only)
 */
export const getTicketsByOrderController = expressAsyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  const result = await getTicketsByOrderService(orderId, userId, isAdmin);
  res.json(result);
});

/**
 * @desc   Get ticket details
 * @route  GET /api/v1/tickets/:ticketId
 * @access Public
 */
export const getTicketDetailsController = expressAsyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const result = await getTicketDetailsService(ticketId);
  res.json(result);
});

/**
 * @desc   Get all orders with tickets for the authenticated user
 * @route  GET /api/v1/tickets/
 * @access Protected
 */
export const getAllTicketsController = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const result = await getAllTicketsService(userId);
  res.json(result);
});