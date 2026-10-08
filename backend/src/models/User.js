const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true, uppercase: true },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: { type: String, required: true, unique: true, trim: true },

    // select: false => the password is NOT returned by queries unless
    // we explicitly ask for it (we only do that during login).
    password: { type: String, required: true, select: false },

    role: { type: String, enum: ["client", "admin"], default: "client" },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Hash the password automatically before saving (only when it changed).
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper used at login: compares plain text with the stored hash.
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Safety net: even if a password slips into a user object,
// it is removed whenever the user is converted to JSON.
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
