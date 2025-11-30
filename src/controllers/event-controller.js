// controllers/event-controller.js
import expressAsyncHandler from "express-async-handler";
import * as eventService from "../services/event-service.js";

/**
 * @desc   Create new event
 * @route  POST /api/v1/events
 * @access Protected
 */
export const createEvent = expressAsyncHandler(async (req, res, next) => {
  const event = await eventService.createEvent(req.body, req.user);
  res.status(201).json({ status: "success", data: { event } });
});

/**
 * @desc   Get all events
 * @route  GET /api/v1/events
 * @access Public
 */
export const getAllEvents = expressAsyncHandler(async (req, res, next) => {
  const events = await eventService.getAllEvents();
  res.status(200).json({ status: "success", results: events.length, data: { events } });
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