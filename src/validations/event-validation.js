  // validations/event-validation.js
  import { body } from 'express-validator';

  export const createEventValidation = [
    body('title').notEmpty().withMessage('Title is required'),
    body('date').isISO8601().withMessage('Invalid date'),
    // ...
  ];