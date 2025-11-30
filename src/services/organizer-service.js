import Organizer from "../models/organizer-model.js";
import AppError from "../utils/AppError.js";

/**
 * Get all organizers
 * @returns {Promise<Array>} Array of organizers
 */
export const getAllOrganizers = async () => {
  const organizers = await Organizer.find()
    .populate("userID", "-password -refreshTokens")
    .populate("eventID");
  return organizers;
};

/**
 * Get single organizer by ID
 * @param {string} organizerId - Organizer ID
 * @returns {Promise<Object>} Organizer data
 */
export const getOrganizerById = async (organizerId) => {
  const organizer = await Organizer.findById(organizerId)
    .populate("userID", "-password -refreshTokens")
    .populate("eventID");

  if (!organizer) {
    throw new AppError("Organizer not found", 404);
  }

  return organizer;
};

/**
 * Get organizers by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of organizers for the user
 */
export const getOrganizersByUserId = async (userId) => {
  const organizers = await Organizer.find({ userID: userId })
    .populate("userID", "-password -refreshTokens")
    .populate("eventID");
  return organizers;
};

/**
 * Get organizers by event ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Array>} Array of organizers for the event
 */
export const getOrganizersByEventId = async (eventId) => {
  const organizers = await Organizer.find({ eventID: eventId })
    .populate("userID", "-password -refreshTokens")
    .populate("eventID");
  return organizers;
};

