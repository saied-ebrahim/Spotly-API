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
  const order = await orderService.getOrdersById(id);
  res.status(200).json({ status: "success", data: { order } });
});

// @desc Get orders for organizer
// @route GET /api/v1/organizer/events/events/:eventID/orders/orders
// @access Private
export const getOrdersForOrganizer = expressAsyncHandler(async (req, res) => {
  const userID = req.user.id;
  const orders = await orderService.getOrdersForOrganizer(userID);
  res.status(200).json({ status: "success", orders });
});
