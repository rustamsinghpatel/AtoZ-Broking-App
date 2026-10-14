
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
// New clients require admin approval before login.
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
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanMobile = normalizeMobile(mobile);

  if (!cleanName) {
    errors.push("Full name is required");
  } else if (cleanName.length < 2) {
    errors.push("Full name must be at least 2 characters");
  }

  if (!cleanEmail) {
    errors.push("Email is required");
  } else if (!isValidEmail(cleanEmail)) {
    errors.push("Please enter a valid email address");
  }

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

  const existingEmail = await User.findOne({ email: cleanEmail });

  if (existingEmail) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const existingMobile = await User.findOne({ mobile: cleanMobile });

  if (existingMobile) {
    throw new ApiError(
      409,
      "An account with this mobile number already exists"
    );
  }

  const clientId = await generateClientId();

  const user = await User.create({
    clientId,
    fullName: cleanName,
    email: cleanEmail,
    mobile: cleanMobile,
    password: String(password),
    role: "client",
    // User model default status: pending
  });

  res.status(201).json({
    success: true,
    message:
      "Registration successful. Your account is pending admin approval.",
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
// Admin login remains supported.
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

  const password = body.password ? String(body.password) : "";

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

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

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
// Requires authentication.
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

// --------------------------------------------------
// PATCH /api/auth/profile
// Update permitted profile fields only.
// Requires authentication.
// --------------------------------------------------
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, address, city, state, postalCode } =
    req.body || {};

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  if (fullName !== undefined) {
    const cleanName = String(fullName).trim();

    if (cleanName.length < 2) {
      throw new ApiError(
        400,
        "Full name must be at least 2 characters"
      );
    }

    user.fullName = cleanName;
  }

  if (address !== undefined) {
    user.address = String(address).trim();
  }

  if (city !== undefined) {
    user.city = String(city).trim();
  }

  if (state !== undefined) {
    user.state = String(state).trim();
  }

  if (postalCode !== undefined) {
    user.postalCode = String(postalCode).trim();
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
});

// --------------------------------------------------
// PATCH /api/auth/password
// Change the authenticated user's password.
// The User model hashes it when save() is called.
// --------------------------------------------------
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } =
    req.body || {};

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(
      400,
      "Current password, new password and confirmation are required"
    );
  }

  if (String(newPassword).length < 6) {
    throw new ApiError(
      400,
      "New password must be at least 6 characters"
    );
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New passwords do not match");
  }

  if (currentPassword === newPassword) {
    throw new ApiError(
      400,
      "New password must be different from current password"
    );
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  const isCurrentPasswordValid =
    await user.comparePassword(String(currentPassword));

  if (!isCurrentPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = String(newPassword);

  // Triggers the User model's password-hashing middleware.
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully. Please sign in again.",
  });
});

// --------------------------------------------------
// POST /api/auth/kyc
// Submit masked KYC details only.
// Never store the full PAN or Aadhaar number here.
// --------------------------------------------------
const submitKyc = asyncHandler(async (req, res) => {
  const { kycPanMasked, kycAadhaarLast4 } = req.body || {};

  const maskedPan = String(kycPanMasked || "")
    .trim()
    .toUpperCase();

  const aadhaarLast4 = String(kycAadhaarLast4 || "").trim();

  if (!maskedPan) {
    throw new ApiError(400, "Masked PAN is required");
  }

  // Reject a full, unmasked PAN.
  const fullPanPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (fullPanPattern.test(maskedPan)) {
    throw new ApiError(
      400,
      "Send a masked PAN only, not the full PAN number"
    );
  }

  // Require a masked value containing at least one masking character.
  if (
    !/^[A-Z0-9*•X-]{5,15}$/.test(maskedPan) ||
    !/[*•X-]/.test(maskedPan)
  ) {
    throw new ApiError(
      400,
      "Please provide a valid masked PAN value"
    );
  }

  if (!/^\d{4}$/.test(aadhaarLast4)) {
    throw new ApiError(
      400,
      "Only the last 4 Aadhaar digits are required"
    );
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  if (user.role !== "client") {
    throw new ApiError(403, "Only client accounts can submit KYC");
  }

  if (user.kycStatus === "pending") {
    throw new ApiError(
      409,
      "Your KYC is already pending admin review"
    );
  }

  if (user.kycStatus === "approved") {
    throw new ApiError(409, "Your KYC is already approved");
  }

  user.kycPanMasked = maskedPan;
  user.kycAadhaarLast4 = aadhaarLast4;
  user.kycStatus = "pending";
  user.kycSubmittedAt = new Date();
  user.kycReviewedAt = null;
  user.kycReviewedBy = null;
  user.kycRejectionReason = "";

  await user.save();

  res.status(201).json({
    success: true,
    message: "KYC submitted successfully and is pending admin review",
    data: {
      kycStatus: user.kycStatus,
      kycSubmittedAt: user.kycSubmittedAt,
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  submitKyc,
};
