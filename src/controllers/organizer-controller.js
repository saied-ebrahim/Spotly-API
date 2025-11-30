// controllers/organizer-controller.js
import expressAsyncHandler from "express-async-handler";
import * as organizerService from "../services/organizer-service.js";

/**
 * @desc   Get all organizers
 * @route  GET /api/v1/organizers
 * @access Public
 */
export const getAllOrganizers = expressAsyncHandler(async (req, res, next) => {
  const organizers = await organizerService.getAllOrganizers();
  res.status(200).json({ status: "success", results: organizers.length, data: { organizers } });
});

/**
 * @desc   Get organizer by ID
 * @route  GET /api/v1/organizers/:id
 * @access Public
 */
export const getOrganizerById = expressAsyncHandler(async (req, res, next) => {
  const organizer = await organizerService.getOrganizerById(req.params.id);
  res.status(200).json({ status: "success", data: { organizer } });
});

/**
 * @desc   Get organizers by user ID
 * @route  GET /api/v1/organizers/user/:userId
 * @access Public
 */
export const getOrganizersByUserId = expressAsyncHandler(async (req, res, next) => {
  const organizers = await organizerService.getOrganizersByUserId(req.params.userId);
  res.status(200).json({ status: "success", results: organizers.length, data: { organizers } });
});

/**
 * @desc   Get organizers by event ID
 * @route  GET /api/v1/organizers/event/:eventId
 * @access Public
 */
export const getOrganizersByEventId = expressAsyncHandler(async (req, res, next) => {
  const organizers = await organizerService.getOrganizersByEventId(req.params.eventId);
  res.status(200).json({ status: "success", results: organizers.length, data: { organizers } });
});

