
const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const {
  getPendingDeposits,
  reviewDeposit,
} = require("../controllers/adminController");

const router = express.Router();

// ==========================================
// GET /api/admin/clients
// Admin ko saare client records dikhane ke liye
// ==========================================
router.get("/clients", protect, adminOnly, async (req, res, next) => {
  try {
    const clients = await User.find({ role: "client" })
      .select(
        "clientId fullName email mobile status statusReason statusUpdatedAt createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: clients.length,
      data: { clients },
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// PATCH /api/admin/clients/:id/status
// Client ko active, pending ya inactive karne ke liye
// ==========================================
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
        throw new ApiError(404, "Client not found");
      }

      client.status = status;
      client.statusReason = status === "inactive" ? cleanReason : "";
      client.statusUpdatedAt = new Date();
      client.statusUpdatedBy = req.user._id;

      client.statusHistory.push({
        status,
        reason: status === "inactive" ? cleanReason : "",
        changedBy: req.user._id,
        changedAt: new Date(),
      });

      await client.save();

      res.status(200).json({
        success: true,
        message: `Client status updated to ${status}`,
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

// ==========================================
// GET /api/admin/deposits/pending
// Admin ke pending deposit requests
// ==========================================
router.get(
  "/deposits/pending",
  protect,
  adminOnly,
  getPendingDeposits
);

// ==========================================
// PATCH /api/admin/deposits/:id/review
// Deposit approve ya reject karne ke liye
// ==========================================
router.patch(
  "/deposits/:id/review",
  protect,
  adminOnly,
  reviewDeposit
);

module.exports = router;
