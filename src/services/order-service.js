import orderModel from "../models/order-model.js";
import AppError from "../utils/AppError.js";

export const getAllOrders = async () => {
  const orders = await orderModel.find().populate("userID", "-password -refreshTokens -role -__v");
  return orders;
};
export const getOrderById = async (id) => {
  const order = await orderModel.findById(id).populate("userID", "-password -refreshTokens -role -__v");
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  return order;
};
