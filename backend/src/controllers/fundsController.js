
const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const BankKyc = require("../models/BankKyc");

// POST /api/funds/deposit
// Client deposit request submit karega.
const createDepositRequest = async (req, res, next) => {
  try {
    const amount = Number(req.body?.amount);
    const method = String(req.body?.method || "").trim();
    const referenceNumber = String(
      req.body?.referenceNumber || ""
    ).trim();

    if (!Number.isFinite(amount) || amount < 1) {
      throw new ApiError(400, "Minimum deposit amount is Rs. 1.");
    }

    if (!["UPI", "Bank Transfer", "Card"].includes(method)) {
      throw new ApiError(400, "Please select a valid deposit method.");
    }

    const deposit = await Transaction.create({
      user: req.user._id,
      type: "deposit",
      amount,
      method,
      referenceNumber,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Deposit request submitted for admin approval.",
      data: {
        deposit: {
          _id: deposit._id,
          amount: deposit.amount,
          method: deposit.method,
          referenceNumber: deposit.referenceNumber,
          status: deposit.status,
          createdAt: deposit.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/funds/withdraw
// Client withdrawal request submit karega.
const createWithdrawalRequest = async (req, res, next) => {
  try {
    const amount = Number(req.body?.amount);
    const method = String(req.body?.method || "").trim();
    const referenceNumber = String(
      req.body?.referenceNumber || ""
    ).trim();

    // 1. Minimum withdrawal amount ₹500
    if (!Number.isFinite(amount) || amount < 500) {
      throw new ApiError(
        400,
        "Minimum withdrawal amount is Rs. 500."
      );
    }

    // 2. Valid withdrawal method
    if (!["UPI", "Bank Transfer"].includes(method)) {
      throw new ApiError(
        400,
        "Please select a valid withdrawal method."
      );
    }

    // 3. Bank KYC approved hona zaroori hai
    const bankKyc = await BankKyc.findOne({
      user: req.user._id,
    })
      .select("status")
      .lean();

    if (!bankKyc || bankKyc.status !== "approved") {
      throw new ApiError(
        400,
        "Please get your bank KYC approved before requesting a withdrawal."
      );
    }

    // 4. User aur wallet balance check
    const user = await User.findById(req.user._id)
      .select("walletBalance")
      .lean();

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const balance = Number(user.walletBalance || 0);

    if (amount > balance) {
      throw new ApiError(
        400,
        "Insufficient wallet balance."
      );
    }

    // 5. Request pending rahegi; bank transfer automatically nahi hoga
    const withdrawal = await Transaction.create({
      user: req.user._id,
      type: "withdrawal",
      amount,
      method,
      referenceNumber,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted for admin approval.",
      data: {
        withdrawal: {
          _id: withdrawal._id,
          amount: withdrawal.amount,
          method: withdrawal.method,
          referenceNumber: withdrawal.referenceNumber,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepositRequest,
  createWithdrawalRequest,
};
