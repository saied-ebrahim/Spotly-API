// validations/category-validation.js
import Joi from "joi";

// Validation for creating a category
export const createCategoryValidation = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .messages({
      "string.base": "Category name must be a string",
      "string.empty": "Category name is required",
      "any.required": "Category name is required",
    }),
  description: Joi.string()
    .required()
    .trim()
    .messages({
      "string.base": "Category description must be a string",
      "string.empty": "Category description is required",
      "any.required": "Category description is required",
    }),
  image: Joi.string()
    .required()
    .trim()
    .uri()
    .messages({
      "string.base": "Category image must be a string",
      "string.empty": "Category image is required",
      "any.required": "Category image is required",
      "string.uri": "Category image must be a valid URL",
    }),
  events: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.base": "Event ID must be a string",
          "string.pattern.base": "All event IDs must be valid MongoDB ObjectIds",
        })
    )
    .optional()
    .messages({
      "array.base": "Events must be an array",
    }),
});

// Validation for updating a category
export const updateCategoryValidation = Joi.object({
  name: Joi.string()
    .optional()
    .trim()
    .messages({
      "string.base": "Category name must be a string",
      "string.empty": "Category name cannot be empty",
    }),
  description: Joi.string()
    .optional()
    .trim()
    .messages({
      "string.base": "Category description must be a string",
      "string.empty": "Category description cannot be empty",
    }),
  image: Joi.string()
    .optional()
    .trim()
    .uri()
    .messages({
      "string.base": "Category image must be a string",
      "string.empty": "Category image cannot be empty",
      "string.uri": "Category image must be a valid URL",
    }),
  events: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.base": "Event ID must be a string",
          "string.pattern.base": "All event IDs must be valid MongoDB ObjectIds",
        })
    )
    .optional()
    .messages({
      "array.base": "Events must be an array",
    }),
});

