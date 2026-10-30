const test = require("node:test");
const assert = require("node:assert/strict");
const {
  computeOpenPnl,
  validateNewPosition,
  validatePositionUpdate,
} = require("../src/utils/positionRules");

const valid = {
  symbol: " reliance ",
  product: "cnc",
  side: "buy",
  quantity: "10",
  averagePrice: "2500.5",
  ltp: 2510,
  note: "Client reported trade, ref 123",
  clientRequestId: "abcd1234-efgh",
};

test("accepts a valid position and normalises fields", () => {
  const { errors, value } = validateNewPosition(valid);
  assert.deepEqual(errors, []);
  assert.equal(value.symbol, "RELIANCE");
  assert.equal(value.product, "CNC");
  assert.equal(value.side, "BUY");
  assert.equal(value.quantity, 10);
  assert.equal(value.averagePrice, 2500.5);
});

test("rejects bad quantity, price, symbol, product, side", () => {
  const cases = [
    { quantity: 0 }, { quantity: -3 }, { quantity: 1.5 }, { quantity: "abc" },
    { quantity: "" }, { quantity: 10000001 },
    { averagePrice: 0 }, { averagePrice: -1 }, { averagePrice: "x" },
    { averagePrice: 1.123456 }, { averagePrice: Infinity }, { ltp: 0 },
    { symbol: "" }, { symbol: "BAD SYMBOL!" }, { symbol: "A".repeat(21) },
    { product: "XYZ" }, { side: "HOLD" }, { note: "" }, { note: "abc" },
    { clientRequestId: "" }, { clientRequestId: "short" },
  ];
  for (const bad of cases) {
    const { errors } = validateNewPosition({ ...valid, ...bad });
    assert.ok(errors.length > 0, JSON.stringify(bad));
  }
});

test("price is never invented: missing ltp is an error", () => {
  const { ltp, ...withoutLtp } = valid;
  assert.ok(validateNewPosition(withoutLtp).errors.length > 0);
});

test("P&L for BUY and SELL uses only stored prices", () => {
  assert.equal(computeOpenPnl({ quantity: 10, averagePrice: 100, ltp: 110, side: "BUY" }), 100);
  assert.equal(computeOpenPnl({ quantity: 10, averagePrice: 100, ltp: 110, side: "SELL" }), -100);
  assert.equal(computeOpenPnl({ quantity: 3, averagePrice: 0.1, ltp: 0.2, side: "BUY" }), 0.3);
});

test("update: detects real changes only, requires a reason", () => {
  const current = { quantity: 10, averagePrice: 100, ltp: 110, product: "CNC", note: "" };
  const r = validatePositionUpdate({ ltp: 120, quantity: 10, reason: "Price refresh" }, current);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.changes, [{ field: "ltp", from: 110, to: 120 }]);
  assert.equal(r.reason, "Price refresh");

  assert.ok(validatePositionUpdate({ ltp: 120 }, current).errors.length > 0); // no reason
  assert.ok(validatePositionUpdate({ ltp: 110, reason: "same value" }, current).errors.includes("No changes were made"));
  assert.ok(validatePositionUpdate({ ltp: -5, reason: "bad value" }, current).errors.length > 0);
  assert.ok(validatePositionUpdate({ product: "ZZZ", reason: "bad product" }, current).errors.length > 0);
});

test("update: side and symbol cannot be changed through this path", () => {
  const current = { quantity: 10, averagePrice: 100, ltp: 110, product: "CNC", note: "" };
  const r = validatePositionUpdate({ side: "SELL", symbol: "TCS", reason: "try to flip it" }, current);
  assert.deepEqual(r.updates, {});
  assert.ok(r.errors.includes("No changes were made"));
});
