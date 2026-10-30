// An Error that also carries an HTTP status code (400, 401, 409...).
// `errorCode` is an optional machine-readable reason (e.g. "AUTH_EXPIRED")
// that the frontend can use to decide what to do (such as clearing a session).
class ApiError extends Error {
  constructor(statusCode, message, errors = null, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // optional list of field-level problems
    this.errorCode = errorCode;
  }
}

module.exports = ApiError;
