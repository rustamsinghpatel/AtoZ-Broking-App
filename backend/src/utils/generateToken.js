const jwt = require("jsonwebtoken");

// The token contains only the user ID and role. Never put
// passwords or other sensitive data inside a JWT.
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

module.exports = generateToken;
