
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Password database mein hash hokar save hoga.
    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["client", "admin"],
      default: "client",
    },

    // Client approval status.
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },

    // Inactive karne ya status change karne ka reason.
    statusReason: {
      type: String,
      trim: true,
      default: "",
    },

    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Status changes ka history record.
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "active", "inactive"],
          required: true,
        },

        reason: {
          type: String,
          trim: true,
          default: "",
        },

        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Password ko save karne se pehle hash karo.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Login ke samay password verify karna.
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Password aur internal version field response mein mat bhejo.
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
