import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import { checkoutService, webhookService, cancelOrderService } from "../services/checkout-service.js";

/**
 * @desc Create Checkout Session
 * @route POST /api/v1/checkout/checkout
 * @access Public
 */
const checkoutController = expressAsyncHandler(async (req, res, next) => {
  const { eventID, quantity, discount } = req.body;
  if (!eventID || !quantity) return next(new AppError("Event ID and quantity are required", 400));
  const url = await checkoutService(req.user.id, eventID, quantity, discount);
  res.status(201).json({ message: "Checkout session created", url });
});

/**
 * @desc Webhook
 * @route POST /api/v1/checkout/webhook
 * @access Public
 */
const webhookController = expressAsyncHandler(async (req, res) => {
  await webhookService(req, res);
  res.send();
});

/**
 * @desc Complete Order
 * @route GET /api/v1/checkout/complete
 * @access Public
 */
const completeOrderController = expressAsyncHandler(async (req, res) => {
  res.redirect("https://spotly-clinet.vercel.app/");
});

/**
 * @desc Cancel Order
 * @route GET /api/v1/checkout/cancel
 * @access Public
 */
const cancelOrderController = expressAsyncHandler(async (req, res) => {
  await cancelOrderService(req.query.session_id);
  res.redirect("https://spotly-clinet.vercel.app/");
});

export { checkoutController, completeOrderController, cancelOrderController, webhookController };
