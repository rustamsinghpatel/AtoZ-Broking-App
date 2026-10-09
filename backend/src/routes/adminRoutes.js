
const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const router = express.Router();

// GET /api/admin/clients
// Admin can view all registered clients.
router.get("/clients", protect, adminOnly, async (req, res, next) => {
  try {
    const clients = await User.find({ role: "client" })
      .select(
        "clientId fullName email mobile status statusReason statusUpdatedAt createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: clients.length,
      data: { clients },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/clients/:id/status
// Admin can approve, deactivate, or reactivate a client.
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

      // Keep a history of status changes for auditing.
      client.statusHistory.push({
        status,
        reason: status === "inactive" ? cleanReason : "",
        changedBy: req.user._id,
        changedAt: new Date(),
      });

      await client.save();

      res.json({
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

module.exports = router;