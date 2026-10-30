const ApiError = require("../utils/ApiError");

// Minimal in-memory limiter for sensitive actions (e.g. password change).
// Counts FAILED attempts per user id inside a rolling window.
//
// Limitation: memory is per server process, so with several instances each
// keeps its own counter, and a restart resets it. Good enough to stop
// brute-forcing the current password from a stolen session on one instance;
// use a shared store (e.g. Redis) if you scale out.
const createAttemptLimiter = ({ maxFailures = 5, windowMs = 15 * 60 * 1000 } = {}) => {
  const failures = new Map(); // key -> [timestamps]

  const recent = (key, now) => {
    const list = (failures.get(key) || []).filter((t) => now - t < windowMs);
    if (list.length) failures.set(key, list);
    else failures.delete(key);
    return list;
  };

  return {
    // Throws 429 if the key is currently blocked.
    check(key, now = Date.now()) {
      const list = recent(key, now);

      if (list.length >= maxFailures) {
        const retryMinutes = Math.max(
          1,
          Math.ceil((windowMs - (now - list[0])) / 60000)
        );
        throw new ApiError(
          429,
          `Too many failed attempts. Try again in ${retryMinutes} minute(s).`
        );
      }
    },
    fail(key, now = Date.now()) {
      const list = recent(key, now);
      list.push(now);
      failures.set(key, list);
    },
    reset(key) {
      failures.delete(key);
    },
  };
};

module.exports = { createAttemptLimiter };
