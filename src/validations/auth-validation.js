import Joi from "joi";

const signUpSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .trim()
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
    .trim()
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
    .trim()
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
      .trim()
      .custom((value) => value.toLowerCase())
      .messages({
        "string.base": "City must be a string",
        "any.required": "City is required",
        "string.empty": "City cannot be empty",
      }),
    country: Joi.string()
      .required()
      .trim()
      .custom((value) => value.toLowerCase())
      .messages({
        "string.base": "Country must be a string",
        "any.required": "Country is required",
        "string.empty": "Country cannot be empty",
      }),
    state: Joi.string()
      .optional()
      .trim()
      .custom((value) => value.toLowerCase())
      .messages({
        "string.base": "State must be a string",
      }),
  })
    .required()
    .messages({
      "any.required": "Address is required",
    }),
  email: Joi.string().required().trim().email().lowercase().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
    "string.empty": "Email cannot be empty",
  }),
  phone: Joi.number().required().messages({
    "any.required": "Phone number is required",
    "number.empty": "Phone number cannot be empty",
  }),
  password: Joi.string().required().min(8).max(15).messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must be at most 15 characters long",
    "string.empty": "Password cannot be empty",
  }),
});

const loginSchema = Joi.object({
  deviceID: Joi.string().required().trim().messages({
    "string.base": "Device ID must be a string",
    "any.required": "Device ID is required",
    "string.empty": "Device ID cannot be empty",
  }),
  email: Joi.string().required().trim().email().lowercase().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
    "string.empty": "Email cannot be empty",
  }),
  password: Joi.string().required().min(8).max(15).messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must be at most 15 characters long",
    "string.empty": "Password cannot be empty",
  }),
});

const refreshTokenSchema = Joi.object({
  deviceID: Joi.string().required().trim().messages({
    "string.base": "Device ID must be a string",
    "any.required": "Device ID is required",
    "string.empty": "Device ID cannot be empty",
  }),
});

const logoutSchema = Joi.object({
  deviceID: Joi.string().required().trim().messages({
    "string.base": "Device ID must be a string",
    "any.required": "Device ID is required",
    "string.empty": "Device ID cannot be empty",
  }),
});

export { signUpSchema, loginSchema, refreshTokenSchema, logoutSchema };
