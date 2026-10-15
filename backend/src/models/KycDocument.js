
const mongoose = require("mongoose");

const kycDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Identity KYC aur Bank KYC alag documents rahenge.
    docType: {
      type: String,
      enum: ["pan", "aadhaar", "bank"],
      required: true,
    },

    // Image private database storage mein rahegi.
    // Public API response mein image data return nahi hoga.
    data: {
      type: Buffer,
      required: true,
      select: false,
    },

    contentType: {
      type: String,
      enum: ["image/jpeg", "image/png", "image/webp"],
      required: true,
    },

    size: {
      type: Number,
      required: true,
      min: 1,
      max: 2 * 1024 * 1024,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        delete ret.data;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Ek user ke liye har document type ka ek current record.
// Bank proof replace karne par usi record ko update kar sakte hain.
kycDocumentSchema.index(
  { user: 1, docType: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "KycDocument",
  kycDocumentSchema
);
