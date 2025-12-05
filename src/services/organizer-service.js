import Organizer from "../models/organizer-model.js";
import AppError from "../utils/AppError.js";

export const getAllOrganizers = async () => {
  // const organizers = await Organizer.find().populate("userID", "-password -refreshTokens");
  const organizers = await Organizer.find();
  return organizers;
};

export const getOrganizersByUserId = async (userId) => {
  const organizers = await Organizer.find({ userID: userId })
    .populate("userID", "-password -refreshTokens")
    .populate("eventID")
    .populate({
      path: "eventID",
      populate: {
        path: "category",
      },
    });
  return organizers;
};

export const getOrganizersByEventId = async (eventId) => {
  const organizers = await Organizer.find({ eventID: eventId })
    .populate("userID", "-password -refreshTokens")
    .populate("eventID")
    .populate({
      path: "eventID",
      populate: {
        path: "category",
      },
    });
  return organizers;
};
