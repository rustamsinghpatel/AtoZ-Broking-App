
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

// GET /api/admin/deposits/pending
// Admin pending deposit requests dekh sakta hai.
const getPendingDeposits = async (req, res, next) => {
  try {
    const deposits = await Transaction.find({
      type: "deposit",
      status: "pending",
    })
      .populate("user", "clientId fullName email mobile")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: deposits.length,
      data: { deposits },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/deposits/:id/review
// Admin payment verify karke deposit approve ya reject karega.
const reviewDeposit = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { status, adminNote } = req.body || {};

    if (!["approved", "rejected"].includes(status)) {
      throw new ApiError(
        400,
        "Invalid status. Use approved or rejected."
      );
    }

    const note = String(adminNote || "").trim();

    if (status === "rejected" && !note) {
      throw new ApiError(
        400,
        "Rejection reason is required."
      );
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid deposit request ID.");
    }

    let reviewedDeposit = null;

    // Transaction record aur wallet update ek saath commit honge.
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

      if (status === "approved") {
        // Sirf ek baar wallet mein amount add karo.
        const walletUpdate = await User.updateOne(
          { _id: deposit.user },
          { $inc: { walletBalance: deposit.amount } },
          { session }
        );

        if (walletUpdate.matchedCount !== 1) {
          throw new ApiError(404, "Deposit client not found.");
        }
      }

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

    res.status(200).json({
      success: true,
      message:
        status === "approved"
          ? "Deposit approved and wallet credited."
          : "Deposit rejected.",
      data: { deposit: reviewedDeposit },
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getPendingDeposits,
  reviewDeposit,
};
