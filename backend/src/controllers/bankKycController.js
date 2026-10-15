const mongoose = require("mongoose");
const BankKyc = require("../models/BankKyc");

const getUserId = (req) => req.user?._id || req.user?.id;

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

// Har controller ko try/catch mein wrap karta hai.
const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err && err.code === 11000) {
      return fail(res, 400, "Your bank KYC is already submitted.");
    }

    console.error("Bank KYC error:", err);
    return fail(res, 500, "Something went wrong. Please try again.");
  }
};

const maskAccountNumber = (last4 = "") => (last4 ? `XXXXXX${last4}` : "");

const getBankSummary = (bank) => {
  if (!bank) {
    return {
      status: "not_submitted",
      accountHolder: "",
      bankName: "",
      accountNumberMasked: "",
      ifsc: "",
      submittedAt: null,
      reviewedAt: null,
      rejectionReason: "",
      documentUploaded: false,
      documentUploadedAt: null,
    };
  }

  return {
    status: bank.status,
    accountHolder: bank.accountHolder || "",
    bankName: bank.bankName || "",
    accountNumberMasked: maskAccountNumber(bank.accountLast4),
    ifsc: bank.ifsc || "",
    submittedAt: bank.submittedAt || null,
    reviewedAt: bank.reviewedAt || null,
    rejectionReason: bank.rejectionReason || "",
    documentUploaded: Boolean(bank.proofUploadedAt),
    documentUploadedAt: bank.proofUploadedAt || null,
  };
};

// Client ke bheje mimetype par bharosa nahi: file ke asli bytes check karte hain.
const hasValidImageSignature = (buffer, mimetype) => {
  if (!buffer || buffer.length < 12) return false;

  if (mimetype === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimetype === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  if (mimetype === "image/webp") {
    return (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  return false;
};

const sendProof = (res, bank) => {
  res.setHeader("Content-Type", bank.proofContentType);
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.send(bank.proofData);
};

// POST /api/auth/bank-kyc
exports.submitBankKyc = wrap(async (req, res) => {
  const userId = getUserId(req);

  const accountHolder = String(req.body.accountHolder || "").trim();
  const bankName = String(req.body.bankName || "").trim();
  const accountNumber = String(req.body.accountNumber || "").trim();
  const ifsc = String(req.body.ifsc || "").trim().toUpperCase();

  const bankFile = req.file || req.files?.bank?.[0];

  if (!accountHolder || !bankName || !accountNumber || !ifsc) {
    return fail(res, 400, "Please fill all bank details.");
  }

  if (accountHolder.length < 2 || accountHolder.length > 100) {
    return fail(res, 400, "Account holder name must be 2 to 100 characters.");
  }

  if (bankName.length > 100) {
    return fail(res, 400, "Bank name cannot exceed 100 characters.");
  }

  if (!/^\d{6,20}$/.test(accountNumber)) {
    return fail(res, 400, "Enter a valid account number.");
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
    return fail(res, 400, "Enter a valid IFSC code.");
  }

  if (!bankFile) {
    return fail(res, 400, "Please upload your bank proof.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(bankFile.mimetype)) {
    return fail(res, 400, "Bank proof must be a JPG, PNG or WEBP image.");
  }

  if (bankFile.size > 2 * 1024 * 1024) {
    return fail(res, 400, "Bank proof image must be 2 MB or smaller.");
  }

  if (!hasValidImageSignature(bankFile.buffer, bankFile.mimetype)) {
    return fail(res, 400, "The uploaded file is not a valid image.");
  }

  const existing = await BankKyc.findOne({ user: userId });

  if (existing && existing.status !== "rejected") {
    return fail(
      res,
      400,
      existing.status === "approved"
        ? "Your bank KYC is already approved."
        : "Your bank KYC is already submitted and pending review."
    );
  }

  const now = new Date();

  const bankData = {
    user: userId,
    accountHolder,
    bankName,
    accountNumber,
    accountLast4: accountNumber.slice(-4),
    ifsc,
    proofData: bankFile.buffer,
    proofContentType: bankFile.mimetype,
    proofSize: bankFile.size,
    proofUploadedAt: now,
    status: "pending",
    submittedAt: now,
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: "",
  };

  let bankKyc;

  if (existing) {
    existing.set(bankData);
    bankKyc = await existing.save();
  } else {
    bankKyc = await BankKyc.create(bankData);
  }

  return res.status(201).json({
    success: true,
    message: "Bank KYC submitted successfully and is pending review.",
    data: { bankKyc: getBankSummary(bankKyc) },
  });
});

// GET /api/auth/bank-kyc
exports.getMyBankKyc = wrap(async (req, res) => {
  const bank = await BankKyc.findOne({ user: getUserId(req) }).lean();

  return res.json({
    success: true,
    data: { bankKyc: getBankSummary(bank) },
  });
});

// GET /api/auth/bank-kyc/document
exports.getMyBankKycDocument = wrap(async (req, res) => {
  const bank = await BankKyc.findOne({ user: getUserId(req) }).select(
    "+proofData proofContentType"
  );

  if (!bank?.proofData) {
    return fail(res, 404, "Bank proof document not found.");
  }

  return sendProof(res, bank);
});

// GET /api/admin/bank-kyc/pending
exports.getPendingBankKyc = wrap(async (req, res) => {
  const requests = await BankKyc.find({ status: "pending" })
    .populate(
      "user",
      "fullName clientId email mobile address city state postalCode country"
    )
    .sort({ submittedAt: 1 })
    .lean();

  return res.json({
    success: true,
    data: {
      requests: requests.map((item) => ({
        _id: item._id,
        user: item.user,
        ...getBankSummary(item),
      })),
    },
  });
});

// GET /api/admin/bank-kyc/:id/document   (:id = user's ID)
exports.getAdminBankKycDocument = wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return fail(res, 400, "Invalid user id.");
  }

  const bank = await BankKyc.findOne({ user: req.params.id }).select(
    "+proofData proofContentType"
  );

  if (!bank?.proofData) {
    return fail(res, 404, "Bank proof document not found.");
  }

  return sendProof(res, bank);
});

// PATCH /api/admin/bank-kyc/:id/review   (:id = user's ID)
exports.reviewBankKyc = wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return fail(res, 400, "Invalid user id.");
  }

  const status = String(req.body.status || "").toLowerCase();
  const reason = String(
    req.body.reason ?? req.body.rejectionReason ?? ""
  ).trim();

  if (!["approved", "rejected"].includes(status)) {
    return fail(res, 400, "Status must be approved or rejected.");
  }

  if (status === "rejected" && !reason) {
    return fail(res, 400, "Please provide a rejection reason.");
  }

  if (reason.length > 300) {
    return fail(res, 400, "Rejection reason cannot exceed 300 characters.");
  }

  // Atomic: do admin ek saath review karein to sirf ek pass hoga.
  const bankKyc = await BankKyc.findOneAndUpdate(
    { user: req.params.id, status: "pending" },
    {
      $set: {
        status,
        reviewedAt: new Date(),
        reviewedBy: getUserId(req),
        rejectionReason: status === "rejected" ? reason : "",
      },
    },
    { new: true }
  );

  if (!bankKyc) {
    const exists = await BankKyc.exists({ user: req.params.id });

    return fail(
      res,
      exists ? 400 : 404,
      exists
        ? "This bank KYC request has already been reviewed."
        : "Bank KYC request not found."
    );
  }

  return res.json({
    success: true,
    message: `Bank KYC ${status} successfully.`,
    data: { bankKyc: getBankSummary(bankKyc) },
  });
});