import orderModel from "../models/order-model.js";
import userModel from "../models/user-model.js";
import eventModel from "../models/event-model.js";
import AppError from "../utils/AppError.js";

export const getAllOrders = async ({ search = "" }) => {
  const query = {};
  if (search) query.$or = [{ "eventID.title": { $regex: search, $options: "i" } }];
  const orders = await orderModel.find(query).populate("userID", "-password -refreshTokens -role -__v").populate("eventID");
  if (!orders) throw new AppError("Failed to get orders", 500);
  return orders;
};

export const getOrdersById = async (userID, { search = "" }) => {
  const query = {};
  if (search) query.$or = [{ "eventID.title": { $regex: search, $options: "i" } }, { "eventID.description": { $regex: search, $options: "i" } }];
  const orders = await orderModel
    .find({ ...query, userID })
    .populate("userID", "-password -refreshTokens -role -__v")
    .populate("eventID");
  if (!orders) {
    throw new AppError("Failed to get orders", 500);
  }
  return orders;
};

export const getOrdersForOrganizer = async (userID, { search = "" }) => {
  const query = {};
  if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
  const user = await userModel.findById(userID);
  if (!user) throw new AppError("User not found", 404);

  const events = await eventModel.find({ organizer: userID }).select("ticketType");

  const ticketTypes = events.map((event) => event.ticketType.ticketID);

  const orders = await orderModel
    .find({ ...query, ticketTypeID: { $in: ticketTypes } })
    .populate("userID", "-password -refreshTokens -role -__v")
    .populate("eventID");

  return orders;
};
