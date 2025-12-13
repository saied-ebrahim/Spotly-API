import Joi from "joi";

export const createTagValidation = Joi.object({
  name: Joi.string().required().trim().messages({
    "string.base": "Tag name must be a string",
    "string.empty": "Tag name is required",
    "any.required": "Tag name is required",
  }),
});

export const updateTagValidation = Joi.object({
  name: Joi.string().optional().trim().messages({
    "string.base": "Tag name must be a string",
    "string.empty": "Tag name cannot be empty",
  }),
});
