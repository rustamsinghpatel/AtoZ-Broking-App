
const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  createDepositRequest,
  createWithdrawalRequest,
} = require("../controllers/fundsController");

const {
  getMyFunds,
} = require("../controllers/clientFundsController");

const router = express.Router();

// Wallet balance aur transaction history
router.get("/me", protect, getMyFunds);

// Deposit request
router.post("/deposit", protect, createDepositRequest);

// Withdrawal request
router.post("/withdraw", protect, createWithdrawalRequest);

module.exports = router;
