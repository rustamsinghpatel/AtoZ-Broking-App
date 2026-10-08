
// A2Z Broking API Service Layer

// Mock data - these will remain temporary until their backend APIs are ready.
import { mockHoldings, mockPerformance } from "../data/mockPortfolio";
import { mockTransactions, mockReports } from "../data/mockTransactions";
import { mockNotifications } from "../data/mockNotifications";


// ---------------------------------------------------------
// Backend configuration
// ---------------------------------------------------------

const API_URL = "http://localhost:5000";


// ---------------------------------------------------------
// Get saved JWT token
// ---------------------------------------------------------

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


// ---------------------------------------------------------
// Common API request helper
// ---------------------------------------------------------

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};


// ---------------------------------------------------------
// Utility delay for mock APIs
// ---------------------------------------------------------

const delay = (data, ms = 600) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(structuredClone(data)), ms)
  );


// ---------------------------------------------------------
// Portfolio helper
// ---------------------------------------------------------

const enrich = (h) => {
  const invested = h.qty * h.avg;
  const current = h.qty * h.price;

  return {
    ...h,
    invested,
    current,
    pnl: current - invested,
    ret: ((current - invested) / invested) * 100,
  };
};


// =========================================================
// REAL BACKEND API
// =========================================================

// GET /api/auth/me
//
// This is now connected to the real backend.
// JWT token is automatically sent as:
//
// Authorization: Bearer <token>

export const getUser = async () => {
  const result = await apiRequest("/api/auth/me");

  return result.data.user;
};


// =========================================================
// MOCK APIs - TEMPORARY
// =========================================================

// GET /api/holdings
export const getHoldings = () =>
  delay(mockHoldings.map(enrich));


// GET /api/portfolio
export const getPortfolio = () => {
  const holdings = mockHoldings.map(enrich);

  const invested = holdings.reduce(
    (sum, h) => sum + h.invested,
    0
  );

  const current = holdings.reduce(
    (sum, h) => sum + h.current,
    0
  );

  const byType = holdings.reduce(
    (map, h) => ({
      ...map,
      [h.type]: (map[h.type] || 0) + h.current,
    }),
    {}
  );

  return delay({
    summary: {
      invested,
      current,
      returns: current - invested,
      returnPct: ((current - invested) / invested) * 100,
      todayChange: Math.round(current * 0.0045),
      todayPct: 0.45,
    },

    holdings,

    performance: mockPerformance,

    allocation: Object.entries(byType).map(
      ([name, value]) => ({
        name,
        value,
      })
    ),
  });
};


// GET /api/transactions
export const getTransactions = () =>
  delay(mockTransactions);


// GET /api/reports
export const getReports = () =>
  delay(mockReports, 300);


// =========================================================
// Notifications
// =========================================================

const READ_KEY = "a2z_read_notifications";

const readIds = () => {
  try {
    return JSON.parse(
      localStorage.getItem(READ_KEY) || "[]"
    );
  } catch {
    return [];
  }
};


// GET /api/notifications
export const getNotifications = () =>
  delay(
    mockNotifications.map((notification) => ({
      ...notification,

      read:
        notification.read ||
        readIds().includes(notification.id),
    })),
    300
  );


// PATCH /api/notifications/read
export const markNotificationsRead = (ids) => {
  localStorage.setItem(
    READ_KEY,
    JSON.stringify([
      ...new Set([
        ...readIds(),
        ...ids,
      ]),
    ])
  );
};
