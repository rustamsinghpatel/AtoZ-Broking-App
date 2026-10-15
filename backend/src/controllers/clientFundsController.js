const Transaction = require("../models/Transaction");
const User = require("../models/User");

const getMyFunds = async (req, res, next) => {
  try {
    // Logged-in client ka wallet balance
    const user = await User.findById(req.user._id)
      .select("walletBalance")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Sirf isi logged-in client ki transactions
    const transactions = await Transaction.find({
      user: req.user._id,
      type: { $in: ["deposit", "withdrawal"] },
    })
      .select(
        "type amount method referenceNumber status adminNote createdAt reviewedAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const formattedTransactions = transactions.map((tx) => ({
      id: String(tx._id),
      date: tx.createdAt,
      type: tx.type === "deposit" ? "Deposit" : "Withdrawal",
      asset:
        tx.type === "deposit"
          ? `Funds Added (${tx.method})`
          : `Withdrawal (${tx.method})`,
      qty: null,
      amount: tx.amount,
      status:
        tx.status === "approved"
          ? "Completed"
          : tx.status === "pending"
            ? "Pending"
            : "Rejected",
      referenceNumber: tx.referenceNumber || "",
      adminNote: tx.adminNote || "",
    }));

    return res.status(200).json({
      success: true,
      data: {
        walletBalance: Number(user.walletBalance || 0),
        transactions: formattedTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyFunds };