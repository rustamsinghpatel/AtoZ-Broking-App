
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const generateClientId = require("../utils/generateClientId");

async function createAdmin() {
  try {
    const {
      MONGODB_URI,
      ADMIN_NAME,
      ADMIN_EMAIL,
      ADMIN_MOBILE,
      ADMIN_PASSWORD,
    } = process.env;

    // Step 1: Check required environment variables.
    if (
      !MONGODB_URI ||
      !ADMIN_NAME ||
      !ADMIN_EMAIL ||
      !ADMIN_MOBILE ||
      !ADMIN_PASSWORD
    ) {
      throw new Error(
        "MONGODB_URI aur ADMIN_NAME, ADMIN_EMAIL, ADMIN_MOBILE, ADMIN_PASSWORD backend/.env mein set karo."
      );
    }

    // Step 2: Check admin password length.
    if (ADMIN_PASSWORD.length < 12) {
      throw new Error(
        "Admin password kam se kam 12 characters ka rakho."
      );
    }

    // Step 3: Connect to MongoDB.
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected.");

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const mobile = ADMIN_MOBILE.trim();

    // Step 4: Find an existing account by email or mobile.
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      // Never silently convert a client into an admin.
      if (existingUser.role !== "admin") {
        throw new Error(
          "Ye email ya mobile pehle se client account mein hai. Existing client ko automatically Admin nahi banaya."
        );
      }

      // Existing admin: ensure the account is active.
      existingUser.status = "active";
      existingUser.statusReason = "";
      existingUser.statusUpdatedAt = new Date();

      await existingUser.save();

      console.log("Existing Admin account active kar diya gaya.");
      console.log("Admin Client ID:", existingUser.clientId);
      console.log("Admin Email:", existingUser.email);

      return;
    }

    // Step 5: Generate a unique Client ID.
    const clientId = await generateClientId();

    // Step 6: Create a new active admin.
    const admin = await User.create({
      clientId,
      fullName: ADMIN_NAME.trim(),
      email,
      mobile,
      password: ADMIN_PASSWORD,
      role: "admin",
      status: "active",
      statusReason: "",
      statusUpdatedAt: new Date(),
    });

    console.log("Admin account successfully created!");
    console.log("Admin Client ID:", admin.clientId);
    console.log("Admin Email:", admin.email);
    console.log("Admin status:", admin.status);
    console.log("Password .env mein hi rakha gaya hai.");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

createAdmin();