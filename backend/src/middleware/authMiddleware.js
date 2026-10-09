
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Protect routes using a valid Bearer token.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, token missing");
  }

  const token = header.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Confirm that the account still exists.
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "Not authorized, user no longer exists");
  }

  // Admin must remain able to access the admin dashboard.
  // Clients must be active to use protected APIs.
  if (user.role !== "admin" && user.status !== "active") {
    if (user.status === "inactive") {
      throw new ApiError(
        403,
        "Your account is inactive. Please contact the administrator."
      );
    }

    throw new ApiError(
      403,
      "Your account is pending admin approval."
    );
  }

  req.user = user;
  next();
});

// Only admins can access admin routes.
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

module.exports = { protect, adminOnly };