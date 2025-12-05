import expressAsyncHandler from "express-async-handler";
import * as orderService from "../services/order-service.js";

export const getAllOrders = expressAsyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.status(200).json({ status: "success", data: { orders } });
});

export const getOrderById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id);
  res.status(200).json({ status: "success", data: { order } });
});
