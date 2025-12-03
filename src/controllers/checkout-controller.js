import Stripe from "stripe";
import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import { checkoutService, completeOrderService } from "../services/checkout-service.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
  const [session, lineItems] = await Promise.all([stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ["payment_intent.payment_method"] }), stripe.checkout.sessions.listLineItems(req.query.session_id)]);
  console.log(JSON.stringify(session));
  console.log("----------------------");
  console.log("----------------------");
  console.log("----------------------");
  console.log("----------------------");
  console.log(JSON.stringify(lineItems));
  console.log("----------------------");
  console.log("----------------------");
  console.log("----------------------");
  console.log("----------------------");
  res.send("Completed");
});

/**
 * @desc Cancel Order
 * @route GET /api/v1/checkout/cancel
 * @access Public
 */
const canceleOrderController = expressAsyncHandler(async (req, res) => {
  res.redirect("/api/v1/page");
});

export { checkoutController, completeOrderController };
