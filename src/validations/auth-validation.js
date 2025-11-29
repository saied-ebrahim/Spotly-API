import Joi from "joi";

const signUpSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .custom((value) => value.toLowerCase())
    .min(3)
    .max(30)
    .messages({
      "string.base": "First name must be a string",
      "string.empty": "First name cannot be empty",
      "any.required": "First name is required",
      "string.min": "First name must be at least 3 characters long",
      "string.max": "First name must be at most 30 characters long",
    }),
  lastName: Joi.string()
    .required()
    .custom((value) => value.toLowerCase())
    .min(3)
    .max(30)
    .messages({
      "string.base": "Last name must be a string",
      "string.empty": "Last name cannot be empty",
      "any.required": "Last name is required",
      "string.min": "Last name must be at least 3 characters long",
      "string.max": "Last name must be at most 30 characters long",
    }),
  gender: Joi.string()
    .required()
    .custom((value) => value.toLowerCase())
    .valid("male", "female")
    .messages({
      "string.base": "Gender must be a string",
      "string.empty": "Gender cannot be empty",
      "any.required": "Gender is required",
      "any.only": "Gender must be either 'male' or 'female'",
    }),
  address: Joi.object({
    city: Joi.string()
      .required()
      .custom((value) => value.toLowerCase())
      .messages({
        "string.base": "City must be a string",
        "any.required": "City is required",
        "string.empty": "City cannot be empty",
      }),
    country: Joi.string()
      .required()
      .custom((value) => value.toLowerCase())
      .messages({
        "string.base": "Country must be a string",
        "any.required": "Country is required",
        "string.empty": "Country cannot be empty",
      }),
    state: Joi.string()
      .optional()
      .custom((value) => value.toLowerCase())
      .messages({
        "string.base": "State must be a string",
      }),
  })
    .required()
    .messages({
      "any.required": "Address is required",
    }),
  email: Joi.string().required().email().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  password: Joi.string().required().min(8).max(15).messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must be at most 15 characters long",
  }),
});

const loginSchema = Joi.object({
  deviceID: Joi.string().required().messages({
    "string.base": "Device ID must be a string",
    "any.required": "Device ID is required",
    "string.trim": "Device ID cannot contain leading or trailing spaces",
  }),
  email: Joi.string().required().email().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  password: Joi.string().required().min(8).max(15).messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must be at most 15 characters long",
  }),
});

export { signUpSchema, loginSchema };
