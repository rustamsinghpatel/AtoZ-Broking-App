
const express = require("express");

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  submitKyc,
  getMyKyc,
  getMyKycDocument,
} = require("../controllers/authController");

const {
  submitBankKyc,
  getMyBankKyc,
  getMyBankKycDocument,
} = require("../controllers/bankKycController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ----------------------------------------
// File uploads: 2 MB max, JPG/PNG/WEBP only, and the file's real bytes are
// checked (not just the browser-reported type). Errors come back as clear
// 400 messages instead of a generic 500.
// ----------------------------------------
const {
  uploadKycImages,
  uploadBankKycImage,
} = require("../middleware/uploadMiddleware");

// ----------------------------------------
// Authentication
// ----------------------------------------
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// ----------------------------------------
// Profile and password
// ----------------------------------------
router.patch("/profile", protect, updateProfile);
router.patch("/password", protect, changePassword);

// ----------------------------------------
// PAN / Aadhaar KYC
// Upload fields: pan and aadhaar
// ----------------------------------------
router.post(
  "/kyc",
  protect,
  uploadKycImages,
  submitKyc
);

router.get("/kyc", protect, getMyKyc);

router.get(
  "/kyc/document/:type",
  protect,
  getMyKycDocument
);

// ----------------------------------------
// Bank KYC
// Upload field: bank
// ----------------------------------------
router.post(
  "/bank-kyc",
  protect,
  uploadBankKycImage,
  submitBankKyc
);

router.get("/bank-kyc", protect, getMyBankKyc);

router.get(
  "/bank-kyc/document",
  protect,
  getMyBankKycDocument
);

module.exports = router;
