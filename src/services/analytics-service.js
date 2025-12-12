import AppError from "../utils/AppError.js";
import AnalyticsModel from "../models/analytics-model.js";
import UserModel from "../models/user-model.js";
import eventModel from "../models/event-model.js";
import userModel from "../models/user-model.js";

export const getRevenue = async (userID) => {
  const user = await UserModel.findById(userID);
  if (!user) throw new AppError("User not found", 404);

  let query = {};
  user.role == "admin" ? (query = {}) : (query = { organizerID: userID });

  const revenue = await AnalyticsModel.find(query);
  const totalRevenue = revenue.reduce((total, event) => total + event.revenue, 0);

  console.log(">>> totalRevenue", totalRevenue);

  return totalRevenue;
};

export const getEventRevenue = async (userID, eventID) => {
  const user = await userModel.findById(userID);
  if (!user) throw new AppError("User not found", 404);

  const event = await eventModel.findById(eventID);
  if (!event) throw new AppError("Event not found", 404);
  if (event.organizer.toString() !== userID && user.role !== "admin") throw new AppError("You are not authorized to access this event", 401);

  const revenue = await AnalyticsModel.findOne({ eventID });

  console.log(">>> totalRevenue", revenue.revenue);

  return revenue.revenue;
};

export const getNetIncome = async (userID) => {
  const user = await UserModel.findById(userID);
  if (!user) throw new AppError("User not found", 404);

  let query = {};
  let role = user.role == "admin";
  role ? (query = {}) : (query = { organizerID: userID });

  const netIncome = await AnalyticsModel.find(query);
  const totalNetIncome = netIncome.reduce((total, event) => total + (role ? event.netIncomeAdmin : event.netIncomeOrganizer), 0);

  console.log(">>> totalNetIncome", totalNetIncome);

  return totalNetIncome;
};

export const getEventNetIncome = async (userID, eventID) => {
  const user = await userModel.findById(userID);
  if (!user) throw new AppError("User not found", 404);

  const event = await eventModel.findById(eventID);
  if (!event) throw new AppError("Event not found", 404);
  if (event.organizer.toString() !== userID && user.role !== "admin") throw new AppError("You are not authorized to access this event", 401);

  let role = user.role == "admin";

  const netIncome = await AnalyticsModel.findOne({ eventID });
  const netIncomeValue = role ? netIncome.netIncomeAdmin : netIncome.netIncomeOrganizer;

  console.log(">>> totalNetIncome", netIncomeValue);

  return netIncomeValue;
};

export const getTicketsSold = async (userID) => {
  const user = await UserModel.findById(userID);
  if (!user) throw new AppError("User not found", 404);

  if (user.role !== "admin") throw new AppError("You are not authorized to access this event", 403);

  const ticketsSold = await AnalyticsModel.find();
  const totalTicketsSold = ticketsSold.reduce((total, event) => total + event.ticketsSold, 0);

  console.log(">>> totalTicketsSold", totalTicketsSold);

  return totalTicketsSold;
};

export const getEventTicketsSold = async (userID, eventID) => {
  const user = await userModel.findById(userID);
  if (!user) throw new AppError("User not found", 404);

  const event = await eventModel.findById(eventID);
  if (!event) throw new AppError("Event not found", 404);
  if (event.organizer.toString() !== userID && user.role !== "admin") throw new AppError("You are not authorized to access this event", 401);

  const ticketsSold = await AnalyticsModel.findOne({ eventID });
  const ticketsSoldValue = ticketsSold.ticketsSold;

  console.log(">>> totalTicketsSold", ticketsSoldValue);

  return ticketsSoldValue;
};

export const getTicketsAvailable = async () => {

  const ticketsAvailable = await AnalyticsModel.find();
  const totalTicketsAvailable = ticketsAvailable.reduce((total, event) => total + event.ticketsAvailable, 0);

  console.log(">>> totalTicketsAvailable", totalTicketsAvailable);

  return totalTicketsAvailable;
};

export const getEventTicketsAvailable = async (eventID) => {
  const event = await eventModel.findById(eventID);
  if (!event) throw new AppError("Event not found", 404);

  const ticketsAvailable = await AnalyticsModel.findOne({ eventID });
  const ticketsAvailableValue = ticketsAvailable.ticketsAvailable;

  console.log(">>> totalTicketsAvailable", ticketsAvailableValue);

  return ticketsAvailableValue;
};

