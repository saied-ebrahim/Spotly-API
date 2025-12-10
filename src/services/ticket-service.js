import QRCode from "qrcode";
import AppError from "../utils/AppError.js";
import attendeeModel from "../models/attendee-model.js";
import checkoutModel from "../models/checkout-model.js";
import orderModel from "../models/order-model.js";
import { verifyTicketToken } from "../utils/verifyRefreshToken.js";
import { generateTicketToken } from "../utils/generateToken.js";
import { uploadQRToR2WithSignedUrl } from "../utils/uploadQRToR2.js";

/**
 * Generate or retrieve QR Code for a ticket
 * @param {string} ticketId - Ticket ID
 * @param {object} user - User object (optional, for authorization)
 * @returns {Promise<object>} Ticket with QR code
 */
export const generateQRCodeService = async (ticketId, user = null) => {
  // التحقق من وجود التذكرة
  const ticket = await attendeeModel
    .findById(ticketId)
    .populate("eventId", "title date time")
    .populate("userId", "firstName lastName email");

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  // Authorization: Only ticket owner or admin can generate/retrieve QR code (if user is provided)
  if (user) {
    const userId = user._id.toString();
    const isAdmin = user.role === "admin";
    const ticketUserId = ticket.userId?._id?.toString() || ticket.userId?.toString();

    if (!isAdmin && ticketUserId !== userId) {
      throw new AppError("You are not authorized to access this ticket", 403);
    }
  }

  // إذا كان QR Code موجود بالفعل، نرجعه
  if (ticket.qrCode) {
    return {
      success: true,
      ticketId: ticket._id,
      qrImage: ticket.qrCode,
      ticket: {
        event: ticket.eventId,
        user: ticket.userId,
        isVerified: ticket.isVerified,
      },
    };
  }

  // توليد QR Code جديد باستخدام JWT token (متوافق مع checkout-service)
  // const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  // Generate JWT token for ticket verification
  const ticketEventId = ticket.eventId?._id || ticket.eventId;
  const ticketUserId = ticket.userId?._id || ticket.userId;

  const ticketToken = generateTicketToken({
    ticketId: String(ticket._id),
    eventId: String(ticketEventId),
    userId: String(ticketUserId),
  });

  // const qrData = `${frontendUrl}/ticket/verify/${ticketToken}`;
  const qrData = ticketToken;

  const qrBuffer = await QRCode.toBuffer(qrData);

  // Upload QR code to R2 (consistent with checkout-service)
  const qrCodeUrl = await uploadQRToR2WithSignedUrl(qrBuffer, String(ticket._id));

  // حفظ QR Code URL في التذكرة
  ticket.qrCode = qrCodeUrl;
  await ticket.save();

  return {
    success: true,
    ticketId: ticket._id,
    qrImage: qrCodeUrl,
    ticket: {
      event: ticket.eventId,
      user: ticket.userId,
      isVerified: ticket.isVerified,
    },
  };
};

/**
 * Verify ticket by QR Code (JWT token)
 * @param {string} ticketToken - JWT token containing ticketId, eventId, and userId
 * @returns {Promise<object>} Verification result
 */
export const verifyTicketService = async (ticketToken) => {
  // Verify and decode JWT token
  let decodedToken;
  try {
    decodedToken = verifyTicketToken(ticketToken);
  } catch (error) {
    throw new AppError(error.message || "Invalid ticket token", 401);
  }

  const { ticketId, eventId, userId } = decodedToken;

  // Find ticket using ticketId from decoded token
  const ticket = await attendeeModel
    .findById(ticketId)
    .populate("eventId", "title date time location")
    .populate("userId", "firstName lastName email phone")
    .populate("checkoutId", "status totalAmount");

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  // Verify token data matches ticket data (additional security check)
  const ticketEventId = ticket.eventId?._id || ticket.eventId;
  const ticketUserId = ticket.userId?._id || ticket.userId;

  if (String(ticketEventId) !== eventId || String(ticketUserId) !== userId) {
    throw new AppError("Ticket token data mismatch", 401);
  }

  // التحقق من حالة الدفع
  if (ticket.checkoutId && ticket.checkoutId.status !== "paid") {
    throw new AppError("Ticket payment not completed", 400);
  }

  // التحقق من استخدام التذكرة مسبقاً
  if (ticket.isVerified) {
    return {
      success: true,
      message: "Ticket already verified",
      ticket: {
        id: ticket._id,
        event: ticket.eventId,
        user: ticket.userId,
        isVerified: true,
        verifiedAt: ticket.verifiedAt,
      },
      alreadyUsed: true,
    };
  }

  // تحديث حالة التذكرة كـ verified
  ticket.isVerified = true;
  ticket.verifiedAt = new Date();
  await ticket.save();

  return {
    success: true,
    message: "Ticket verified successfully",
    ticket: {
      id: ticket._id,
      event: ticket.eventId,
      user: ticket.userId,
      checkout: ticket.checkoutId,
      isVerified: true,
      verifiedAt: ticket.verifiedAt,
    },
    alreadyUsed: false,
  };
};

/**
 * Get all tickets for a specific checkout
 * @param {string} checkoutId - Checkout ID
 * @param {string} userId - User ID for authorization
 * @param {boolean} isAdmin - Whether user is admin
 * @returns {Promise<object>} Tickets data
 */
export const getTicketsByCheckoutService = async (checkoutId, userId, isAdmin) => {
  // التحقق من وجود checkout
  const checkout = await checkoutModel.findById(checkoutId);
  if (!checkout) {
    throw new AppError("Checkout not found", 404);
  }

  // Authorization: Only checkout owner or admin can access tickets
  const checkoutUserId = checkout.user?.userID?.toString() || checkout.user?.userID;
  if (!isAdmin && checkoutUserId !== userId) {
    throw new AppError("You are not authorized to access these tickets", 403);
  }

  // Get all tickets for this checkout
  const tickets = await attendeeModel
    .find({ checkoutId })
    .populate("eventId", "title description date time location media")
    .populate("userId", "firstName lastName email phone")
    .populate("checkoutId", "status totalAmount currency paidAt")
    .sort({ createdAt: 1 });

  return {
    success: true,
    count: tickets.length,
    data: {
      checkout: {
        id: checkout._id,
        orderID: checkout.orderID,
        totalAmount: checkout.totalAmount,
        currency: checkout.currency,
        status: checkout.status,
        paidAt: checkout.paidAt,
      },
      tickets: tickets.map((ticket) => ({
        id: ticket._id,
        event: ticket.eventId,
        user: ticket.userId,
        checkout: ticket.checkoutId,
        qrCode: ticket.qrCode,
        isVerified: ticket.isVerified,
        verifiedAt: ticket.verifiedAt,
        createdAt: ticket.createdAt,
      })),
    },
  };
};

/**
 * Get all tickets for a specific order
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID for authorization
 * @param {boolean} isAdmin - Whether user is admin
 * @returns {Promise<object>} Tickets data
 */
export const getTicketsByOrderService = async (orderId, userId, isAdmin) => {
  // التحقق من وجود order
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Authorization: Only order owner or admin can access tickets
  const orderUserId = order.userID?.toString();
  if (!isAdmin && orderUserId !== userId) {
    throw new AppError("You are not authorized to access these tickets", 403);
  }

  // Find checkout for this order
  const checkout = await checkoutModel.findOne({ orderID: orderId });
  if (!checkout) {
    return {
      success: true,
      count: 0,
      message: "No checkout found for this order",
      data: {
        order: {
          id: order._id,
          eventID: order.eventID,
          quantity: order.quantity,
          totalAfterDiscount: order.totalAfterDiscount,
          paymentStatus: order.paymentStatus,
        },
        tickets: [],
      },
    };
  }

  // Get all tickets for this checkout
  const tickets = await attendeeModel
    .find({ checkoutId: checkout._id })
    .populate("eventId", "title description date time location media")
    .populate("userId", "firstName lastName email phone")
    .populate("checkoutId", "status totalAmount currency paidAt")
    .sort({ createdAt: 1 });

  return {
    success: true,
    count: tickets.length,
    data: {
      order: {
        id: order._id,
        eventID: order.eventID,
        quantity: order.quantity,
        totalAfterDiscount: order.totalAfterDiscount,
        paymentStatus: order.paymentStatus,
      },
      checkout: {
        id: checkout._id,
        totalAmount: checkout.totalAmount,
        currency: checkout.currency,
        status: checkout.status,
        paidAt: checkout.paidAt,
      },
      tickets: tickets.map((ticket) => ({
        id: ticket._id,
        event: ticket.eventId,
        user: ticket.userId,
        checkout: ticket.checkoutId,
        qrCode: ticket.qrCode,
        isVerified: ticket.isVerified,
        verifiedAt: ticket.verifiedAt,
        createdAt: ticket.createdAt,
      })),
    },
  };
};

/**
 * Get ticket details
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<object>} Ticket data
 */
export const getTicketDetailsService = async (ticketId) => {
  const ticket = await attendeeModel
    .findById(ticketId)
    .populate("eventId", "title description date time location media")
    .populate("userId", "firstName lastName email phone")
    .populate("checkoutId", "status totalAmount currency paidAt");

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  return {
    success: true,
    data: {
      ticket: {
        id: ticket._id,
        event: ticket.eventId,
        user: ticket.userId,
        checkout: ticket.checkoutId,
        isVerified: ticket.isVerified,
        verifiedAt: ticket.verifiedAt,
        qrCode: ticket.qrCode,
        createdAt: ticket.createdAt,
      },
    },
  };
};

