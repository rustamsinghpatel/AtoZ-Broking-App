
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

async function migrateClientStatuses() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI backend/.env mein missing hai.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected.");

    // Keep all admin accounts active.
    const adminResult = await User.updateMany(
      { role: "admin" },
      {
        $set: {
          status: "active",
          statusReason: "",
        },
      }
    );

    // Existing clients without a status must await approval.
    const clientResult = await User.updateMany(
      {
        role: "client",
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: "" },
        ],
      },
      {
        $set: {
          status: "pending",
          statusReason: "",
          statusUpdatedAt: new Date(),
        },
      }
    );

    console.log("Admin accounts checked:", adminResult.modifiedCount);
    console.log("Client accounts set to pending:", clientResult.modifiedCount);

    const summary = await User.aggregate([
      {
        $group: {
          _id: {
            role: "$role",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.role": 1, "_id.status": 1 } },
    ]);

    console.log("Account status summary:");
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

migrateClientStatuses();