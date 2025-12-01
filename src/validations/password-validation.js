import Joi from "joi";

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email is invalid",
  }),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().required().min(8).max(15).messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must be at most 15 characters long",
    "string.empty": "Password cannot be empty",
  }),
});

export { forgetPasswordSchema, resetPasswordSchema };
