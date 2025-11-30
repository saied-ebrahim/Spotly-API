import AppError from "../utils/AppError.js";

const validateMiddleware = (schema) => {
  return (req, res, next) => {
    const validateSchema = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (validateSchema.error) {
      const errorMessages = validateSchema.error.details.map((error) => error.message);
      return next(new AppError(`Validation Error: ${errorMessages.join(", ")}`, 400));
    }

    req.body = validateSchema.value;
    next();
  };
};

export default validateMiddleware;
