import expressAsyncHandler from "express-async-handler";
import * as orderService from "../services/order-service.js";

// @desc Get all orders
// @route GET /api/v1/orders
// @access Private
export const getAllOrders = expressAsyncHandler(async (_, res) => {
  const orders = await orderService.getAllOrders();
  res.status(200).json({ status: "success", data: { orders } });
});

// @desc Get order by ID
// @route GET /api/v1/orders/:id
// @access Private
export const getOrderById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const order = await orderService.getOrdersById(id);
  res.status(200).json({ status: "success", data: { order } });
});
