import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import Organizer from "../models/organizer-model.js";

export const authorizeEventOrganizer = expressAsyncHandler(async (req, res, next) => {
  // Allow admin to bypass organizer check - admin has full access
  if (req.user && req.user.role === "admin") {
    return next();
  }

  const eventId = req.params.id;

  if (!eventId) {
    throw new AppError("Event ID is required", 400);
  }

  const organizer = await Organizer.findOne({
    eventID: eventId,
    userID: req.user._id,
  });

  if (!organizer) {
    throw new AppError("You are not authorized to perform this action. Only the event organizer can update/delete this event.", 403);
  }

  next();
});
