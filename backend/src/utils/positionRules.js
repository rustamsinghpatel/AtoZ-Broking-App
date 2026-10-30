// Pure helpers for admin-recorded positions. No database access here, so the
// rules can be unit tested without MongoDB.

const PRODUCTS = ["CNC", "MIS", "NRML"];
const SIDES = ["BUY", "SELL"];

const MAX_QUANTITY = 10000000;
const MAX_PRICE = 10000000;

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Open position P&L from the stored prices. Nothing is estimated: it only
// uses the average price and last price that were actually stored.
const computeOpenPnl = (p) => {
  const quantity = Number(p.quantity || 0);
  const averagePrice = Number(p.averagePrice || 0);
  const ltp = Number(p.ltp || 0);
  return round2((ltp - averagePrice) * quantity * (p.side === "SELL" ? -1 : 1));
};

const hasAtMost4Decimals = (n) => Math.abs(n * 10000 - Math.round(n * 10000)) < 1e-6;

const toNumber = (value) => {
  if (value === null || value === undefined) return NaN;
  if (typeof value === "string" && value.trim() === "") return NaN;
  return Number(value);
};

const checkQuantity = (value, errors) => {
  const n = toNumber(value);
  if (!Number.isInteger(n) || n < 1 || n > MAX_QUANTITY) {
    errors.push(`Quantity must be a whole number between 1 and ${MAX_QUANTITY}`);
    return null;
  }
  return n;
};

const checkPrice = (value, label, errors) => {
  const n = toNumber(value);
  if (!Number.isFinite(n) || n <= 0 || n > MAX_PRICE || !hasAtMost4Decimals(n)) {
    errors.push(
      `${label} must be a number greater than 0 (up to 4 decimal places) and at most ${MAX_PRICE}`
    );
    return null;
  }
  return n;
};

const checkReason = (value, label, errors) => {
  const text = String(value ?? "").trim();
  if (text.length < 5 || text.length > 300) {
    errors.push(`${label} must be between 5 and 300 characters`);
    return "";
  }
  return text;
};

// Validates the body of POST /api/admin/positions.
// Returns { errors: string[], value: {...} }.
const validateNewPosition = (body = {}) => {
  const errors = [];

  const symbol = String(body.symbol ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9&._-]{0,19}$/.test(symbol)) {
    errors.push(
      "Instrument symbol is required (letters, numbers, & . _ - only, up to 20 characters)"
    );
  }

  const product = String(body.product ?? "CNC").trim().toUpperCase();
  if (!PRODUCTS.includes(product)) errors.push("Product must be CNC, MIS or NRML");

  const side = String(body.side ?? "BUY").trim().toUpperCase();
  if (!SIDES.includes(side)) errors.push("Side must be BUY or SELL");

  const quantity = checkQuantity(body.quantity, errors);
  const averagePrice = checkPrice(body.averagePrice, "Average price", errors);
  const ltp = checkPrice(body.ltp, "Last traded price", errors);
  const note = checkReason(body.note, "Reason / reference", errors);

  const clientRequestId = String(body.clientRequestId ?? "").trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(clientRequestId)) {
    errors.push("A valid request id is required");
  }

  return {
    errors,
    value: { symbol, product, side, quantity, averagePrice, ltp, note, clientRequestId },
  };
};

const EDITABLE_FIELDS = ["quantity", "averagePrice", "ltp", "product", "note"];

// Validates the body of PATCH /api/admin/positions/:id and works out which
// fields really change compared with the stored position.
// Returns { errors, updates, changes: [{field, from, to}], reason }.
const validatePositionUpdate = (body = {}, current = {}) => {
  const errors = [];
  const updates = {};

  if (body.quantity !== undefined) {
    const v = checkQuantity(body.quantity, errors);
    if (v !== null) updates.quantity = v;
  }
  if (body.averagePrice !== undefined) {
    const v = checkPrice(body.averagePrice, "Average price", errors);
    if (v !== null) updates.averagePrice = v;
  }
  if (body.ltp !== undefined) {
    const v = checkPrice(body.ltp, "Last traded price", errors);
    if (v !== null) updates.ltp = v;
  }
  if (body.product !== undefined) {
    const v = String(body.product).trim().toUpperCase();
    if (!PRODUCTS.includes(v)) errors.push("Product must be CNC, MIS or NRML");
    else updates.product = v;
  }
  if (body.note !== undefined) {
    const v = String(body.note ?? "").trim();
    if (v.length > 300) errors.push("Note must be 300 characters or less");
    else updates.note = v;
  }

  const reason = checkReason(body.reason, "Reason for the change", errors);

  const changes = [];
  EDITABLE_FIELDS.forEach((field) => {
    if (updates[field] === undefined) return;
    const before = current[field] === undefined ? null : current[field];
    if (before !== updates[field]) {
      changes.push({ field, from: before, to: updates[field] });
    }
  });

  if (errors.length === 0 && changes.length === 0) {
    errors.push("No changes were made");
  }

  return { errors, updates, changes, reason };
};

module.exports = {
  PRODUCTS,
  SIDES,
  round2,
  computeOpenPnl,
  validateNewPosition,
  validatePositionUpdate,
};
