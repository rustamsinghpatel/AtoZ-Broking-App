const User = require("../models/User");
const KycDocument = require("../models/KycDocument");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const generateClientId = require("../utils/generateClientId");
const generateToken = require("../utils/generateToken");

const {
  isValidEmail,
  isValidMobile,
  normalizeMobile,
} = require("../utils/validators");

const KYC_DOC_TYPES = ["pan", "aadhaar"];

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
  const { fullName, address, city, state, postalCode, country } =
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
    const cleanAddress = String(address).trim();

    if (cleanAddress.length > 200) {
      throw new ApiError(
        400,
        "Address must be 200 characters or less"
      );
    }

    user.address = cleanAddress;
  }

  if (city !== undefined) {
    const cleanCity = String(city).trim();

    if (cleanCity.length > 60) {
      throw new ApiError(400, "City must be 60 characters or less");
    }

    user.city = cleanCity;
  }

  if (state !== undefined) {
    const cleanState = String(state).trim();

    if (cleanState.length > 60) {
      throw new ApiError(400, "State must be 60 characters or less");
    }

    user.state = cleanState;
  }

  if (country !== undefined) {
    const cleanCountry = String(country).trim();

    if (!cleanCountry) {
      throw new ApiError(400, "Country is required");
    }

    if (cleanCountry.length > 60) {
      throw new ApiError(
        400,
        "Country must be 60 characters or less"
      );
    }

    user.country = cleanCountry;
  }

  if (postalCode !== undefined) {
    const cleanPostal = String(postalCode).trim();

    if (cleanPostal) {
      const isIndia =
        String(user.country || "India").trim().toLowerCase() ===
        "india";

      if (isIndia) {
        if (!/^[1-9][0-9]{5}$/.test(cleanPostal)) {
          throw new ApiError(
            400,
            "Enter a valid 6-digit PIN code"
          );
        }
      } else if (!/^[A-Za-z0-9 -]{3,10}$/.test(cleanPostal)) {
        throw new ApiError(
          400,
          "Enter a valid postal code (3 to 10 letters or numbers)"
        );
      }
    }

    user.postalCode = cleanPostal;
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
// Helper: client ke documents ka safe summary.
// Image data ya storage key kabhi nahi bhejte.
// --------------------------------------------------
const buildDocumentSummary = async (userId) => {
  const docs = await KycDocument.find({ user: userId }).select(
    "docType contentType size uploadedAt"
  );

  const summary = {
    pan: { uploaded: false },
    aadhaar: { uploaded: false },
  };

  docs.forEach((doc) => {
    summary[doc.docType] = {
      uploaded: true,
      contentType: doc.contentType,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
    };
  });

  return summary;
};

// --------------------------------------------------
// POST /api/auth/kyc
// Multipart upload: fields "pan" and "aadhaar" (images)
// plus kycPanMasked and kycAadhaarLast4 (text fields).
// Full PAN / Aadhaar numbers are never accepted or stored.
// Images are stored privately in the KycDocument model.
// Resubmission is allowed only after rejection.
// --------------------------------------------------
const submitKyc = asyncHandler(async (req, res) => {
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

  // Browser se sirf masked PAN aur Aadhaar ke aakhri 4 digit aate hain.
  // Masked PAN ka format: 2 letters + 6 stars + 1 digit + 1 letter.
  const maskedPan = String(req.body?.kycPanMasked || "")
    .trim()
    .toUpperCase();

  const aadhaarLast4 = String(req.body?.kycAadhaarLast4 || "").trim();

  if (!/^[A-Z]{2}\*{6}[0-9][A-Z]$/.test(maskedPan)) {
    throw new ApiError(400, "A valid masked PAN is required");
  }

  if (!/^\d{4}$/.test(aadhaarLast4)) {
    throw new ApiError(
      400,
      "The last 4 digits of the Aadhaar number are required"
    );
  }

  const files = req.files || {};

  const existing = await KycDocument.find({ user: user._id }).select(
    "docType"
  );

  const existingTypes = existing.map((doc) => doc.docType);

  // Har type ke liye nayi image ya pehle se saved image honi chahiye.
  for (const type of KYC_DOC_TYPES) {
    const hasNew = Boolean(files[type] && files[type][0]);
    const hasOld = existingTypes.includes(type);

    if (!hasNew && !hasOld) {
      throw new ApiError(
        400,
        type === "pan"
          ? "PAN card image is required"
          : "Aadhaar card image is required"
      );
    }
  }

  // Nayi images save karo. Wahi document update hota hai.
  for (const type of KYC_DOC_TYPES) {
    const file = files[type] && files[type][0];

    if (!file) continue;

    await KycDocument.findOneAndUpdate(
      { user: user._id, docType: type },
      {
        $set: {
          data: file.buffer,
          contentType: file.mimetype,
          size: file.buffer.length,
          uploadedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
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
      documents: await buildDocumentSummary(user._id),
    },
  });
});

// --------------------------------------------------
// GET /api/auth/kyc
// Client apna KYC status aur uploaded documents ka summary dekhta hai.
// Masked PAN aur Aadhaar ke aakhri 4 digit bhi dikhte hain.
// --------------------------------------------------
const getMyKyc = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "KYC status fetched",
    data: {
      kycStatus: req.user.kycStatus,
      kycSubmittedAt: req.user.kycSubmittedAt,
      kycReviewedAt: req.user.kycReviewedAt,
      kycRejectionReason: req.user.kycRejectionReason,
      kycPanMasked: req.user.kycPanMasked,
      kycAadhaarLast4: req.user.kycAadhaarLast4,
      documents: await buildDocumentSummary(req.user._id),
    },
  });
});

// --------------------------------------------------
// GET /api/auth/kyc/document/:type
// Client sirf apni image dekh sakta hai (preview ke liye).
// --------------------------------------------------
const getMyKycDocument = asyncHandler(async (req, res) => {
  const type = String(req.params.type || "").toLowerCase();

  if (!KYC_DOC_TYPES.includes(type)) {
    throw new ApiError(400, "Document type must be pan or aadhaar");
  }

  const doc = await KycDocument.findOne({
    user: req.user._id,
    docType: type,
  }).select("+data contentType");

  if (!doc) {
    throw new ApiError(404, "Document not found");
  }

  res.set({
    "Content-Type": doc.contentType,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": "inline",
  });

  res.status(200).send(doc.data);
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  submitKyc,
  getMyKyc,
  getMyKycDocument,
};