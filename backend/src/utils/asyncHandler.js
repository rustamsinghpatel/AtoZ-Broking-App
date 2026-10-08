// Wraps async controllers so any thrown error goes to the central
// error handler. This avoids try/catch in every controller.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
