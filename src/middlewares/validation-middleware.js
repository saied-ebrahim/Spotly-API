const validateMiddleware = (schema) => {
  return (req, res, next) => {
    const validateSchema = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (validateSchema.error) {
      console.log(validateSchema.error);
      const errorObj = validateSchema.error.details.map((error) => error.message);
      return res.status(400).json({ "Validation Errors": errorObj });
    }

    req.body = validateSchema.value;
    next();
  };
};

export default validateMiddleware;
