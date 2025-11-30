// validations/tag-validation.js
import Joi from "joi";

// Validation for creating a tag
export const createTagValidation = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .messages({
      "string.base": "Tag name must be a string",
      "string.empty": "Tag name is required",
      "any.required": "Tag name is required",
    }),
});

// Validation for updating a tag
export const updateTagValidation = Joi.object({
  name: Joi.string()
    .optional()
    .trim()
    .messages({
      "string.base": "Tag name must be a string",
      "string.empty": "Tag name cannot be empty",
    }),
});

