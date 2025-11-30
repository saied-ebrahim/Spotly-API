import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import Organizer from "../models/organizer-model.js";

/**
 * Authorization middleware - Verifies that the current user is the organizer of the event
 * Must be used after authMiddleware
 */
export const authorizeEventOrganizer = expressAsyncHandler(async (req, res, next) => {
  const eventId = req.params.id;

  if (!eventId) {
    throw new AppError("Event ID is required", 400);
  }

  // Check if user is the organizer of this event
  const organizer = await Organizer.findOne({
    eventID: eventId,
    userID: req.user._id,
  });

  if (!organizer) {
    throw new AppError("You are not authorized to perform this action. Only the event organizer can update/delete this event.", 403);
  }

  next();
});

