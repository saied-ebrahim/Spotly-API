import AppError from "../utils/AppError.js";

const validateMiddleware = (schema) => {
  return async (req, res, next) => {
    try {
      const value = await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true, convert: true });
      req.body = value;
      req.body.title = await req.body.title;
      next();
    } catch (err) {
      if (err.isJoi && err.details) {
        const errorMessages = err.details.map((error) => error.message);
        return next(new AppError(`Validation Error: ${[...errorMessages]}`, 400));
      }
      next(err);
    }
  };
};

export default validateMiddleware;
