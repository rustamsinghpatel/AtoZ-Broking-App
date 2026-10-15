const express = require("express");
const Position = require("../models/Position");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/positions  -> logged-in user ki open positions + closed trades
router.get("/", protect, async (req, res) => {
  try {
    const records = await Position.find({ user: req.user._id }).sort({
      updatedAt: -1,
    });

    const open = records
      .filter((p) => p.status === "open")
      .map((p) => ({
        id: p._id,
        symbol: p.symbol,
        product: p.product,
        side: p.side,
        quantity: p.quantity,
        averagePrice: p.averagePrice,
        ltp: p.ltp,
        pnl:
          (p.ltp - p.averagePrice) * p.quantity * (p.side === "SELL" ? -1 : 1),
      }));

    const closed = records
      .filter((p) => p.status === "closed")
      .map((p) => ({
        id: p._id,
        symbol: p.symbol,
        product: p.product,
        quantity: p.quantity,
        buyPrice: p.buyPrice,
        sellPrice: p.sellPrice,
        pnl: p.pnl,
        closedAt: p.closedAt,
      }));

    res.json({ success: true, data: { open, closed } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load positions.",
    });
  }
});

module.exports = router;