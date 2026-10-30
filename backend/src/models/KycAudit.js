const mongoose = require("mongoose");

// Append-only history of KYC activity. Documents themselves stay in
// KycDocument / BankKyc; this collection records WHO did WHAT and WHEN.
// Records are never updated or deleted by the application.
const kycAuditSchema = new mongoose.Schema(
  {
    // The client the KYC belongs to.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // identity = PAN + Aadhaar, bank = bank account proof
    scope: {
      type: String,
      enum: ["identity", "bank"],
      required: true,
    },

    action: {
      type: String,
      enum: ["submitted", "approved", "rejected", "document_viewed"],
      required: true,
    },

    // Which document was opened (only for document_viewed).
    docType: {
      type: String,
      enum: ["pan", "aadhaar", "bank", ""],
      default: "",
    },

    previousStatus: { type: String, default: "" },
    newStatus: { type: String, default: "" },
    reason: { type: String, trim: true, default: "", maxlength: 300 },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    performedByRole: {
      type: String,
      enum: ["client", "admin", "system"],
      default: "system",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

kycAuditSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("KycAudit", kycAuditSchema);
