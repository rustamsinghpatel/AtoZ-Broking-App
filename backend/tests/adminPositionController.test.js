const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const Module = require("module");

// The REAL controller runs; only mongoose and the models are faked.
const db = { positions: [], audits: [], client: null };
const chain = (value) => {
  const c = { populate: () => c, sort: () => c, lean: async () => value, then: (res, rej) => Promise.resolve(value).then(res, rej) };
  return c;
};
const FakePosition = {
  findOne: (q) => chain(db.positions.find((p) => p.clientRequestId === q.clientRequestId) || null),
  create: async (doc) => {
    const row = { _id: "pos" + (db.positions.length + 1), ...doc, toObject() { const { toObject, ...r } = this; return r; } };
    db.positions.push(row);
    return row;
  },
  findById: async (id) => {
    const p = db.positions.find((x) => x._id === id);
    return p && { ...p, toObject: () => ({ ...p }) };
  },
  findOneAndUpdate: (filter, update) => {
    const p = db.positions.find((x) => x._id === filter._id && x.status === filter.status);
    if (!p || (filter.updatedAt && String(p.updatedAt) !== String(filter.updatedAt))) return chain(null);
    Object.assign(p, update.$set);
    return chain({ ...p, user: { _id: "c1", clientId: "AZ1", fullName: "Test", email: "t@x" } });
  },
};
const FakeUser = {
  findOne: () => ({ select: async () => db.client }),
};
const FakeAudit = { create: async (e) => { db.audits.push(e); } };

const origLoad = Module._load;
Module._load = function (request, parent, ...rest) {
  if (request === "mongoose") return { isValidObjectId: (v) => /^[a-f0-9]{24}$/.test(String(v)) };
  if (request.endsWith("models/Position")) return FakePosition;
  if (request.endsWith("models/PositionAudit")) return FakeAudit;
  if (request.endsWith("models/User")) return FakeUser;
  return origLoad.call(this, request, parent, ...rest);
};
const ctl = require(path.resolve(__dirname, "../src/controllers/adminPositionController"));
Module._load = origLoad;

const CID = "a".repeat(24);
const body = (o = {}) => ({
  userId: CID, symbol: "tcs", side: "BUY", product: "CNC", quantity: 5,
  averagePrice: 3500, ltp: 3520, note: "Client confirmed trade by phone", clientRequestId: "req-12345678", ...o,
});
const call = async (fn, req) => {
  let status = 200, payload, error;
  const res = { status(c) { status = c; return this; }, json(p) { payload = p; return this; } };
  await fn({ user: { _id: "admin1", fullName: "Admin" }, params: {}, ...req }, res, (e) => { error = e; });
  return { status, payload, error };
};
const reset = () => { db.positions = []; db.audits = []; db.client = { _id: "c1", clientId: "AZ1", fullName: "Test", email: "t@x", status: "active", toObject() { return { _id: "c1", clientId: "AZ1", fullName: "Test", email: "t@x", status: "active" }; } }; };

test("creates a manual position, audits it, never touches a wallet", async () => {
  reset();
  const r = await call(ctl.createPosition, { body: body() });
  assert.equal(r.status, 201);
  assert.equal(db.positions[0].source, "admin_manual");
  assert.equal(db.positions[0].symbol, "TCS");
  assert.equal(db.positions[0].createdBy, "admin1");
  assert.equal(db.audits.length, 1);
  assert.equal(db.audits[0].action, "created");
  assert.match(r.payload.message, /No market order was placed/);
});

test("same clientRequestId twice creates ONE position", async () => {
  reset();
  await call(ctl.createPosition, { body: body() });
  const second = await call(ctl.createPosition, { body: body() });
  assert.equal(second.status, 200);
  assert.equal(second.payload.duplicate, true);
  assert.equal(db.positions.length, 1);
  assert.equal(db.audits.length, 1);
});

test("rejects invalid input and non-active / missing clients", async () => {
  reset();
  assert.equal((await call(ctl.createPosition, { body: body({ userId: "nope" }) })).error.statusCode, 400);
  assert.equal((await call(ctl.createPosition, { body: body({ quantity: 0 }) })).error.statusCode, 400);
  assert.equal((await call(ctl.createPosition, { body: body({ ltp: undefined }) })).error.statusCode, 400);
  db.client = { ...db.client, status: "inactive" };
  assert.equal((await call(ctl.createPosition, { body: body() })).error.statusCode, 409);
  db.client = null;
  assert.equal((await call(ctl.createPosition, { body: body({ clientRequestId: "req-other-1" }) })).error.statusCode, 404);
  assert.equal(db.positions.length, 0);
});

test("update records old/new values; closed positions and no-op edits are refused", async () => {
  reset();
  await call(ctl.createPosition, { body: body() });
  const id = db.positions[0]._id;
  const ok = await call(ctl.updatePosition, { params: { id: "b".repeat(24) }, body: {} });
  assert.equal(ok.error.statusCode, 404);

  db.positions[0]._id = "c".repeat(24);
  const pid = db.positions[0]._id;
  const upd = await call(ctl.updatePosition, { params: { id: pid }, body: { ltp: 3600, reason: "Price refresh" } });
  assert.equal(upd.status, 200);
  const audit = db.audits.at(-1);
  assert.equal(audit.action, "updated");
  assert.deepEqual(audit.changes, [{ field: "ltp", from: 3520, to: 3600 }]);
  assert.equal(audit.performedBy, "admin1");

  const noop = await call(ctl.updatePosition, { params: { id: pid }, body: { ltp: 3600, reason: "Same again" } });
  assert.equal(noop.error.statusCode, 400);

  db.positions[0].status = "closed";
  const closed = await call(ctl.updatePosition, { params: { id: pid }, body: { ltp: 1, reason: "Edit closed" } });
  assert.equal(closed.error.statusCode, 409);
});
