const express = require("express");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const {
  getPendingDeposits,
  reviewDeposit,
  getPendingKyc,
  reviewKyc,
  getKycDocument,
  getKycRecords,
  getKycHistory,
  getPendingWithdrawals,
  reviewWithdrawal,
} = require("../controllers/adminController");

const {
  getPendingBankKyc,
  getBankKycRecords,
  getAdminBankKycDocument,
  reviewBankKyc,
} = require("../controllers/bankKycController");

const {
  listPositions,
  createPosition,
  updatePosition,
  getPositionAudit,
} = require("../controllers/adminPositionController");

const router = express.Router();

// ==================================================
// GET /api/admin/clients
// Admin ko saare clients dikhane ke liye
// ==================================================
router.get("/clients", protect, adminOnly, async (req, res, next) => {
  try {
    const clients = await User.find({ role: "client" })
      .select(
        "clientId fullName email mobile status statusReason statusUpdatedAt createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: clients.length,
      data: { clients },
    });
  } catch (error) {
    next(error);
  }
});

// ==================================================
// PATCH /api/admin/clients/:id/status
// Client ko active, pending ya inactive karna
// ==================================================
router.patch(
  "/clients/:id/status",
  protect,
  adminOnly,
  async (req, res, next) => {
    try {
      const { status, reason } = req.body || {};

      const allowedStatuses = ["pending", "active", "inactive"];

      if (!allowedStatuses.includes(status)) {
        throw new ApiError(
          400,
          "Invalid status. Use pending, active, or inactive."
        );
      }

      const cleanReason = String(reason || "").trim();

      if (status === "inactive" && !cleanReason) {
        throw new ApiError(
          400,
          "A reason is required to deactivate a client."
        );
      }

      const client = await User.findOne({
        _id: req.params.id,
        role: "client",
      });

      if (!client) {
        throw new ApiError(404, "Client not found.");
      }

      client.status = status;
      client.statusReason =
        status === "inactive" ? cleanReason : "";
      client.statusUpdatedAt = new Date();
      client.statusUpdatedBy = req.user._id;

      if (!Array.isArray(client.statusHistory)) {
        client.statusHistory = [];
      }

      client.statusHistory.push({
        status,
        reason: status === "inactive" ? cleanReason : "",
        changedBy: req.user._id,
        changedAt: new Date(),
      });

      await client.save();

      return res.status(200).json({
        success: true,
        message: `Client status updated to ${status}.`,
        data: {
          client: {
            _id: client._id,
            clientId: client.clientId,
            fullName: client.fullName,
            email: client.email,
            status: client.status,
            statusReason: client.statusReason,
            statusUpdatedAt: client.statusUpdatedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==================================================
// GET /api/admin/deposits/pending
// Admin ke pending deposit requests
// ==================================================
router.get(
  "/deposits/pending",
  protect,
  adminOnly,
  getPendingDeposits
);

// ==================================================
// PATCH /api/admin/deposits/:id/review
// Deposit approve ya reject karna
// ==================================================
router.patch(
  "/deposits/:id/review",
  protect,
  adminOnly,
  reviewDeposit
);

// ==================================================
// GET /api/admin/kyc/pending
// Admin ke pending KYC requests
// ==================================================
router.get(
  "/kyc/pending",
  protect,
  adminOnly,
  getPendingKyc
);

// ==================================================
// GET /api/admin/kyc/records?status=all|pending|approved|rejected
// All PAN / Aadhaar KYC records, including already reviewed ones.
// Viewing a document never changes its status.
// ==================================================
router.get(
  "/kyc/records",
  protect,
  adminOnly,
  getKycRecords
);

// ==================================================
// GET /api/admin/kyc/:id/history
// Audit history (submissions, decisions, document views) for a client.
// ==================================================
router.get(
  "/kyc/:id/history",
  protect,
  adminOnly,
  getKycHistory
);

// ==================================================
// GET /api/admin/kyc/:id/document/:type
// Admin client ka PAN/Aadhaar image securely dekh sakta hai.
// type = pan ya aadhaar. Sirf admin, public URL nahi.
// ==================================================
router.get(
  "/kyc/:id/document/:type",
  protect,
  adminOnly,
  getKycDocument
);

// ==================================================
// PATCH /api/admin/kyc/:id/review
// KYC approve ya reject karna
// ==================================================
router.patch(
  "/kyc/:id/review",
  protect,
  adminOnly,
  reviewKyc
);

// ==================================================
// GET /api/admin/bank-kyc/pending
// Admin ke pending bank KYC requests
// ==================================================
router.get(
  "/bank-kyc/pending",
  protect,
  adminOnly,
  getPendingBankKyc
);

// ==================================================
// GET /api/admin/bank-kyc/records?status=all|pending|approved|rejected
// All bank KYC records, including already reviewed ones.
// ==================================================
router.get(
  "/bank-kyc/records",
  protect,
  adminOnly,
  getBankKycRecords
);

// ==================================================
// GET /api/admin/bank-kyc/:id/document
// Admin client ka bank proof securely dekh sakta hai.
// :id = user ID. Sirf admin, public URL nahi.
// ==================================================
router.get(
  "/bank-kyc/:id/document",
  protect,
  adminOnly,
  getAdminBankKycDocument
);

// ==================================================
// PATCH /api/admin/bank-kyc/:id/review
// Bank KYC approve ya reject karna
// ==================================================
router.patch(
  "/bank-kyc/:id/review",
  protect,
  adminOnly,
  reviewBankKyc
);



// ==================================================
// Positions (admin)
// GET   /api/admin/positions            all clients' positions
// POST  /api/admin/positions            record a position for a client
// PATCH /api/admin/positions/:id        edit an open position (with reason)
// GET   /api/admin/positions/:id/audit  who changed what, and when
// ==================================================
router.get("/positions", protect, adminOnly, listPositions);
router.post("/positions", protect, adminOnly, createPosition);
router.patch("/positions/:id", protect, adminOnly, updatePosition);
router.get("/positions/:id/audit", protect, adminOnly, getPositionAudit);

// Pending withdrawals list
router.get(
  "/withdrawals/pending",
  protect,
  adminOnly,
  getPendingWithdrawals
);

// Approve or reject a withdrawal
router.patch(
  "/withdrawals/:id/review",
  protect,
  adminOnly,
  reviewWithdrawal
);

module.exports = router;