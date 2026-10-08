// Basic email format check.
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Cleans a mobile number: removes spaces/dashes and a +91 / 91 / 0 prefix,
// so "+91 98765-43210" becomes "9876543210".
const normalizeMobile = (mobile) =>
  String(mobile || "")
    .replace(/[\s-]/g, "")
    .replace(/^(\+91|91|0)(?=\d{10}$)/, "");

// Indian mobile numbers: 10 digits starting with 6, 7, 8 or 9.
const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);

module.exports = { isValidEmail, normalizeMobile, isValidMobile };
