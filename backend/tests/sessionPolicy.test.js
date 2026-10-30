const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseDurationToSeconds,
  getSessionLifetime,
} = require("../src/utils/sessionPolicy");

test("parses common duration formats", () => {
  assert.equal(parseDurationToSeconds("30m"), 1800);
  assert.equal(parseDurationToSeconds("8h"), 28800);
  assert.equal(parseDurationToSeconds("1d"), 86400);
  assert.equal(parseDurationToSeconds("3600s"), 3600);
  assert.equal(parseDurationToSeconds("28800"), 28800);
  assert.equal(parseDurationToSeconds("1.5h"), 5400);
});

test("rejects unreadable durations", () => {
  for (const bad of ["", "abc", "-5h", "0", "8 hours", "h8", null, undefined]) {
    assert.equal(parseDurationToSeconds(bad), null, String(bad));
  }
});

test("defaults: client 12h, admin 8h", () => {
  assert.equal(getSessionLifetime("client", {}).seconds, 12 * 3600);
  assert.equal(getSessionLifetime("admin", {}).seconds, 8 * 3600);
});

test("a too-short env value is raised to the 8h minimum (the logout bug)", () => {
  const env = { JWT_EXPIRES_IN: "15m", ADMIN_JWT_EXPIRES_IN: "1h" };
  const client = getSessionLifetime("client", env);
  const admin = getSessionLifetime("admin", env);
  assert.equal(client.seconds, 8 * 3600);
  assert.equal(client.raised, true);
  assert.equal(admin.seconds, 8 * 3600);
  assert.equal(admin.raised, true);
});

test("longer configured values are respected", () => {
  const env = { JWT_EXPIRES_IN: "7d", ADMIN_JWT_EXPIRES_IN: "10h" };
  assert.equal(getSessionLifetime("client", env).seconds, 7 * 86400);
  assert.equal(getSessionLifetime("admin", env).seconds, 10 * 3600);
});

test("invalid value falls back to the default and is flagged", () => {
  const r = getSessionLifetime("client", { JWT_EXPIRES_IN: "banana" });
  assert.equal(r.invalid, true);
  assert.equal(r.seconds, 12 * 3600);
});

test("SESSION_MIN_HOURS can raise the floor", () => {
  const r = getSessionLifetime("admin", { SESSION_MIN_HOURS: "10" });
  assert.equal(r.seconds, 10 * 3600);
});
