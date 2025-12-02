import Stripe from "stripe";
import expressAsyncHandler from "express-async-handler";
import { checkoutService, createOrderService, cancelOrderService } from "../services/checkout-service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc Create Checkout Session
 * @route POST /api/v1/checkout/checkout
 * @access Public
 */
const checkoutController = expressAsyncHandler(async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Iphone 15",
          },
          unit_amount: 30 * 100,
        },
        quantity: 4,
      },
    ],
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["EG"],
    },
    success_url: `http://localhost:5000/api/v1/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:5000/api/v1/checkout/cancel`,
  });
  res.redirect(session.url);
});

/**
 * @desc Complete Order
 * @route GET /api/v1/checkout/complete
 * @access Public
 */
const completeOrderController = expressAsyncHandler(async (req, res) => {
  // const [session, lineItems] = await Promise.all([stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ["payment_intent.payment_method"] }), stripe.checkout.sessions.listLineItems(req.query.session_id)]);
  //   console.log(JSON.stringify(session));
  // console.log(JSON.stringify(lineItems));
  // res.send("Completed");
});

/**
 * @desc Cancel Order
 * @route GET /api/v1/checkout/cancel
 * @access Public
 */
const canceleOrderController = expressAsyncHandler(async (req, res) => {
  res.redirect("/api/v1/page");
});

export { checkoutController, completeOrderController, canceleOrderController };
