const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Send error response
  const errorResponse = {
    statusCode: err.statusCode,
    status: err.status,
    message: err.message,
  };

  // Only send stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(err.statusCode).json(errorResponse);
};

export default errorHandler;
