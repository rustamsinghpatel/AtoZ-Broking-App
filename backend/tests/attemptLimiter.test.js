const test = require("node:test");
const assert = require("node:assert/strict");
const { createAttemptLimiter } = require("../src/middleware/attemptLimiter");

test("blocks after max failures, per user, and recovers after the window", () => {
  const l = createAttemptLimiter({ maxFailures: 3, windowMs: 1000 });
  const t0 = 1_000_000;
  l.check("a", t0);
  l.fail("a", t0); l.fail("a", t0 + 1); l.fail("a", t0 + 2);
  assert.throws(() => l.check("a", t0 + 3), (e) => e.statusCode === 429);
  l.check("b", t0 + 3); // other users unaffected
  l.check("a", t0 + 1500); // window passed
});

test("reset clears failures", () => {
  const l = createAttemptLimiter({ maxFailures: 1, windowMs: 1000 });
  l.fail("a", 1);
  assert.throws(() => l.check("a", 2));
  l.reset("a");
  l.check("a", 3);
});
