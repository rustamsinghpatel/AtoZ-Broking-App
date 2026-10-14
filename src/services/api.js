
/*
 * AtoZ Broking API Service Layer
 *
 * REAL BACKEND:
 * - Authentication / current user
 * - Profile update
 * - Password change
 * - KYC submission
 * - Admin pending KYC / review
 *
 * TEMPORARY MOCK DATA:
 * - Holdings
 * - Portfolio
 * - Transactions
 * - Reports
 * - Notifications
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

  if (!session) return null;

  try {
    const parsed = JSON.parse(session);
    return parsed.token || null;
  } catch (error) {
    console.error("Invalid AtoZ session:", error);
    return null;
  }
};

// --------------------------------------------------
// 3. Common API request helper
// Used by authentication, Admin and Signup APIs.
// --------------------------------------------------

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the server. Check your internet connection or backend availability."
    );
  }

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
    ret: invested
      ? ((current - invested) / invested) * 100
      : 0,
  };
};

// ==================================================
// 6. REAL BACKEND API
// ==================================================

// GET /api/auth/me
export const getUser = async () => {
  const result = await apiRequest("/api/auth/me");
  return result.data.user;
};

// PATCH /api/auth/profile
export const updateUserProfile = async (profileData) => {
  const result = await apiRequest("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });

  return result.data.user;
};

// PATCH /api/auth/password
export const changeUserPassword = async (passwordData) => {
  return apiRequest("/api/auth/password", {
    method: "PATCH",
    body: JSON.stringify(passwordData),
  });
};

// POST /api/auth/kyc
// Send masked PAN and Aadhaar last four digits only.
export const submitUserKyc = async (kycData) => {
  return apiRequest("/api/auth/kyc", {
    method: "POST",
    body: JSON.stringify(kycData),
  });
};

// GET /api/admin/kyc/pending
export const getPendingKyc = async () => {
  const result = await apiRequest("/api/admin/kyc/pending");
  return result.data.clients;
};

// PATCH /api/admin/kyc/:id/review
// userId must be the MongoDB _id expected by the backend route.
export const reviewUserKyc = async (
  userId,
  status,
  reason = ""
) => {
  if (!userId) {
    throw new Error("User ID is required to review KYC.");
  }

  return apiRequest(
    `/api/admin/kyc/${encodeURIComponent(userId)}/review`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    }
  );
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
    return JSON.parse(
      localStorage.getItem(READ_KEY) || "[]"
    );
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
