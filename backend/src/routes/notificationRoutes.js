
const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    const data = notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      time: n.createdAt,
    }));

    res.json({
      success: true,
      data,
      unreadCount: data.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load notifications.",
    });
  }
});

// PATCH /api/notifications/read
router.patch("/read", protect, async (req, res) => {
  try {
    const { ids, all } = req.body || {};

    if (all === true) {
      await Notification.updateMany(
        { user: req.user._id, read: false },
        { $set: { read: true } }
      );
    } else {
      if (
        !Array.isArray(ids) ||
        ids.length === 0 ||
        ids.length > 200 ||
        !ids.every((id) => mongoose.isValidObjectId(id))
      ) {
        return res.status(400).json({
          success: false,
          message: "Provide valid notification IDs.",
        });
      }

      await Notification.updateMany(
        {
          _id: { $in: ids },
          user: req.user._id,
          read: false,
        },
        { $set: { read: true } }
      );
    }

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.json({
      success: true,
      message: "Notifications updated.",
      unreadCount,
    });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update notifications.",
    });
  }
});

module.exports = router;
