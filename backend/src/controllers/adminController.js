
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

// ======================================================
// GET /api/admin/deposits/pending
// Admin pending deposit requests dekh sakta hai.
// ======================================================
const getPendingDeposits = async (req, res, next) => {
  try {
    const deposits = await Transaction.find({
      type: "deposit",
      status: "pending",
    })
      .populate("user", "clientId fullName email mobile")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: deposits.length,
      data: { deposits },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// PATCH /api/admin/deposits/:id/review
// Admin deposit approve ya reject karega.
// Approve hone par wallet mein amount credit hoga.
// ======================================================
const reviewDeposit = async (req, res, next) => {
  let session;

  try {
    const { status, adminNote } = req.body || {};

    // Status validation
    if (!["approved", "rejected"].includes(status)) {
      throw new ApiError(
        400,
        "Invalid status. Use approved or rejected."
      );
    }

    const note = String(adminNote || "").trim();

    // Rejection reason mandatory
    if (status === "rejected" && !note) {
      throw new ApiError(
        400,
        "Rejection reason is required."
      );
    }

    // MongoDB ID validation
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid deposit request ID.");
    }

    // Start MongoDB session inside try
    session = await mongoose.startSession();

    let reviewedDeposit = null;

    // Deposit update and wallet credit must happen together.
    await session.withTransaction(async () => {
      const deposit = await Transaction.findOne({
        _id: req.params.id,
        type: "deposit",
        status: "pending",
      }).session(session);

      if (!deposit) {
        throw new ApiError(
          404,
          "Pending deposit not found or already reviewed."
        );
      }

      // Validate amount before crediting the wallet
      if (
        status === "approved" &&
        (!Number.isFinite(Number(deposit.amount)) ||
          Number(deposit.amount) <= 0)
      ) {
        throw new ApiError(
          400,
          "Deposit amount must be greater than zero."
        );
      }

      // Credit wallet only when deposit is approved
      if (status === "approved") {
        const walletUpdate = await User.updateOne(
          { _id: deposit.user },
          { $inc: { walletBalance: Number(deposit.amount) } },
          { session }
        );

        if (walletUpdate.matchedCount !== 1) {
          throw new ApiError(404, "Deposit client not found.");
        }
      }

      // Save review details
      deposit.status = status;
      deposit.adminNote = note;
      deposit.reviewedBy = req.user._id;
      deposit.reviewedAt = new Date();

      await deposit.save({ session });

      reviewedDeposit = {
        id: deposit._id,
        type: deposit.type,
        amount: deposit.amount,
        status: deposit.status,
        adminNote: deposit.adminNote,
        reviewedAt: deposit.reviewedAt,
      };
    });

    return res.status(200).json({
      success: true,
      message:
        status === "approved"
          ? "Deposit approved and wallet credited."
          : "Deposit rejected.",
      data: { deposit: reviewedDeposit },
    });
  } catch (error) {
    return next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// ======================================================
// GET /api/admin/kyc/pending
// Admin pending KYC requests dekh sakta hai.
// Sensitive full PAN/Aadhaar return nahi kiye jaate.
// ======================================================
const getPendingKyc = async (req, res, next) => {
  try {
    const clients = await User.find({
      role: "client",
      kycStatus: "pending",
    })
      .select(
        "_id clientId fullName email mobile kycStatus kycPanMasked kycAadhaarLast4 kycSubmittedAt"
      )
      .sort({ kycSubmittedAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: clients.length,
      data: { clients },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// PATCH /api/admin/kyc/:id/review
// Admin KYC approve ya reject karega.
// ======================================================
const reviewKyc = async (req, res, next) => {
  try {
    const { status, reason } = req.body || {};

    if (!["approved", "rejected"].includes(status)) {
      throw new ApiError(
        400,
        "KYC status must be approved or rejected."
      );
    }

    const cleanReason = String(reason || "").trim();

    if (status === "rejected" && !cleanReason) {
      throw new ApiError(
        400,
        "A reason is required when rejecting KYC."
      );
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid client ID.");
    }

    const client = await User.findOne({
      _id: req.params.id,
      role: "client",
    });

    if (!client) {
      throw new ApiError(404, "Client not found.");
    }

    if (client.kycStatus !== "pending") {
      throw new ApiError(
        409,
        "This KYC request is not pending."
      );
    }

    client.kycStatus = status;
    client.kycReviewedAt = new Date();
    client.kycReviewedBy = req.user._id;
    client.kycRejectionReason =
      status === "rejected" ? cleanReason : "";

    await client.save();

    return res.status(200).json({
      success: true,
      message: `KYC ${status} successfully.`,
      data: {
        clientId: client.clientId,
        kycStatus: client.kycStatus,
        kycReviewedAt: client.kycReviewedAt,
        kycRejectionReason: client.kycRejectionReason,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// Export controller functions
// ======================================================
module.exports = {
  getPendingDeposits,
  reviewDeposit,
  getPendingKyc,
  reviewKyc,
};
