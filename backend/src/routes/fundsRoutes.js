
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createDepositRequest } = require("../controllers/fundsController");
const { getMyFunds } = require("../controllers/clientFundsController");

const router = express.Router();

// Logged-in client ka wallet aur transaction history
router.get("/me", protect, getMyFunds);

// Existing deposit route
router.post("/deposit", protect, createDepositRequest);

module.exports = router;
