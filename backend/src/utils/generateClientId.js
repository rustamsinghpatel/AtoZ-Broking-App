const Counter = require("../models/Counter");

// Atomically increments the counter and builds the Client ID.
// First call: seq = 1 -> ATOZ10001, then ATOZ10002, and so on.
// $inc is atomic in MongoDB, so two simultaneous signups never get the same number.
const generateClientId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: "clientId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `ATOZ${10000 + counter.seq}`;
};

module.exports = generateClientId;
