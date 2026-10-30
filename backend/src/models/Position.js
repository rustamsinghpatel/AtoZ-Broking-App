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

    // ---- Provenance (added for admin-recorded positions) ----
    // "legacy"       = rows that existed before this field (origin unknown)
    // "admin_manual" = recorded by an admin from the Admin panel. This is a
    //                  record keeping entry; it is NOT a market execution and
    //                  does not touch the client's wallet.
    source: {
      type: String,
      enum: ["legacy", "admin_manual"],
      default: "legacy",
    },
    note: { type: String, trim: true, default: "", maxlength: 300 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Idempotency key sent by the admin form so a double click or a retry
    // can never create the same position twice.
    clientRequestId: { type: String, trim: true, maxlength: 64 },
  },
  { timestamps: true }
);

positionSchema.index(
  { clientRequestId: 1 },
  { unique: true, partialFilterExpression: { clientRequestId: { $type: "string" } } }
);

module.exports = mongoose.model("Position", positionSchema);