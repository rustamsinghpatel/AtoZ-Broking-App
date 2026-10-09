
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const generateClientId = require("../utils/generateClientId");
const generateToken = require("../utils/generateToken");

const {
  isValidEmail,
  isValidMobile,
  normalizeMobile,
} = require("../utils/validators");

// --------------------------------------------------
// POST /api/auth/register
// New clients start with Pending status.
// Admin approval is required before client login.
// --------------------------------------------------
const register = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    mobile,
    password,
    confirmPassword,
  } = req.body || {};

  const errors = [];

  const cleanName = String(fullName || "").trim();

  if (!cleanName) {
    errors.push("Full name is required");
  } else if (cleanName.length < 2) {
    errors.push("Full name must be at least 2 characters");
  }

  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanEmail) {
    errors.push("Email is required");
  } else if (!isValidEmail(cleanEmail)) {
    errors.push("Please enter a valid email address");
  }

  const cleanMobile = normalizeMobile(mobile);

  if (!mobile) {
    errors.push("Mobile number is required");
  } else if (!isValidMobile(cleanMobile)) {
    errors.push("Please enter a valid 10-digit mobile number");
  }

  if (!password) {
    errors.push("Password is required");
  } else if (String(password).length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (!confirmPassword) {
    errors.push("Confirm password is required");
  } else if (password !== confirmPassword) {
    errors.push("Passwords do not match");
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors[0], errors);
  }

  // Check whether the email or mobile already exists.
  if (await User.findOne({ email: cleanEmail })) {
    throw new ApiError(409, "An account with this email already exists");
  }

  if (await User.findOne({ mobile: cleanMobile })) {
    throw new ApiError(409, "An account with this mobile number already exists");
  }

  const clientId = await generateClientId();

  // User model supplies the default status: "pending".
  const user = await User.create({
    clientId,
    fullName: cleanName,
    email: cleanEmail,
    mobile: cleanMobile,
    password: String(password),
    role: "client",
  });

  // Do not issue a login token before admin approval.
  res.status(201).json({
    success: true,
    message: "Registration successful. Your account is pending admin approval.",
    data: {
      clientId: user.clientId,
      status: user.status,
      user,
    },
  });
});

// --------------------------------------------------
// POST /api/auth/login
// Accepts Client ID, email or mobile.
// Only active clients can log in.
// --------------------------------------------------
const login = asyncHandler(async (req, res) => {
  const body = req.body || {};

  const identifier = String(
    body.identifier ||
      body.clientId ||
      body.email ||
      body.mobile ||
      ""
  ).trim();

  const password = body.password
    ? String(body.password)
    : "";

  if (!identifier || !password) {
    throw new ApiError(
      400,
      "Client ID / Mobile / Email and password are required"
    );
  }

  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { clientId: identifier.toUpperCase() },
      { mobile: normalizeMobile(identifier) },
    ],
  }).select("+password");

  // Use the same message for a missing user or incorrect password.
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Keep the existing admin account able to sign in.
  // Client accounts must be explicitly activated by an admin.
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

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token: generateToken(user),
      user,
    },
  });
});

// --------------------------------------------------
// GET /api/auth/me
// Protected route: returns the currently logged-in user.
// --------------------------------------------------
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Current user fetched",
    data: {
      user: req.user,
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
};