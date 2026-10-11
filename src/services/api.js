
/*
  A2Z Broking API Service Layer

  Real backend:
  - Authentication / current user

  Temporary mock data:
  - Holdings
  - Portfolio
  - Transactions
  - Reports
  - Notifications
*/

import { mockHoldings, mockPerformance } from "../data/mockPortfolio";
import {
  mockTransactions,
  mockReports,
} from "../data/mockTransactions";
import { mockNotifications } from "../data/mockNotifications";

// --------------------------------------------------
// 1. Backend URL
// --------------------------------------------------

const API_URL = "https://atoz-broking-app.onrender.com";

// --------------------------------------------------
// 2. Get saved login token
// --------------------------------------------------

const getToken = () => {
  const session =
    localStorage.getItem("a2z_session") ||
    sessionStorage.getItem("a2z_session");

  if (!session) {
    return null;
  }

  try {
    const parsed = JSON.parse(session);
    return parsed.token || null;
  } catch (error) {
    console.error("Invalid A2Z session:", error);
    return null;
  }
};

// --------------------------------------------------
// 3. Common API request helper
// Admin.jsx and Signup.jsx will use this function.
// --------------------------------------------------

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // Handle empty or non-JSON responses safely.
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      result.message || `Request failed (${response.status}).`
    );
  }

  return result;
};

// --------------------------------------------------
// 4. Utility for temporary mock APIs
// --------------------------------------------------

const delay = (data, ms = 600) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(structuredClone(data)), ms)
  );

// --------------------------------------------------
// 5. Portfolio calculation helper
// --------------------------------------------------

const enrich = (holding) => {
  const invested = holding.qty * holding.avg;
  const current = holding.qty * holding.price;

  return {
    ...holding,
    invested,
    current,
    pnl: current - invested,
    ret: invested ? ((current - invested) / invested) * 100 : 0,
  };
};

// ==================================================
// 6. REAL BACKEND API
// ==================================================

// GET /api/auth/me
// Returns the logged-in user using the saved JWT token.

export const getUser = async () => {
  const result = await apiRequest("/api/auth/me");
  return result.data.user;
};

// ==================================================
// 7. TEMPORARY MOCK APIs
// These are not connected to the backend yet.
// ==================================================

// Temporary holdings data
export const getHoldings = async () =>
  delay(mockHoldings.map(enrich));

// Temporary portfolio summary
export const getPortfolio = async () => {
  const holdings = mockHoldings.map(enrich);

  const invested = holdings.reduce(
    (sum, holding) => sum + holding.invested,
    0
  );

  const current = holdings.reduce(
    (sum, holding) => sum + holding.current,
    0
  );

  const byType = holdings.reduce(
    (map, holding) => ({
      ...map,
      [holding.type]:
        (map[holding.type] || 0) + holding.current,
    }),
    {}
  );

  return delay({
    summary: {
      invested,
      current,
      returns: current - invested,
      returnPct: invested
        ? ((current - invested) / invested) * 100
        : 0,
      todayChange: Math.round(current * 0.0045),
      todayPct: 0.45,
    },

    holdings,

    performance: mockPerformance,

    allocation: Object.entries(byType).map(([name, value]) => ({
      name,
      value,
    })),
  });
};

// Temporary transactions data
export const getTransactions = async () =>
  delay(mockTransactions);

// Temporary reports data
export const getReports = async () =>
  delay(mockReports, 300);

// ==================================================
// 8. TEMPORARY MOCK NOTIFICATIONS
// ==================================================

const READ_KEY = "a2z_read_notifications";

// Get IDs of notifications already marked as read.
const readIds = () => {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "[]");
  } catch {
    return [];
  }
};

// Temporary notifications list
export const getNotifications = async () =>
  delay(
    mockNotifications.map((notification) => ({
      ...notification,
      read:
        notification.read ||
        readIds().includes(notification.id),
    })),
    300
  );

// Mark notifications as read in browser storage.
export const markNotificationsRead = async (ids) => {
  const existingIds = readIds();

  localStorage.setItem(
    READ_KEY,
    JSON.stringify([...new Set([...existingIds, ...ids])])
  );
};
