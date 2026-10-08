// An Error that also carries an HTTP status code (400, 401, 409...).
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // optional list of field-level problems
  }
}

module.exports = ApiError;
