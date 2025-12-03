import Stripe from "stripe";
import AppError from "../utils/AppError.js";
import eventModel from "../models/event-model.js";
import orderModel from "../models/order-model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const checkoutService = async (userID, eventID, quantity, discount = 0) => {
  const event = await eventModel.findById(eventID);
  if (!event) throw new AppError("Event not found", 404);
  if (event.ticketType.quantity < quantity) throw new AppError("Not enough tickets available", 400);

  let discounrPerTicket;
  let totalAfterDiscount;
  let pricePerTicket;

  if (discount !== 0) {
    if (discount >= 100) throw new AppError("Not appropriate discount", 400);
    discounrPerTicket = (event.ticketType.price * discount) / 100;
    totalAfterDiscount = (event.ticketType.price - discounrPerTicket) * quantity;
    pricePerTicket = event.ticketType.price - discounrPerTicket;
  } else {
    totalAfterDiscount = event.ticketType.price * quantity;
    pricePerTicket = event.ticketType.price;
  }

  const order = await orderModel.create({ userID, ticketTypeID: event.ticketType.ticketID, quantity, discount, totalAfterDiscount });
  if (!order) throw new AppError("Failed to fulfill order", 500);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: pricePerTicket * 100,
          product_data: {
            name: event.ticketType.title,
            // metadata: {
            //   eventId: String(eventID),
            //   eventTitle: String(event.title),
            //   ticketTypeId: String(event.ticketType.ticketID),
            //   eventDate: String(event.date),
            //   eventTime: String(event.time),
            // },
          },
        },
        quantity: quantity,
      },
    ],
    client_reference_id: String(order._id),
    customer_creation: "always",
    metadata: {
      eventId: String(eventID),
      userId: String(userID),
      orderId: String(order._id),
      ticketTypeId: String(event.ticketType.ticketID),
      quantity: String(quantity),
    },
    phone_number_collection: { enabled: true },
    billing_address_collection: "required",
    shipping_address_collection: { allowed_countries: ["EG"] },
    expires_at: Math.floor(Date.now() / 1000) + 60 * 30,

    success_url: `http://localhost:5000/api/v1/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:5000/api/v1/checkout/cancel`,
  });

  return session.url;
};

const completeOrderService = async () => {};

// const cancelOrderService = async () => {};

export { checkoutService, completeOrderService };
