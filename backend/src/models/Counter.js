const mongoose = require("mongoose");

// Stores running counters. We use one document with _id "clientId"
// so every new user gets the next number, even if two sign up at once.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model("Counter", counterSchema);
