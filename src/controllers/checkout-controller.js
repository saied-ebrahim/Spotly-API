import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import { checkoutService, completeOrderService } from "../services/checkout-service.js";

/**
 * @desc Create Checkout Session
 * @route POST /api/v1/checkout/checkout
 * @access Public
 */
const checkoutController = expressAsyncHandler(async (req, res, next) => {
  const { eventID, quantity, discount } = req.body;
  if (!eventID || !quantity) return next(new AppError("Event ID and quantity are required", 400));
  const url = await checkoutService(req.user._id, eventID, quantity, discount);
  res.status(201).json({ message: "Checkout session created", url });
});

/**
 * @desc Complete Order
 * @route GET /api/v1/checkout/complete
 * @access Public
 */
const completeOrderController = expressAsyncHandler(async (req, res) => {
  // const userId = String(req.user._id);
  const userId = "69319033c8b44d312de0a6d9";
  await completeOrderService(userId, req.headers.user_agent, req.query.session_id);
  res.redirect("https://spotly-clinet.vercel.app/");
});

/**
 * @desc Cancel Order
 * @route GET /api/v1/checkout/cancel
 * @access Public
 */
const cancelOrderController = expressAsyncHandler(async (req, res) => {
  res.redirect("https://spotly-clinet.vercel.app/");
});

export { checkoutController, completeOrderController, cancelOrderController };
