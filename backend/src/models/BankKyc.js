const mongoose = require("mongoose");

const bankKycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    accountHolder: { type: String, required: true, trim: true, maxlength: 100 },
    bankName: { type: String, required: true, trim: true, maxlength: 100 },

    // Poora account number kisi query mein tab tak nahi aata jab tak "+accountNumber" na maanga jaye.
    accountNumber: { type: String, required: true, select: false },
    accountLast4: { type: String, required: true },

    ifsc: { type: String, required: true, uppercase: true, trim: true },

    // Bank proof image (list/summary mein kabhi nahi aati)
    proofData: { type: Buffer, select: false },
    proofContentType: { type: String, default: "" },
    proofSize: { type: Number, default: 0 },
    proofUploadedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

bankKycSchema.index({ status: 1, submittedAt: 1 });

module.exports = mongoose.model("BankKyc", bankKycSchema);