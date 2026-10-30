const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const Module = require("module");

// Run the REAL middleware with jsonwebtoken and the User model faked, so the
// token-invalidation rules can be tested without MongoDB.
let decodedToken;
let userRecord;

const origLoad = Module._load;
Module._load = function (request, parent, ...rest) {
  if (request === "jsonwebtoken") {
    return { verify: () => decodedToken };
  }
  if (request.endsWith("models/User")) {
    return { findById: async () => userRecord };
  }
  return origLoad.call(this, request, parent, ...rest);
};
const { protect } = require(path.resolve(__dirname, "../src/middleware/authMiddleware"));
Module._load = origLoad;

const run = (token = "tok") =>
  new Promise((resolve) => {
    const req = { headers: { authorization: `Bearer ${token}` } };
    protect(req, {}, (err) => resolve({ err, req }));
  });

test("valid token for a user without a password change passes", async () => {
  decodedToken = { id: "u1", iat: 1000 };
  userRecord = { _id: "u1", role: "client", status: "active", passwordChangedAt: null };
  const { err, req } = await run();
  assert.equal(err, undefined);
  assert.equal(req.user._id, "u1");
});

test("token issued BEFORE a password change is rejected with AUTH_PASSWORD_CHANGED", async () => {
  decodedToken = { id: "u1", iat: 1000 };
  userRecord = { _id: "u1", role: "client", status: "active", passwordChangedAt: new Date(2000 * 1000) };
  const { err } = await run();
  assert.equal(err.statusCode, 401);
  assert.equal(err.errorCode, "AUTH_PASSWORD_CHANGED");
});

test("token issued in the same second as the change (the fresh one) is accepted", async () => {
  decodedToken = { id: "u1", iat: 2000 };
  userRecord = { _id: "u1", role: "client", status: "active", passwordChangedAt: new Date(2000 * 1000 + 700) };
  const { err } = await run();
  assert.equal(err, undefined);
});

test("deleted user gets AUTH_USER_GONE", async () => {
  decodedToken = { id: "gone", iat: 1000 };
  userRecord = null;
  const { err } = await run();
  assert.equal(err.statusCode, 401);
  assert.equal(err.errorCode, "AUTH_USER_GONE");
});

test("missing header gets AUTH_MISSING", async () => {
  await new Promise((resolve) => {
    protect({ headers: {} }, {}, (err) => {
      assert.equal(err.errorCode, "AUTH_MISSING");
      resolve();
    });
  });
});
