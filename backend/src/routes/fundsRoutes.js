
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createDepositRequest } = require("../controllers/fundsController");

const router = express.Router();

// Client deposit request submit karega.
// JWT token zaroori hai.
router.post("/deposit", protect, createDepositRequest);

module.exports = router;
