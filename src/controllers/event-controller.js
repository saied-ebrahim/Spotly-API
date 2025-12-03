// controllers/event-controller.js
import expressAsyncHandler from "express-async-handler";
import * as eventService from "../services/event-service.js";
import verifyToken from "../utils/verifyRefreshToken.js";

/**
 * @desc   Create new event
 * @route  POST /api/v1/events
 * @access Protected
 */
export const createEvent = expressAsyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = verifyToken(token, process.env.JWT_SECRET);
  console.log(decoded.id);
  const event = await eventService.createEvent(req.body, decoded.id);
  res.status(201).json({ status: "success", data: { event } });
});

/**
 * @desc   Get all events with pagination and filtering
 * @route  GET /api/v1/events
 * @access Public
 * @query  page, limit, search, category, tag, sort, order
 */
export const getAllEvents = expressAsyncHandler(async (req, res, next) => {
  const { page, limit, search, category, tag, sort, order } = req.query;
  console.log(category);
  const result = await eventService.getAllEvents({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    search: search || "",
    category: category || "",
    tag: tag || "",
    sort: sort || "createdAt",
    order: order || "asc",
  });

  res.status(200).json({
    status: "success",
    results: result.events.length,
    pagination: result.pagination,
    data: { events: result.events },
  });
});

/**
 * @desc   Get event by ID
 * @route  GET /api/v1/events/:id
 * @access Public
 */
export const getEventById = expressAsyncHandler(async (req, res, next) => {
  const event = await eventService.getEventById(req.params.id);
  res.status(200).json({ status: "success", data: { event } });
});

/**
 * @desc   Update event
 * @route  PATCH /api/v1/events/:id
 * @access Protected
 */
export const updateEvent = expressAsyncHandler(async (req, res, next) => {
  const event = await eventService.updateEvent(req.params.id, req.body);
  res.status(200).json({ status: "success", data: { event } });
});

/**
 * @desc   Delete event
 * @route  DELETE /api/v1/events/:id
 * @access Protected
 */
export const deleteEvent = expressAsyncHandler(async (req, res, next) => {
  await eventService.deleteEvent(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
