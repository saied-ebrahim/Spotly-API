import jwt from "jsonwebtoken";

export default function generateToken(user) {
  return {
    accessToken: jwt.sign({ id: user._id, email: user.email, name: `${user.firstName} ${user.lastName}`, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "1d" }),
    refreshToken: jwt.sign({ id: user._id, email: user.email, name: `${user.firstName} ${user.lastName}`, role: user.role }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES || "7d" }),
  };
}

/**
 * Generate JWT token for ticket verification
 * @param {Object} ticketData - Ticket data to encode
 * @param {string} ticketData.ticketId - Ticket ID
 * @param {string} ticketData.eventId - Event ID
 * @param {string} ticketData.userId - User ID
 * @returns {string} JWT token
 */
export function generateTicketToken({ ticketId, eventId, userId }) {
  const ticketSecret = process.env.TICKET_JWT_SECRET ;
  const ticketExpires = "1y" ; // Default 1 year expiration
  
  return jwt.sign(
    {
      ticketId,
      eventId,
      userId,
      type: "ticket",
    },
    ticketSecret,
    { expiresIn: ticketExpires }
  );
}