import orderModel from "../models/order-model.js";
import AppError from "../utils/AppError.js";

export const getAllOrders = async () => {
  const orders = await orderModel.find().populate("userID", "-password -refreshTokens -role -__v");
  return orders;
};
export const getOrdersById = async (userID) => {
  const orders = await orderModel.find({ userID }).populate("userID", "-password -refreshTokens -role -__v");
  if (!orders) {
    throw new AppError("Failed to get orderts", 500);
  }
  return orders;
};
