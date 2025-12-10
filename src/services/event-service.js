import AppError from "../utils/AppError.js";
import eventModel from "../models/event-model.js";
import organizerModel from "../models/organizer-model.js";

export const createEvent = async (eventData, userId) => {
  console.log(eventData.title);
  if (!userId || !eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.type || !eventData.media || !eventData.tags || !eventData.category || !eventData.ticketType.price || !eventData.ticketType.quantity) {
    throw new AppError("Missing required fields", 400);
  }

  const event = await eventModel.create({ ...eventData, analytics: { ticketsAvailable: eventData.ticketType.quantity }, organizer: userId, ticketType: { ticketID: `TICKET-${eventData.title.toLocaleUpperCase().replace(" ", "-")}-${Date.now()}`, title: `${eventData.title}-ticket`, price: eventData.ticketType.price, quantity: eventData.ticketType.quantity } });
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
  const event = await eventModel.findById(eventId);
  if (!event) throw new AppError("Event not found", 404);

  const { organizer, ...restUpdateData } = updateData;

  if (restUpdateData.ticketType) {
    event.ticketType = { ...event.ticketType.toObject(), ...restUpdateData.ticketType };
    if (restUpdateData.ticketType.quantity) {
      event.analytics = { ...event.analytics.toObject(), ticketsAvailable: restUpdateData.ticketType.quantity - event.analytics.ticketsSold };
    }
    delete restUpdateData.ticketType;
    await event.save();
  }

  if (restUpdateData.title) {
    console.log("B: Title", event.title);
    event.title = restUpdateData.title;
    console.log("A: Title", event.title);
    event.ticketType = { ...event.ticketType.toObject(), title: `${restUpdateData.title}-ticket`, ticketID: `TICKET-${restUpdateData.title.toLocaleUpperCase().replace(" ", "-")}-${Date.now()}` };
    delete restUpdateData.title;
    await event.save();
  }

  if (restUpdateData.type) {
    if (restUpdateData.type === "online") {
      event.type = restUpdateData.type;
      event.location = undefined;
    } else {
      if (!restUpdateData.location) throw new AppError("Location is required for offline events", 400);
      if (!restUpdateData.location.city || !restUpdateData.location.address || !restUpdateData.location.district) throw new AppError("Missing required location data", 400);
      event.type = restUpdateData.type;
      event.location = restUpdateData.location;
      delete restUpdateData.location;
    }
    await event.save();
  }

  if (restUpdateData.location) {
    if (event.type === "online") {
      throw new AppError("Location data is not allowed for online events", 400);
    } else {
      event.location = { ...event.location.toObject(), ...restUpdateData.location };
      delete restUpdateData.location;
    }
    await event.save();
  }

  if (restUpdateData.media) {
    event.media = { ...event.media.toObject(), ...restUpdateData.media };
    delete restUpdateData.media;
    await event.save();
  }

  console.log(restUpdateData);
  await event.updateOne({ $set: restUpdateData });
  return event;
};

export const deleteEvent = async (eventId) => {
  const event = await eventModel.findByIdAndDelete(eventId);
  if (!event) throw new AppError("Event not found", 404);
  await organizerModel.findOneAndDelete({ eventID: eventId });
  return event;
};
