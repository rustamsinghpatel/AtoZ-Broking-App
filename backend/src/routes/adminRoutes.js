const Position = require("../models/Position");


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
} = require("../controllers/adminController");

const {
  getPendingBankKyc,
  getAdminBankKycDocument,
  reviewBankKyc,
} = require("../controllers/bankKycController");

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



/**
 * GET /api/admin/positions
 * Admin sabhi clients ki open aur closed positions dekh sakta hai.
 * Admin authentication required.
 */
router.get("/positions", protect, adminOnly, async (req, res, next) => {
  try {
    const records = await Position.find()
      .populate("user", "clientId fullName email")
      .sort({ updatedAt: -1 })
      .lean();

    const positions = records.map((p) => {
      const averagePrice = Number(p.averagePrice || 0);
      const ltp = Number(p.ltp || 0);
      const quantity = Number(p.quantity || 0);

      const pnl =
        (ltp - averagePrice) *
        quantity *
        (p.side === "SELL" ? -1 : 1);

      return {
        id: p._id,
        clientId: p.user?.clientId || "",
        clientName: p.user?.fullName || "",
        email: p.user?.email || "",
        symbol: p.symbol,
        product: p.product,
        side: p.side,
        quantity,
        averagePrice,
        ltp,
        pnl: p.status === "open" ? pnl : Number(p.pnl || 0),
        status: p.status,
        buyPrice: p.buyPrice ?? null,
        sellPrice: p.sellPrice ?? null,
        closedAt: p.closedAt ?? null,
        updatedAt: p.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: positions.length,
      data: { positions },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;