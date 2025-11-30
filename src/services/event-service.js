import mongoose from "mongoose";
import Event from "../models/event-model.js";
import Organizer from "../models/organizer-model.js";
import AppError from "../utils/AppError.js";

/**
 * Create new event and link it to the current user
 * @param {Object} eventData - Event data
 * @param {Object} user - Current authenticated user
 * @returns {Promise<Object>} Created event
 */
export const createEvent = async (eventData, user) => {
  // Remove organizer from eventData if provided (we'll set it automatically)
  const { organizer, ...restEventData } = eventData;

  // Create event first (we'll need its ID for organizer)
  // But organizer is required in the model, so we need a different approach
  // Let's create a temporary organizer first, then create event, then update organizer
  
  // Actually, better approach: create event with a temporary organizer ID
  // Or: make organizer optional temporarily, create event, create organizer, update event
    
  // Create organizer entry first (we'll update eventID after creating event)
  const tempEventId = new mongoose.Types.ObjectId();
  const tempOrganizer = await Organizer.create({
    userID: user._id,
    eventID: tempEventId, // Temporary, will be updated
  });

  // Create event with organizer ID
  const event = await Event.create({
    ...restEventData,
    organizer: tempOrganizer._id,
  });

  // Update organizer with actual event ID
  tempOrganizer.eventID = event._id;
  await tempOrganizer.save();

  // Populate and return
  await event.populate("organizer");
  await event.populate("category");
  await event.populate("tags");
  return event;
};

/**
 * Get all events
 * @returns {Promise<Array>} Array of events
 */
export const getAllEvents = async () => {
  const events = await Event.find().populate("organizer").populate("category").populate("tags");
  return events;
};

/**
 * Get single event by ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Event data
 */
export const getEventById = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate("organizer")
    .populate("category")
    .populate("tags");

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return event;
};

/**
 * Update event by ID
 * @param {string} eventId - Event ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = async (eventId, updateData) => {
  const event = await Event.findByIdAndUpdate(eventId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("organizer")
    .populate("category")
    .populate("tags");

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return event;
};

/**
 * Delete event by ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Deleted event
 */
export const deleteEvent = async (eventId) => {
  const event = await Event.findByIdAndDelete(eventId);

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  // Also delete associated organizer
  await Organizer.findOneAndDelete({ eventID: eventId });

  return event;
};


