const mongoose = require("mongoose");

const Position = require("../models/Position");
const PositionAudit = require("../models/PositionAudit");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const {
  computeOpenPnl,
  validateNewPosition,
  validatePositionUpdate,
} = require("../utils/positionRules");

const NOT_AN_EXECUTION =
  "Recorded as a manual entry. No market order was placed and the client's wallet was not changed.";

// Shape returned to the admin UI.
const toAdminPosition = (p) => {
  const quantity = Number(p.quantity || 0);
  const averagePrice = Number(p.averagePrice || 0);
  const ltp = Number(p.ltp || 0);
  const owner = p.user && typeof p.user === "object" && p.user.clientId ? p.user : null;

  return {
    id: p._id,
    userId: owner ? owner._id : p.user,
    clientId: owner?.clientId || "",
    clientName: owner?.fullName || "",
    email: owner?.email || "",
    symbol: p.symbol,
    product: p.product,
    side: p.side,
    quantity,
    averagePrice,
    ltp,
    pnl: p.status === "open" ? computeOpenPnl(p) : Number(p.pnl || 0),
    status: p.status,
    buyPrice: p.buyPrice ?? null,
    sellPrice: p.sellPrice ?? null,
    closedAt: p.closedAt ?? null,
    source: p.source || "legacy",
    note: p.note || "",
    createdByName: p.createdBy?.fullName || "",
    updatedByName: p.updatedBy?.fullName || "",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

const writeAudit = async (entry) => {
  try {
    await PositionAudit.create(entry);
  } catch (error) {
    // The position change itself is already saved (and createdBy/updatedBy
    // are stored on the position). Log the full entry so nothing is lost.
    console.error("Position audit write FAILED:", error.message, JSON.stringify(entry));
  }
};

// GET /api/admin/positions
const listPositions = async (req, res, next) => {
  try {
    const records = await Position.find()
      .populate("user", "clientId fullName email")
      .populate("createdBy", "fullName")
      .populate("updatedBy", "fullName")
      .sort({ updatedAt: -1 })
      .lean();

    const positions = records.map(toAdminPosition);

    return res.status(200).json({
      success: true,
      count: positions.length,
      data: { positions },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/positions
// Records a position for a client. This is bookkeeping done by an admin: it
// does not place an order, does not fetch market prices and does not move
// money. Prices are exactly what the admin typed.
const createPosition = async (req, res, next) => {
  try {
    const body = req.body || {};

    if (!mongoose.isValidObjectId(body.userId)) {
      throw new ApiError(400, "Please select a valid client");
    }

    const { errors, value } = validateNewPosition(body);

    if (errors.length > 0) {
      throw new ApiError(400, errors[0], errors);
    }

    // Retry / double-click protection.
    const existing = await Position.findOne({
      clientRequestId: value.clientRequestId,
    })
      .populate("user", "clientId fullName email")
      .populate("createdBy", "fullName")
      .lean();

    if (existing) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "This position was already recorded.",
        data: { position: toAdminPosition(existing) },
      });
    }

    const client = await User.findOne({ _id: body.userId, role: "client" }).select(
      "_id clientId fullName email status"
    );

    if (!client) {
      throw new ApiError(404, "Client not found");
    }

    if (client.status !== "active") {
      throw new ApiError(
        409,
        "Positions can only be recorded for active clients"
      );
    }

    let created;

    try {
      created = await Position.create({
        user: client._id,
        symbol: value.symbol,
        product: value.product,
        side: value.side,
        quantity: value.quantity,
        averagePrice: value.averagePrice,
        ltp: value.ltp,
        status: "open",
        source: "admin_manual",
        note: value.note,
        createdBy: req.user._id,
        updatedBy: req.user._id,
        clientRequestId: value.clientRequestId,
      });
    } catch (error) {
      // Two identical requests racing each other: the unique index lets only
      // one win; return the winner instead of an error.
      if (error.code === 11000) {
        const winner = await Position.findOne({
          clientRequestId: value.clientRequestId,
        })
          .populate("user", "clientId fullName email")
          .populate("createdBy", "fullName")
          .lean();

        if (winner) {
          return res.status(200).json({
            success: true,
            duplicate: true,
            message: "This position was already recorded.",
            data: { position: toAdminPosition(winner) },
          });
        }
      }
      throw error;
    }

    await writeAudit({
      position: created._id,
      user: client._id,
      action: "created",
      changes: [
        { field: "symbol", from: null, to: value.symbol },
        { field: "product", from: null, to: value.product },
        { field: "side", from: null, to: value.side },
        { field: "quantity", from: null, to: value.quantity },
        { field: "averagePrice", from: null, to: value.averagePrice },
        { field: "ltp", from: null, to: value.ltp },
      ],
      reason: value.note,
      performedBy: req.user._id,
    });

    const plain = created.toObject();
    plain.user = client.toObject();
    plain.createdBy = { fullName: req.user.fullName };

    return res.status(201).json({
      success: true,
      message: `Position recorded for ${client.clientId}. ${NOT_AN_EXECUTION}`,
      data: { position: toAdminPosition(plain) },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/positions/:id
// Edits an OPEN position (quantity, prices, product, note). A reason is
// mandatory and the old/new values are saved to the audit history.
const updatePosition = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid position ID");
    }

    const current = await Position.findById(req.params.id);

    if (!current) {
      throw new ApiError(404, "Position not found");
    }

    if (current.status !== "open") {
      throw new ApiError(409, "Only open positions can be edited");
    }

    const { errors, updates, changes, reason } = validatePositionUpdate(
      req.body || {},
      current.toObject()
    );

    if (errors.length > 0) {
      throw new ApiError(400, errors[0], errors);
    }

    // Only applies if nobody changed the position since we read it.
    const saved = await Position.findOneAndUpdate(
      { _id: current._id, status: "open", updatedAt: current.updatedAt },
      { $set: { ...updates, updatedBy: req.user._id } },
      { new: true }
    )
      .populate("user", "clientId fullName email")
      .populate("createdBy", "fullName")
      .populate("updatedBy", "fullName")
      .lean();

    if (!saved) {
      throw new ApiError(
        409,
        "This position was changed by someone else. Reload and try again."
      );
    }

    await writeAudit({
      position: current._id,
      user: current.user,
      action: "updated",
      changes,
      reason,
      performedBy: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Position updated.",
      data: { position: toAdminPosition(saved) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/positions/:id/audit
const getPositionAudit = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid position ID");
    }

    const events = await PositionAudit.find({ position: req.params.id })
      .populate("performedBy", "fullName clientId")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        events: events.map((e) => ({
          id: e._id,
          action: e.action,
          changes: e.changes || [],
          reason: e.reason || "",
          performedByName: e.performedBy?.fullName || "",
          createdAt: e.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPositions,
  createPosition,
  updatePosition,
  getPositionAudit,
};
