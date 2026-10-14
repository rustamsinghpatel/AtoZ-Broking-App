
const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");

// POST /api/funds/deposit
// Logged-in client deposit request submit karega.
const createDepositRequest = async (req, res, next) => {
  try {
    const amount = Number(req.body?.amount);
    const method = String(req.body?.method || "").trim();
    const referenceNumber = String(
      req.body?.referenceNumber || ""
    ).trim();

    // Amount validation
    if (!Number.isFinite(amount) || amount < 1) {
      throw new ApiError(
        400,
        "Minimum deposit amount is Rs. 1."
      );
    }

    if (!["UPI", "Bank Transfer", "Card"].includes(method)) {
      throw new ApiError(
        400,
        "Please select a valid deposit method."
      );
    }

    // Deposit request save karo; wallet abhi credit nahi hoga.
    const deposit = await Transaction.create({
      user: req.user._id,
      type: "deposit",
      amount,
      method,
      referenceNumber,
      status: "pending",
    });

    res.status(201).json({
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

module.exports = {
  createDepositRequest,
};
