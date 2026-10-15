
const express = require("express");
const multer = require("multer");

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
// File upload configuration
// Store uploaded images in memory.
// ----------------------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG or WEBP images are allowed.")
      );
    }

    cb(null, true);
  },
});

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
  upload.fields([
    { name: "pan", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
  ]),
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
  upload.single("bank"),
  submitBankKyc
);

router.get("/bank-kyc", protect, getMyBankKyc);

router.get(
  "/bank-kyc/document",
  protect,
  getMyBankKycDocument
);

module.exports = router;
