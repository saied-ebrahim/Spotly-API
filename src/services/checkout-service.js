import Stripe from "stripe";
import mongoose from "mongoose";
import QRCode from "qrcode";
import AppError from "../utils/AppError.js";
import { sendEmail } from "../utils/emailSender.js";
import { uploadQRToR2WithSignedUrl } from "../utils/uploadQRToR2.js";
import { generateTicketToken } from "../utils/generateToken.js";
import userModel from "../models/user-model.js";
import eventModel from "../models/event-model.js";
import orderModel from "../models/order-model.js";
import attendeeModel from "../models/attendee-model.js";
import checkoutModel from "../models/checkout-model.js";
import analyticsModel from "../models/analytics-model.js";

// ? Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

// ! Checkout Service
export const checkoutService = async (userID, eventID, quantity, discount = 0) => {
  // Validation
  if (!userID) throw new AppError("User ID is required", 400);
  if (!eventID) throw new AppError("Event ID is required", 400);
  

  const eventAnalytics = await analyticsModel.findOne({ eventID });
  if (!eventAnalytics) throw new AppError("Event analytics not found", 404);

  const event = await eventModel.findById(eventID);
  if (!event) throw new AppError("Event not found", 404);

  if (eventAnalytics.ticketsAvailable < quantity) {
    throw new AppError("Not enough tickets available", 400);
  }

  let discountPerTicket;
  let totalAfterDiscount;
  let pricePerTicket;

  if (discount !== 0) {
    if (discount >= 100) throw new AppError("Not appropriate discount", 400);
    discountPerTicket = (event.ticketType.price * discount) / 100;
    totalAfterDiscount = (event.ticketType.price - discountPerTicket) * quantity;
    pricePerTicket = event.ticketType.price - discountPerTicket;
  } else {
    totalAfterDiscount = event.ticketType.price * quantity;
    pricePerTicket = event.ticketType.price;
  }

  const order = await orderModel.create({ userID, eventID, ticketTypeID: event.ticketType.ticketID, quantity, discount, totalAfterDiscount, paymentStatus: "pending" });
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
          },
        },
        quantity: quantity,
      },
    ],
    client_reference_id: String(order._id),
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

    success_url: process.env.FRONTEND_URL + "/receipt?invoice_id=" + order._id,
    cancel_url: process.env.FRONTEND_URL || "https://spotly-clinet.vercel.app",
  });

  return session.url;
};

// ! Webhook Service
export const webhookService = async (req, res) => {
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
  const data = event.data.object;
  const eventType = event.type;

  if (eventType === "checkout.session.completed") {
    await processCheckoutSession(data, req);
  }

  res.status(200).send().end();
};

// ! Process Checkout Session (with tickets and QR codes)
const processCheckoutSession = async (stripeSession, req) => {
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const session_db = await mongoose.startSession();
    session_db.startTransaction();

    try {
      const user = await userModel.findById(stripeSession.metadata.userId).session(session_db);
      const event = await eventModel.findOne({ _id: stripeSession.metadata.eventId }).session(session_db);
      const order = await orderModel.findOne({ _id: stripeSession.metadata.orderId }).session(session_db);
      const eventAnalytics = await analyticsModel.findOne({ eventID: stripeSession.metadata.eventId }).session(session_db);

      if (!user || !event || !order || !eventAnalytics) {
        throw new AppError("Required data not found to checkout", 404);
      }

      // ? Check if order is already processed 
      if (order.paymentStatus === "paid") {
        await session_db.abortTransaction();
        return;
      }

      const quantity = +stripeSession.metadata.quantity;

      if (!stripeSession.payment_intent) {
        throw new AppError("Checkout session missing payment_intent", 400);
      }


      // ? Retrieve payment method details from Stripe Payment Intent
      let paymentMethodData = {
        method: "card",
        brand: "unknown",
        last4: "0000",
        expMonth: 12,
        expYear: new Date().getFullYear() + 1,
      };

      if (stripeSession.payment_intent) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(stripeSession.payment_intent);
          if (paymentIntent.payment_method) {
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
            if (paymentMethod.card) {
              paymentMethodData = {
                method: "card",
                brand: paymentMethod.card.brand || "unknown",
                last4: paymentMethod.card.last4 || "0000",
                expMonth: paymentMethod.card.exp_month || 12,
                expYear: paymentMethod.card.exp_year || new Date().getFullYear() + 1,
              };
            }
          }
        } catch (err) {
          console.warn("--- Could not retrieve payment method details:", err.message);
        }
      }

      // ? Create Checkout Document
      const checkout = await checkoutModel.create(
        [
          {
            orderID: stripeSession.metadata.orderId,
            user: {
              userID: stripeSession.metadata.userId,
              name: stripeSession.customer_details.name,
              email: stripeSession.customer_details.email,
              phone: stripeSession.customer_details.phone,
              address: {
                country: stripeSession.customer_details.address.country,
                city: stripeSession.customer_details.address.city,
                line1: stripeSession.customer_details.address.line1,
                line2: stripeSession.customer_details.address.line2,
                state: stripeSession.customer_details.address.state,
                postalCode: stripeSession.customer_details.address.postal_code,
              },
            },
            ticketIDS: [], 
            totalAmount: stripeSession.amount_total / 100,
            currency: stripeSession.currency,
            provider: "stripe",
            paymentMethod: paymentMethodData,
            status: "paid",
            transactionId: stripeSession.payment_intent,
            paidAt: Date.now(),
            metadata: {
              eventId: stripeSession.metadata.eventId,
              ticketTypeId: stripeSession.metadata.ticketTypeId,
              quantity: quantity,
            },
            userAgent: req.headers.user_agent,
          },
        ],
        { session: session_db }
      );

      if (!checkout || checkout.length === 0) {
        throw new AppError("--- Failed to create checkout", 500);
      }

      const checkoutDoc = checkout[0];

      // ? Update Order Document
      order.paymentStatus = "paid";
      await order.save({ session: session_db });

      // ? Create tickets with QR codes
      const tickets = [];
      const ticketIds = [];
      
      // ? Generate QR codes and create tickets
      const ticketPromises = [];
      for (let i = 0; i < quantity; i++) {
        const ticketId = new mongoose.Types.ObjectId();
        const ticketToken = generateTicketToken({
          ticketId: String(ticketId),
          eventId: String(stripeSession.metadata.eventId),
          userId: String(stripeSession.metadata.userId),
        });
        const qrData = ticketToken;

        ticketPromises.push(
          QRCode.toBuffer(qrData)
            .then((qrBuffer) => uploadQRToR2WithSignedUrl(qrBuffer, String(ticketId)))
            .then((qrCodeUrl) => ({
              _id: ticketId,
              userId: String(stripeSession.metadata.userId),
              eventId: String(stripeSession.metadata.eventId),
              checkoutId: String(checkoutDoc._id),
              qrCode: qrCodeUrl,
            }))
        );
      }

      const ticketDataArray = await Promise.all(ticketPromises);
      const createdTickets = await attendeeModel.insertMany(ticketDataArray, { session: session_db });

      createdTickets.forEach((ticket) => {
        tickets.push(ticket);
        ticketIds.push(String(ticket._id));
      });

      // ? Update checkout with ticket IDs
      checkoutDoc.ticketIDS = ticketIds;
      await checkoutDoc.save({ session: session_db });

      // ? Update event analytics atomically
      eventAnalytics.ticketsSold = (eventAnalytics.ticketsSold || 0) + quantity;
      eventAnalytics.ticketsAvailable = (eventAnalytics.ticketsAvailable || 0) - quantity;
      eventAnalytics.revenue = (eventAnalytics.revenue || 0) + (stripeSession.amount_total / 100);
      eventAnalytics.netIncomeAdmin += (event.ticketType.price * quantity) * (15 / 100);
      eventAnalytics.netIncomeOrganizer += (event.ticketType.price * quantity) - (event.ticketType.price * quantity) * (15 / 100);
      await eventAnalytics.save({ session: session_db });

      // ? Commit transaction
      await session_db.commitTransaction();


      // ? Send email notification asynchronously (don't block response)
      sendOrderConfirmationEmail(stripeSession.customer_details.email || user.email, checkoutDoc, tickets, event).catch((err) => {
        console.error("Failed to send confirmation email:", err);
      });

      console.log(`Successfully processed payment for order ${order._id} with ${quantity} tickets`);
      return; 
    } catch (error) {
      await session_db.abortTransaction();
      
      if (error.code === 112 && retries < MAX_RETRIES) { // 112 is WriteConflict
        retries++;
        console.warn(`WriteConflict detected. Retrying transaction attempt ${retries}/${MAX_RETRIES}...`);
        await new Promise(resolve => setTimeout(resolve, 100 * retries)); 
        continue;
      }
      console.error("!!!!!!! Transaction failed with error:", error);
      throw error;
    } finally {
      session_db.endSession();
    }
  }
};

// ! Send Order Confirmation Email
const sendOrderConfirmationEmail = async (userEmail, checkout, tickets, event) => {
  try {
    const ticketsList = tickets.map((ticket, index) => `<li>Ticket ${index + 1}: ${ticket._id}</li>`).join("");

    const emailHTML = `
      <h2>Order Confirmation</h2>
      <p>Thank you for your purchase!</p>
      <h3>Order Details:</h3>
      <ul>
        <li><strong>Order ID:</strong> ${checkout._id}</li>
        <li><strong>Event:</strong> ${event.title}</li>
        <li><strong>Total Amount:</strong> ${checkout.totalAmount} ${checkout.currency.toUpperCase()}</li>
        <li><strong>Number of Tickets:</strong> ${tickets.length}</li>
      </ul>
      <h3>Your Tickets:</h3>
      <ul>${ticketsList}</ul>
      <p>You can view and download your tickets from your account.</p>
    `;

    await sendEmail(userEmail, `Order Confirmation - ${event.title}`, emailHTML);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    throw error;
  }
};

// ! Cancel Order Service
export const cancelOrderService = async (sessionID) => {
  if (!sessionID) throw new AppError("Session ID is required", 400);

  const session = await stripe.checkout.sessions.retrieve(sessionID);
  if (!session) throw new AppError("Session not found", 404);

  const order = await orderModel.findOne({ _id: session.metadata.orderId });
  if (!order) throw new AppError("Order not found", 404);

  //! Check if order is already cancelled or paid
  if (order.paymentStatus === "cancelled") {
    console.log(`Order ${order._id} is already cancelled`);
    return; //! Order already cancelled, no need to update again
  }

  if (order.paymentStatus === "paid") {
    throw new AppError("Cannot cancel an order that is already paid", 400);
  }

  order.paymentStatus = "cancelled";
  await order.save();
  console.log(`Order ${order._id} has been cancelled`);
};

