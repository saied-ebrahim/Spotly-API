import expressAsyncHandler from "express-async-handler";
import AppError from "../utils/AppError.js";
import * as analyticsService from "../services/analytics-service.js";

// @desc   Get total revenue
// !@route  GET /api/v1/events/analytics/revenue
// @access Protected
export const getRevenue = expressAsyncHandler(async (req, res, next) => {
  const userID = req.user.id;
  const revenue = await analyticsService.getRevenue(userID);
  res.status(200).json({ revenue });
});

// @desc   Get revenue of specific event
// !@route  GET /api/v1/events/analytics/:id/revenue
// @access Protected
export const getEventRevenue = expressAsyncHandler(async (req, res, next) => {
  const userID = req.user.id;
  const eventID = req.params.id;
  const revenue = await analyticsService.getEventRevenue(userID, eventID);
  res.status(200).json({ revenue });
});

// @desc   Get total net income
// !@route  GET /api/v1/events/analytics/net-income
// @access Protected
export const getNetIncome = expressAsyncHandler(async (req, res, next) => {
  const userID = req.user.id;
  const netIncome = await analyticsService.getNetIncome(userID);
  res.status(200).json({ netIncome });
});

// @desc   Get net income of specific event
// !@route  GET /api/v1/events/analytics/:id/net-income
// @access Protected
export const getEventNetIncome = expressAsyncHandler(async (req, res, next) => {
  const userID = req.user.id;
  const eventID = req.params.id;
  const netIncome = await analyticsService.getEventNetIncome(userID, eventID);
  res.status(200).json({ netIncome });
});

// @desc   Get tickets sold of specific event
// !@route  GET /api/v1/events/analytics/:id/tickets-sold
// @access Protected
export const getEventTicketsSold = expressAsyncHandler(async (req, res, next) => {
  const userID = req.user.id;
  const eventID = req.params.id;
  const ticketsSold = await analyticsService.getEventTicketsSold(userID, eventID);
  res.status(200).json({ ticketsSold });
});

// @desc   Get tickets available of specific event
// !@route  GET /api/v1/events/analytics/:id/tickets-available
// @access Protected
export const getEventTicketsAvailable = expressAsyncHandler(async (req, res, next) => {
  const userID = req.user.id;
  const eventID = req.params.id;
  const ticketsAvailable = await analyticsService.getEventTicketsAvailable(userID, eventID);
  res.status(200).json({ ticketsAvailable });
});


// @desc   Get total tickets sold
// !@route  GET /api/v1/events/analytics/tickets-sold
// @access Protected
export const getTicketsSold = expressAsyncHandler(async (req, res, next) => {
  const userID = req.user.id;
  const ticketsSold = await analyticsService.getTicketsSold(userID);
  res.status(200).json({ ticketsSold });
});


// @desc   Get total tickets available
// !@route  GET /api/v1/events/analytics/tickets-available
// @access Protected
export const getTicketsAvailable = expressAsyncHandler(async (req, res, next) => {
  const userID = req.user.id;
  const ticketsAvailable = await analyticsService.getTicketsAvailable(userID);
  res.status(200).json({ ticketsAvailable });
});
