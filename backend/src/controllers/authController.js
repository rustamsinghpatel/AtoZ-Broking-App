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

// ---------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------
const register = asyncHandler(async (req, res) => {
  const { fullName, email, mobile, password, confirmPassword } = req.body || {};

  // 1. Validate input and collect every problem so the user sees them all.
  //    String() guards against non-string values (e.g. numbers) crashing .trim().
  const errors = [];

  const cleanName = String(fullName || "").trim();
  if (!cleanName) errors.push("Full name is required");
  else if (cleanName.length < 2)
    errors.push("Full name must be at least 2 characters");

  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) errors.push("Email is required");
  else if (!isValidEmail(cleanEmail))
    errors.push("Please enter a valid email address");

  const cleanMobile = normalizeMobile(mobile);
  if (!mobile) errors.push("Mobile number is required");
  else if (!isValidMobile(cleanMobile))
    errors.push("Please enter a valid 10-digit mobile number");

  if (!password) errors.push("Password is required");
  else if (String(password).length < 6)
    errors.push("Password must be at least 6 characters");

  if (!confirmPassword) errors.push("Confirm password is required");
  else if (password !== confirmPassword)
    errors.push("Passwords do not match");

  if (errors.length > 0) {
    throw new ApiError(400, errors[0], errors);
  }

  // 2. Make sure email and mobile are not already registered.
  if (await User.findOne({ email: cleanEmail })) {
    throw new ApiError(409, "An account with this email already exists");
  }
  if (await User.findOne({ mobile: cleanMobile })) {
    throw new ApiError(409, "An account with this mobile number already exists");
  }

  // 3. Generate the unique Client ID (A2Z10001, A2Z10002, ...).
  const clientId = await generateClientId();

  // 4. Save the user. The model hashes the password automatically.
  const user = await User.create({
    clientId,
    fullName: cleanName,
    email: cleanEmail,
    mobile: cleanMobile,
    password: String(password),
  });

  // 5. Respond with a token and the user (password never included).
  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { token: generateToken(user), user },
  });
});

// ---------------------------------------------------------------
// POST /api/auth/login
// Body: { identifier, password }
// identifier = Client ID OR email OR mobile
// ---------------------------------------------------------------
const login = asyncHandler(async (req, res) => {
  const body = req.body || {};

  // Accept "identifier" (preferred) but also clientId/email/mobile
  // so the frontend can send whichever name is convenient.
  const identifier = String(
    body.identifier || body.clientId || body.email || body.mobile || ""
  ).trim();
  const password = body.password ? String(body.password) : "";

  if (!identifier || !password) {
    throw new ApiError(400, "Client ID / Mobile / Email and password are required");
  }

  // Look for a user matching the identifier as email, clientId or mobile.
  // .select("+password") is needed because password is hidden by default.
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { clientId: identifier.toUpperCase() },
      { mobile: normalizeMobile(identifier) },
    ],
  }).select("+password");

  // Same message for "no such user" and "wrong password", so attackers
  // cannot discover which accounts exist.
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { token: generateToken(user), user }, // toJSON strips the password
  });
});

// ---------------------------------------------------------------
// GET /api/auth/me  (protected)
// ---------------------------------------------------------------
const getMe = asyncHandler(async (req, res) => {
  // req.user was attached by the protect middleware.
  res.status(200).json({
    success: true,
    message: "Current user fetched",
    data: { user: req.user },
  });
});

module.exports = { register, login, getMe };
