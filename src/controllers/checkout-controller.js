import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import { checkoutService, webhookService, cancelOrderService } from "../services/checkout-service.js";

/**
 * @desc Create Checkout Session
 * @route POST /api/v1/checkout
 * @access Private (requires authentication)
 */
const checkoutController = expressAsyncHandler(async (req, res, next) => {
  const { eventID, quantity, discount } = req.body;

  // Validation
  if (!eventID) return next(new AppError("Event ID is required", 400));
  if (!quantity) return next(new AppError("Quantity is required", 400));
  if (typeof quantity !== "number" || quantity <= 0 || !Number.isInteger(quantity)) {
    return next(new AppError("Quantity must be a positive integer", 400));
  }
  if (discount !== undefined && discount !== null) {
    if (typeof discount !== "number" || discount < 0 || discount >= 100) {
      return next(new AppError("Discount must be a number between 0 and 100", 400));
    }
  }

  const url = await checkoutService(req.user.id, eventID, quantity, discount || 0);
  res.status(201).json({ message: "Checkout session created", url });
});

/**
 * @desc Stripe Webhook Handler
 * @route POST /api/v1/checkout/webhook
 * @access Public (called by Stripe)
 * @note webhookService handles the response, so we don't send another response here
 */
const webhookController = expressAsyncHandler(async (req, res) => {
  await webhookService(req, res);
  // webhookService already sends the response, so we don't need to send again
});

/**
 * @desc Complete Order - Success redirect after payment
 * @route GET /api/v1/checkout/complete
 * @access Public
 */
const completeOrderController = expressAsyncHandler(async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "https://spotly-clinet.vercel.app";
  res.redirect(`${frontendUrl}/`);
});

/**
 * @desc Cancel Order - Cancel redirect after payment cancellation
 * @route GET /api/v1/checkout/cancel
 * @access Public
 * @query order_id - Order ID
 */
const cancelOrderController = expressAsyncHandler(async (req, res, next) => {
  const { order_id } = req.query;
  if (!order_id) {
    return next(new AppError("Order ID is required", 400));
  }

  await cancelOrderService(order_id);
  const frontendUrl = process.env.FRONTEND_URL || "https://spotly-clinet.vercel.app";
  res.redirect(`${frontendUrl}/`);
});

export { checkoutController, completeOrderController, cancelOrderController, webhookController };
