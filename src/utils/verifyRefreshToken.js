import jwt from "jsonwebtoken";
import AppError from "./AppError.js";

const verifyToken = (token, secret) => {
  if (!token) {
    throw new AppError("No token found", 401);
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
};

/**
 * Verify ticket JWT token
 * @param {string} token - Ticket JWT token
 * @returns {Object} Decoded ticket data (ticketId, eventId, userId)
 */
export function verifyTicketToken(token) {
  if (!token) {
    throw new AppError("No ticket token found", 401);
  }

  const ticketSecret = process.env.TICKET_JWT_SECRET || process.env.JWT_SECRET;
  
  try {
    const decoded = jwt.verify(token, ticketSecret);
    
    // Verify that this is a ticket token
    if (decoded.type !== "ticket") {
      throw new AppError("Invalid ticket token type", 401);
    }
    
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Ticket token has expired", 401);
    }
    if (error.name === "JsonWebTokenError") {
      throw new AppError("Invalid ticket token", 401);
    }
    throw error;
  }
}

export default verifyToken;
