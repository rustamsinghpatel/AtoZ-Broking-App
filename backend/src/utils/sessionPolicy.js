// Session lifetime policy.
//
// Why this file exists: the JWT lifetime used to come straight from the
// JWT_EXPIRES_IN environment variable. If that variable was set to a short
// value on the host (e.g. "15m" or "1h"), users were logged out repeatedly
// and nothing in the code prevented it. This module parses the configured
// value and enforces a minimum, so a mis-set variable can never silently
// shorten a session below the policy.
//
// Environment variables (all optional):
//   JWT_EXPIRES_IN        client session lifetime, default "12h"
//   ADMIN_JWT_EXPIRES_IN  admin session lifetime,  default "8h"
//   SESSION_MIN_HOURS     enforced minimum in hours, default 8

const DEFAULT_MIN_HOURS = 8;
const DEFAULTS = { client: "12h", admin: "8h" };

const UNIT_SECONDS = { s: 1, m: 60, h: 3600, d: 86400 };

// Accepts "30m", "8h", "1d", "3600s" or a plain number of seconds ("28800").
// Returns seconds, or null when the value cannot be understood.
const parseDurationToSeconds = (value) => {
  if (value === undefined || value === null) return null;

  const text = String(value).trim().toLowerCase();
  if (!text) return null;

  if (/^\d+$/.test(text)) {
    const seconds = Number(text);
    return seconds > 0 ? seconds : null;
  }

  const match = /^(\d+(?:\.\d+)?)\s*([smhd])$/.exec(text);
  if (!match) return null;

  const seconds = Math.round(Number(match[1]) * UNIT_SECONDS[match[2]]);
  return seconds > 0 ? seconds : null;
};

const getMinSeconds = (env = process.env) => {
  const hours = Number(env.SESSION_MIN_HOURS);
  const safeHours = Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_MIN_HOURS;
  return Math.round(safeHours * 3600);
};

// Returns { seconds, raised, invalid } for a role ("admin" or "client").
const getSessionLifetime = (role, env = process.env) => {
  const isAdmin = role === "admin";
  const configured = isAdmin ? env.ADMIN_JWT_EXPIRES_IN : env.JWT_EXPIRES_IN;
  const fallback = parseDurationToSeconds(isAdmin ? DEFAULTS.admin : DEFAULTS.client);
  const min = getMinSeconds(env);

  const parsed = parseDurationToSeconds(configured);
  const invalid = configured !== undefined && configured !== "" && parsed === null;

  let seconds = parsed ?? fallback;
  let raised = false;

  if (seconds < min) {
    seconds = min;
    raised = true;
  }

  return { seconds, raised, invalid };
};

// Logs a one-time startup warning if the environment would have produced a
// session shorter than the policy (or an unreadable value).
const warnAboutSessionConfig = (env = process.env, log = console.warn) => {
  ["client", "admin"].forEach((role) => {
    const { raised, invalid } = getSessionLifetime(role, env);
    const name = role === "admin" ? "ADMIN_JWT_EXPIRES_IN" : "JWT_EXPIRES_IN";

    if (invalid) {
      log(`[session] ${name} is not a valid duration; using the default for ${role}.`);
    }
    if (raised) {
      log(
        `[session] ${name} is shorter than the ${getMinSeconds(env) / 3600}h minimum; ` +
          `${role} sessions will last ${getMinSeconds(env) / 3600}h.`
      );
    }
  });
};

module.exports = {
  parseDurationToSeconds,
  getSessionLifetime,
  warnAboutSessionConfig,
};
