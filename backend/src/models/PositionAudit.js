const mongoose = require("mongoose");

// Append-only history of admin changes to positions: who, when, what changed.
const positionAuditSchema = new mongoose.Schema(
  {
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: true,
      index: true,
    },
    // The client who owns the position.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: { type: String, enum: ["created", "updated"], required: true },

    // [{ field, from, to }] - "from" is null for a newly created position.
    changes: [
      {
        _id: false,
        field: { type: String, required: true },
        from: { type: mongoose.Schema.Types.Mixed, default: null },
        to: { type: mongoose.Schema.Types.Mixed, default: null },
      },
    ],

    reason: { type: String, trim: true, default: "", maxlength: 300 },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

positionAuditSchema.index({ position: 1, createdAt: -1 });

module.exports = mongoose.model("PositionAudit", positionAuditSchema);
