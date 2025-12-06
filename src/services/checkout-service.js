import Stripe from "stripe";
import AppError from "../utils/AppError.js";
import userModel from "../models/user-model.js";
import eventModel from "../models/event-model.js";
import orderModel from "../models/order-model.js";
import attendeeModel from "../models/attendee-model.js";
import checkoutModel from "../models/checkout-model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const checkoutService = async (userID, eventID, quantity, discount = 0) => {
  const event = await eventModel.findById(eventID);
  if (!event) throw new AppError("Event not found", 404);
  if (event.analytics.ticketsAvailable < quantity) throw new AppError("Not enough tickets available", 400);

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

  const order = await orderModel.create({ userID, eventID, ticketTypeID: event.ticketType.ticketID, quantity, discount, totalAfterDiscount });
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

const completeOrderService = async (userId, userAgent, sessionID) => {
  const [session, lineItems] = await Promise.all([stripe.checkout.sessions.retrieve(sessionID, { expand: ["payment_intent.payment_method"] }), stripe.checkout.sessions.listLineItems(sessionID)]);

  const user = await userModel.findById(userId);
  if (!user) throw new AppError("User not found, Please login first", 404);

  const event = await eventModel.findById(session.metadata.eventId);
  if (!event) throw new AppError("Event not found", 404);

  console.log(session.metadata.quantity);

  const checkout = await checkoutModel.create({
    orderID: session.metadata.orderId,
    user: {
      userID: session.metadata.userId,
      name: session.customer_details.name,
      email: session.customer_details.email,
      phone: session.customer_details.phone,
      address: {
        country: session.customer_details.address.country,
        city: session.customer_details.address.city,
        line1: session.customer_details.address.line1,
        line2: session.customer_details.address.line2,
        state: session.customer_details.address.state,
        postalCode: session.customer_details.address.postal_code,
      },
    },
    // ticketIDS: session.metadata.ticketTypeId,
    totalAmount: session.amount_total / 100,
    currency: session.currency,
    provider: "stripe",
    paymentMethod: "card",
    status: "paid",
    transactionId: session.payment_intent.id,
    paidAt: Date.now(),
    metadata: {
      eventId: session.metadata.eventId,
      ticketTypeId: session.metadata.ticketTypeId,
      quantity: +session.metadata.quantity,
    },
    userAgent: userAgent,
    fingerprint: session.payment_intent.payment_method.card.fingerprint,
  });
  if (!checkout) throw new AppError("Failed to create checkout", 500);

  const attendee = await attendeeModel.create({
    userId: String(session.metadata.userId),
    eventId: String(session.metadata.eventId),
    checkoutId: String(checkout._id),
  });
  if (!attendee) throw new AppError("Failed to create attendee for this event", 500);

  event.analytics.ticketsSold = +event.analytics.ticketsSold + +session.metadata.quantity;
  event.analytics.ticketsAvailable = +event.analytics.ticketsAvailable - +session.metadata.quantity;
  event.analytics.totalRevenue += +session.amount_total / 100;
  await event.save();
};

export { checkoutService, completeOrderService };
