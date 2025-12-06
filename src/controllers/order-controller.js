import expressAsyncHandler from "express-async-handler";
import * as orderService from "../services/order-service.js";

// @desc Get all orders only for admin
// @route GET /api/v1/orders
// @access Private
export const getAllOrders = expressAsyncHandler(async (req, res) => {
  const { search } = req.query;
  const orders = await orderService.getAllOrders({ search: search || "" });
  res.status(200).json({ status: "success", data: { orders } });
});

// @desc Get order by for user by userID
// @route GET /api/v1/orders/:id
// @access Private
export const getOrderById = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { search } = req.query;
  const order = await orderService.getOrdersById(id, { search: search || "" });
  res.status(200).json({ status: "success", data: { order } });
});

// @desc Get orders for organizer
// @route GET /api/v1/organizer/events/events/:eventID/orders/orders
// @access Private
export const getOrdersForOrganizer = expressAsyncHandler(async (req, res) => {
  const userID = req.user.id;
  const { search } = req.query;
  const orders = await orderService.getOrdersForOrganizer(userID, { search: search || "" });
  res.status(200).json({ status: "success", orders });
});
