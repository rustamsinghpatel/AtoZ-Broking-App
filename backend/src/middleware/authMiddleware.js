const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Protects routes: requires a valid "Authorization: Bearer <token>" header.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  // 1. Read the token from the header.
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, token missing");
  }
  const token = header.split(" ")[1];

  // 2. Verify it. jwt.verify throws for invalid or expired tokens;
  //    the central error handler turns those into 401 responses.
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Make sure the user still exists.
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "Not authorized, user no longer exists");
  }

  // 4. Attach the user so controllers can use req.user.
  req.user = user;
  next();
});

module.exports = { protect };
