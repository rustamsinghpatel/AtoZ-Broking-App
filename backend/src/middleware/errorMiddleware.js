const ApiError = require("../utils/ApiError");

// Runs when no route matched.
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// One place that turns every error into the same JSON shape:
// { success: false, message: "..." }
// (Express recognises an error handler by its 4 arguments - keep `next`.)
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";
  let errors = err.errors || undefined;

  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  // Invalid or expired JWT
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Not authorized, invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired, please log in again";
  }

  // Duplicate key from MongoDB (e.g. two identical signups at the same moment)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `An account with this ${field} already exists`;
  }

  // Mongoose schema validation failure
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = errors[0];
  }

  // Don't leak internal details for unexpected errors.
  if (statusCode === 500) {
    console.error(err);
    message = "Something went wrong on the server";
  }

  res
    .status(statusCode)
    .json({ success: false, message, ...(errors && { errors }) });
};

module.exports = { notFound, errorHandler };
