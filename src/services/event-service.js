import AppError from "../utils/AppError.js";
import eventModel from "../models/event-model.js";
import organizerModel from "../models/organizer-model.js";

export const createEvent = async (eventData, userId) => {
  if (!userId || !eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.type || !eventData.media || !eventData.tags || !eventData.category || !eventData.ticketType.price || !eventData.ticketType.quantity) {
    throw new AppError("Missing required fields", 400);
  }

  const event = await eventModel.create({ ...eventData, analytics: { ticketsAvailable: eventData.ticketType.quantity }, organizer: userId, ticketType: { title: `${eventData.title}-ticket`, price: eventData.ticketType.price, quantity: eventData.ticketType.quantity, image: "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg" } });
  if (!event) throw new AppError("Event not created", 500);

  const organizer = await organizerModel.create({ userID: userId, eventID: event._id });
  if (!organizer) throw new AppError("Organizer is not created", 500);

  return event;
};

export const getAllEvents = async ({ page = 1, limit = 10, search = "", category = "", tag = "", sort = "createdAt", order = "desc" } = {}) => {
  const skip = (page - 1) * limit;
  const sortOrder = order === "asc" ? 1 : -1;

  const query = {};
  if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
  if (category) query.category = category;
  if (tag) query.tags = tag;

  const events = await eventModel
    .find(query)
    .populate("category", "name")
    .populate("tags", "name")
    .populate("organizer", "firstName lastName")
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await eventModel.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return {
    pagination: {
      currentPage: page,
      totalPages,
      totalEvents: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit,
    },
    events,
  };
};

export const getEventById = async (eventId) => {
  const event = await eventModel.findById(eventId).populate("organizer").populate("category").populate("tags");
  if (!event) throw new AppError("Event not found", 404);
  return event;
};

export const updateEvent = async (eventId, updateData) => {
  const { organizer, ...restUpdateData } = updateData;
  const event = await eventModel.findByIdAndUpdate(eventId, restUpdateData, { new: true, runValidators: true }).populate("organizer").populate("category").populate("tags");
  if (!event) throw new AppError("Event not found", 404);

  if (restUpdateData.ticketType) {
    event.analytics.ticketsAvailable = restUpdateData.ticketType.quantity;
    await event.save();
  }
  return event;
};

export const deleteEvent = async (eventId) => {
  const event = await eventModel.findByIdAndDelete(eventId);
  if (!event) throw new AppError("Event not found", 404);
  await organizerModel.findOneAndDelete({ eventID: eventId });
  return event;
};
