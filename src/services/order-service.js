import orderModel from "../models/order-model.js";
import userModel from "../models/user-model.js";
import eventModel from "../models/event-model.js";
import AppError from "../utils/AppError.js";

export const getAllOrders = async () => {
  const orders = await orderModel.find().populate("userID", "-password -refreshTokens -role -__v");
  if (!orders) throw new AppError("Failed to get orders", 500);
  return orders;
};

export const getOrdersById = async (userID) => {
  const orders = await orderModel.find({ userID }).populate("userID", "-password -refreshTokens -role -__v");
  if (!orders) {
    throw new AppError("Failed to get orderts", 500);
  }
  return orders;
};

export const getOrdersForOrganizer = async (userID) => {
  const user = await userModel.findById(userID);
  if (!user) throw new AppError("User not found", 404);

  const events = await eventModel.find({ organizer: userID }).select("ticketType");

  const ticketTypes = events.map((event) => event.ticketType.ticketID);

  const orders = await orderModel
    .find({ ticketTypeID: { $in: ticketTypes } })
    .populate("userID", "-password -refreshTokens -role -__v")
    .populate("eventID", "-__v");

  return orders;
};
