const jwt = require("jsonwebtoken");
const { getSessionLifetime } = require("./sessionPolicy");

// The token contains only the user ID and role. Never put
// passwords or other sensitive data inside a JWT.
// Lifetime comes from the session policy (see sessionPolicy.js):
// never shorter than the configured minimum (default 8 hours).
const generateToken = (user) => {
  const { seconds } = getSessionLifetime(user.role);

  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: seconds,
  });
};

// Reads the expiry (as an ISO string) from a token we just issued, so the
// frontend knows when the session ends without having to guess.
const getTokenExpiry = (token) => {
  const decoded = jwt.decode(token);
  return decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null;
};

module.exports = generateToken;
module.exports.getTokenExpiry = getTokenExpiry;
