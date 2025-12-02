import AppError from "../utils/AppError.js";

//
import eventModel from "../models/event-model.js";
import organizerModel from "../models/organizer-model.js";

export const createEvent = async (eventData, userId) => {
  if (!userId || !eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location || !eventData.media || !eventData.tags || !eventData.category) {
    throw new AppError("Missing required fields", 400);
  }

  const event = await eventModel.create({ ...eventData, organizer: userId });
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
.populate("organizer").populate("category").sort({ [sort]: sortOrder })
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
  // const event = await eventModel.findById(eventId);
  if (!event) throw new AppError("Event not found", 404);
  return event;
};

export const updateEvent = async (eventId, updateData) => {
  const { organizer, ...restUpdateData } = updateData;
  const event = await eventModel.findByIdAndUpdate(eventId, restUpdateData, { new: true, runValidators: true }).populate("organizer").populate("category").populate("tags");
  // const event = await eventModel.findByIdAndUpdate(eventId, restUpdateData, { new: true, runValidators: true });
  if (!event) throw new AppError("Event not found", 404);

  return event;
};

export const deleteEvent = async (eventId) => {
  const event = await eventModel.findByIdAndDelete(eventId);
  if (!event) throw new AppError("Event not found", 404);
  await organizerModel.findOneAndDelete({ eventID: eventId });
  return event;
};
