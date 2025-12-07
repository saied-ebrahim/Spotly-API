import Stripe from "stripe";
import AppError from "../utils/AppError.js";
import userModel from "../models/user-model.js";
import eventModel from "../models/event-model.js";
import orderModel from "../models/order-model.js";
import attendeeModel from "../models/attendee-model.js";
import checkoutModel from "../models/checkout-model.js";

// ? Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

// ! Checkout Service
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

  const order = await orderModel.create({ userID, eventID, ticketTypeID: event.ticketType.ticketID, quantity, discount, totalAfterDiscount, paymentStatus: "pending" });
  if (!order) throw new AppError("Failed to fulfill order", 500);

  const customer = await stripe.customers.create({
    metadata: {
      userId: String(userID),
      order: JSON.stringify({ ticketTypeId: event.ticketType.ticketID, quantity }),
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer: customer.id,
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: pricePerTicket * 100,
          product_data: {
            name: event.ticketType.title,
          },
        },
        quantity: quantity,
      },
    ],
    client_reference_id: String(order._id),
    //// customer_creation: "always",
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
    cancel_url: `http://localhost:5000/api/v1/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
  });

  return session.url;
};

// ! Webhook Service
const webhookService = async (req, res) => {
  let event = req.body;

  // ? Verify Webhook
  if (endpointSecret) {
    const signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
      console.log("Successfully verified webhook");
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      throw new AppError("Webhook signature verification failed", 400);
    }
  }

  // ? Handle the event
  let data = event.data.object;
  let eventType = event.type;
  if (eventType == "checkout.session.completed") {
    const customer = await stripe.customers.retrieve(data.customer);
    const user = await userModel.findById(customer.metadata.userId);
    const targetEvent = await eventModel.findOne({ _id: data.metadata.eventId });
    const order = await orderModel.findOne({ _id: data.metadata.orderId });
    if (!customer || !user || !targetEvent || !order) throw new AppError("Required data not found to checkout", 404);

    // ? Create Checkout Document
    const checkout = await checkoutModel.create({
      orderID: data.metadata.orderId,
      user: {
        userID: data.metadata.userId,
        name: data.customer_details.name,
        email: data.customer_details.email,
        phone: data.customer_details.phone,
        address: {
          country: data.customer_details.address.country,
          city: data.customer_details.address.city,
          line1: data.customer_details.address.line1,
          line2: data.customer_details.address.line2,
          state: data.customer_details.address.state,
          postalCode: data.customer_details.address.postal_code,
        },
      },
      totalAmount: data.amount_total / 100,
      currency: data.currency,
      provider: "stripe",
      paymentMethod: "card",
      status: "paid",
      transactionId: data.payment_intent,
      paidAt: Date.now(),
      metadata: {
        eventId: data.metadata.eventId,
        ticketTypeId: data.metadata.ticketTypeId,
        quantity: +data.metadata.quantity,
      },
      userAgent: req.headers.user_agent,
    });
    if (!checkout) throw new AppError("Failed to create checkout", 500);

    // ? Update Order Document
    order.paymentStatus = "paid";
    await order.save();

    // ? Create Attendee Document
    const attendee = await attendeeModel.create({
      userId: String(data.metadata.userId),
      eventId: String(data.metadata.eventId),
      checkoutId: String(checkout._id),
    });
    if (!attendee) throw new AppError("Failed to create attendee for this event", 500);

    // ? Update Event Analytics
    targetEvent.analytics.ticketsSold = +targetEvent.analytics.ticketsSold + +data.metadata.quantity;
    targetEvent.analytics.ticketsAvailable = +targetEvent.analytics.ticketsAvailable - +data.metadata.quantity;
    targetEvent.analytics.totalRevenue += +data.amount_total / 100;
    await targetEvent.save();
  }

  res.send().end();
};

// ! Cancel Order Service
const cancelOrderService = async (sessionID) => {
  const session = await stripe.checkout.sessions.retrieve(sessionID);
  if (!session) throw new AppError("Session not found", 404);

  const order = await orderModel.findOne({ _id: session.metadata.orderId });
  if (!order) throw new AppError("Order not found", 404);

  order.paymentStatus = "cancelled";
  await order.save();
};

export { checkoutService, webhookService, cancelOrderService };
