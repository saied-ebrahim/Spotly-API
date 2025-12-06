import orderModel from "../models/order-model.js";
import userModel from "../models/user-model.js";
import eventModel from "../models/event-model.js";
import AppError from "../utils/AppError.js";

export const getAllOrders = async ({ search = "" }) => {
  let orderIDs = [];

  if (search) {
    const result = await orderModel.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "eventID",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $match: {
          $or: [{ "event.title": { $regex: search, $options: "i" } }],
        },
      },
      { $project: { _id: 1 } },
    ]);

    orderIDs = result.map((r) => r._id);
  }

  const orders = await orderModel
    .find({ _id: { $in: orderIDs } })
    .populate("userID", "-password -refreshTokens -role -__v")
    .populate("eventID", "title description date time location");

  return orders;
};

export const getOrdersById = async (userID) => {
  const orders = await orderModel.find({ userID }).populate("userID", "-password -refreshTokens -role -__v").populate("eventID");
  if (!orders) {
    throw new AppError("Failed to get orders", 500);
  }
  return orders;
};

export const getOrdersForOrganizer = async (userID, { search = "" }) => {
  const user = await userModel.findById(userID);
  if (!user) throw new AppError("User not found", 404);

  const events = await eventModel.find({ organizer: userID }).select("ticketType title description");
  const ticketTypes = events.map((event) => event.ticketType.ticketID);

  if (!search) {
    return await orderModel
      .find({ ticketTypeID: { $in: ticketTypes } })
      .populate("userID", "-password -refreshTokens -role -__v")
      .populate("eventID");
  }

  const matchedEvents = events.filter((event) => event.title.toLowerCase().includes(search.toLowerCase()));

  const matchedEventIDs = matchedEvents.map((event) => event._id.toString());

  const orders = await orderModel
    .find({ ticketTypeID: { $in: ticketTypes }, eventID: { $in: matchedEventIDs } })
    .populate("userID", "-password -refreshTokens -role -__v")
    .populate("eventID");

  return orders;
};
