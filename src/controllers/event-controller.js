// controllers/event-controller.js
import * as eventService from '../services/event-service.js';

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body, req.user);
    res.status(201).json({ status: 'success', data: { event } });
  } catch (err) {
    next(err);
  }
};