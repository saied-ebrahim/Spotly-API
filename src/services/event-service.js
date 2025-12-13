import AppError from "../utils/AppError.js";
import eventModel from "../models/event-model.js";
import organizerModel from "../models/organizer-model.js";
import analyticsModel from "../models/analytics-model.js";

export const createEvent = async (eventData, userId) => {
  if (!userId || !eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.type || !eventData.media || !eventData.tags || !eventData.category || !eventData.ticketType.quantity) {
    throw new AppError("Missing required fields", 400);
  }

  const event = await eventModel.create({ ...eventData, organizer: userId, ticketType: { ticketID: `TICKET-${eventData.title.toLocaleUpperCase().replace(" ", "-")}-${Date.now()}`, title: `${eventData.title}-ticket`, price: eventData.ticketType.price, quantity: eventData.ticketType.quantity } });
  if (!event) throw new AppError("Event not created", 500);

  const analytics = await analyticsModel.create({ eventID: event._id, organizerID: userId, ticketsAvailable: eventData.ticketType.quantity });
  if (!analytics) throw new AppError("Analytics is not created", 500);

  event.analytics = analytics._id;
  await event.save();

  const organizer = await organizerModel.create({ userID: userId, eventID: event._id });
  if (!organizer) throw new AppError("Organizer is not created", 500);

  return event;
};

export const getAllEvents = async ({ page = 1, limit = 10, search = "", category = "", tag = "", type = "", sort = "createdAt", order = "desc" } = {}) => {
  const skip = (page - 1) * limit;
  const sortOrder = order === "asc" ? 1 : -1;

  const result = await eventModel.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $lookup: {
        from: "tags",
        localField: "tags",
        foreignField: "_id",
        as: "tag",
      },
    },
    { $unwind: "$category" },
    { $unwind: "$tag" },
  ]);

  let arrayIDS = [];

  if (search) {
    result.forEach((doc) => {
      if (doc.title.toLowerCase().includes(search.toLowerCase()) || doc.description.toLowerCase().includes(search.toLowerCase())) {
        arrayIDS.push(doc._id);
      }
    });
  }

  if (category) {
    result.forEach((doc) => {
      if (doc.category.name.toLowerCase() === category.toLowerCase()) {
        arrayIDS.push(doc._id);
      }
    });
  }

  if (tag) {
    result.forEach((doc) => {
      if (doc.tag.name.toLowerCase() === tag.toLowerCase()) {
        arrayIDS.push(doc._id);
      }
    });
  }

  if (type) {
    result.forEach((doc) => {
      if (doc.type.toLowerCase() === type.toLowerCase()) {
        arrayIDS.push(doc._id);
      }
    });
  }

  let query = search || category || tag || type ? { _id: { $in: arrayIDS } } : {};

  const events = await eventModel
    .find(query)
    .populate("category", "name")
    .populate("tags", "name")
    .populate("organizer", "firstName lastName").populate("analytics", "ticketsAvailable ticketsSold likes")
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
  const event = await eventModel.findById(eventId).populate("category", "name")
    .populate("tags", "name")
    .populate("organizer", "firstName lastName").populate("analytics", "ticketsAvailable ticketsSold likes");
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
      const analytics = await analyticsModel.findOne({ eventID: eventId });
      analytics.ticketsAvailable = restUpdateData.ticketType.quantity;
      await analytics.save();
    }
    delete restUpdateData.ticketType;
    await event.save();
  }

  if (restUpdateData.title) {
    event.title = restUpdateData.title;
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

  await event.updateOne({ $set: restUpdateData });
  return event;
};

export const deleteEvent = async (eventId) => {
  const event = await eventModel.findByIdAndDelete(eventId);
  if (!event) throw new AppError("Event not found", 404);
  await organizerModel.findOneAndDelete({ eventID: eventId });
  return event;
};
