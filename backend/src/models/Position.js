const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symbol: { type: String, required: true, trim: true, uppercase: true },
    product: { type: String, enum: ["CNC", "MIS", "NRML"], default: "CNC" },
    side: { type: String, enum: ["BUY", "SELL"], default: "BUY" },
    quantity: { type: Number, required: true, min: 0 },
    averagePrice: { type: Number, required: true, min: 0 },
    ltp: { type: Number, default: 0 },

    status: { type: String, enum: ["open", "closed"], default: "open", index: true },

    // closed trade ke liye
    buyPrice: { type: Number },
    sellPrice: { type: Number },
    pnl: { type: Number, default: 0 },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Position", positionSchema);