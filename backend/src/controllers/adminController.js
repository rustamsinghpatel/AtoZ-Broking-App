const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const KycDocument = require("../models/KycDocument");
const ApiError = require("../utils/ApiError");
const Notification = require("../models/Notification");

const KYC_DOC_TYPES = ["pan", "aadhaar"];

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
// Documents ka sirf "uploaded hai ya nahi" bheja jaata hai.
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

    const ids = clients.map((client) => client._id);

    // Image data nahi laate, sirf kaun sa document hai.
    const docs = ids.length
      ? await KycDocument.find({ user: { $in: ids } })
          .select("user docType")
          .lean()
      : [];

    const docsByUser = {};

    docs.forEach((doc) => {
      const key = String(doc.user);

      if (!docsByUser[key]) {
        docsByUser[key] = { pan: false, aadhaar: false };
      }

      docsByUser[key][doc.docType] = true;
    });

    const result = clients.map((client) => ({
      ...client,
      documents: docsByUser[String(client._id)] || {
        pan: false,
        aadhaar: false,
      },
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      data: { clients: result },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// PATCH /api/admin/kyc/:id/review
// Admin KYC approve ya reject karega.
// Approve tabhi hoga jab PAN aur Aadhaar dono images hon.
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

    if (cleanReason.length > 300) {
      throw new ApiError(
        400,
        "Reason must be 300 characters or less."
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

    // Approve se pehle dono documents hone zaroori hain.
    if (status === "approved") {
      const uploadedCount = await KycDocument.countDocuments({
        user: client._id,
        docType: { $in: KYC_DOC_TYPES },
      });

      if (uploadedCount < KYC_DOC_TYPES.length) {
        throw new ApiError(
          400,
          "Both PAN and Aadhaar images must be uploaded before approval."
        );
      }
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
// GET /api/admin/kyc/:id/document/:type
// Admin kisi client ka PAN/Aadhaar image dekh sakta hai.
// Image backend se stream hoti hai, public URL nahi hai.
// Route par protect + adminOnly lagana zaroori hai.
// ======================================================
const getKycDocument = async (req, res, next) => {
  try {
    const type = String(req.params.type || "").toLowerCase();

    if (!KYC_DOC_TYPES.includes(type)) {
      throw new ApiError(400, "Document type must be pan or aadhaar.");
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid client ID.");
    }

    // Sirf client accounts ke documents.
    const client = await User.findOne({
      _id: req.params.id,
      role: "client",
    }).select("_id");

    if (!client) {
      throw new ApiError(404, "Client not found.");
    }

    const doc = await KycDocument.findOne({
      user: client._id,
      docType: type,
    }).select("+data contentType");

    if (!doc) {
      throw new ApiError(404, "Document not found.");
    }

    res.set({
      "Content-Type": doc.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    });

    return res.status(200).send(doc.data);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/withdrawals/pending
// Admin ko pending withdrawal requests dikhata hai.
const getPendingWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Transaction.find({
      type: "withdrawal",
      status: "pending",
    })
      .populate("user", "clientId fullName email mobile")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: withdrawals.length,
      data: { withdrawals },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/withdrawals/:id/review
// Admin withdrawal ko approve ya reject karega.
const reviewWithdrawal = async (req, res, next) => {
  let session;

  try {
    const { status, reason, adminNote } = req.body || {};
    const note = String(reason || adminNote || "").trim();
    const withdrawalId = req.params.id;

    if (!["approved", "rejected"].includes(status)) {
      throw new ApiError(
        400,
        "Status must be approved or rejected."
      );
    }

    if (
      status === "rejected" &&
      !note
    ) {
      throw new ApiError(
        400,
        "Please provide a reason for rejecting the withdrawal."
      );
    }

    if (!mongoose.isValidObjectId(withdrawalId)) {
      throw new ApiError(400, "Invalid withdrawal ID.");
    }

    session = await mongoose.startSession();

    let reviewedWithdrawal;
    let clientId;

    // Wallet aur transaction status ko ek atomic transaction mein update karo.
    await session.withTransaction(async () => {
      const withdrawal = await Transaction.findOne({
        _id: withdrawalId,
        type: "withdrawal",
        status: "pending",
      }).session(session);

      if (!withdrawal) {
        throw new ApiError(
          404,
          "Pending withdrawal not found. It may already be reviewed."
        );
      }

      const user = await User.findById(withdrawal.user)
        .session(session);

      if (!user) {
        throw new ApiError(404, "Withdrawal client not found.");
      }

      // Sirf approval par wallet balance deduct hoga.
      if (status === "approved") {
        const balance = Number(user.walletBalance || 0);

        if (balance < withdrawal.amount) {
          throw new ApiError(
            400,
            "Insufficient wallet balance to approve this withdrawal."
          );
        }

        user.walletBalance = balance - withdrawal.amount;
        await user.save({ session });
      }

      withdrawal.status = status;
      withdrawal.adminNote = note;
      withdrawal.reviewedBy = req.user._id;
      withdrawal.reviewedAt = new Date();

      await withdrawal.save({ session });

      reviewedWithdrawal = {
        id: withdrawal._id.toString(),
        amount: withdrawal.amount,
        method: withdrawal.method,
        status: withdrawal.status,
      };

      clientId = user._id;
    });

    // Notification failure se successful review fail nahi hona chahiye.
    try {
      await Notification.create({
        user: clientId,
        title:
          status === "approved"
            ? "Withdrawal approved"
            : "Withdrawal rejected",
        message:
          status === "approved"
            ? `Your withdrawal request of ₹${reviewedWithdrawal.amount.toLocaleString("en-IN")} has been approved.`
            : `Your withdrawal request of ₹${reviewedWithdrawal.amount.toLocaleString("en-IN")} was rejected. Reason: ${note}`,
        type: "Transaction",
        read: false,
      });
    } catch (notificationError) {
      console.error(
        "Withdrawal notification creation failed:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,
      message:
        status === "approved"
          ? "Withdrawal approved and wallet balance updated."
          : "Withdrawal rejected.",
      data: { withdrawal: reviewedWithdrawal },
    });
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      await session.endSession();
    }
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
  getKycDocument,

  // Withdrawal review
  getPendingWithdrawals,
  reviewWithdrawal,
};