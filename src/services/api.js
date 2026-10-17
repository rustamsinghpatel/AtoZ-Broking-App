
/*
 * AtoZ Broking API Service Layer
 *
 * REAL BACKEND:
 * - Authentication / current user
 * - Profile update
 * - Password change
 * - PAN / Aadhaar KYC submission and review
 * - Bank KYC submission and admin review
 * - Secure KYC document viewing
 * - Wallet balance and deposit/withdrawal history
 *
 * TEMPORARY MOCK DATA:
 * - Holdings
 * - Portfolio
 * - Reports
 * - Notifications
 */

import { mockHoldings, mockPerformance } from "../data/mockPortfolio";
import { mockReports } from "../data/mockTransactions";


// ==================================================
// 1. BACKEND URL
// ==================================================

// Set VITE_API_URL in a .env file in the project root to point at another
// backend, e.g. VITE_API_URL=http://localhost:5000/api  (restart `npm run dev`).
// A trailing "/api" is stripped because every endpoint below already starts with it.
const DEFAULT_API_URL = "https://atoz-broking-app.onrender.com";

export const API_URL = String(import.meta.env.VITE_API_URL || DEFAULT_API_URL)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

// ==================================================
// 1B. SESSION EXPIRY
// When the server rejects our token (expired, invalid, account removed),
// clear the saved session and tell AuthContext so the app logs out.
// ==================================================

export const SESSION_KEY = "atoz_session";
export const SESSION_EXPIRED_EVENT = "atoz:session-expired";

// These endpoints return 401 for a wrong password, not an expired session.
const NOT_SESSION_401 = ["/api/auth/password"];

const handleUnauthorized = (status, hadToken, endpoint = "") => {
  if (status !== 401 || !hadToken) return;
  if (NOT_SESSION_401.some((path) => endpoint.startsWith(path))) return;

  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

// ==================================================
// 2. GET SAVED LOGIN TOKEN
// ==================================================

const getToken = () => {
  const session =
    localStorage.getItem(SESSION_KEY) ||
    sessionStorage.getItem(SESSION_KEY);

  if (!session) return null;

  try {
    const parsed = JSON.parse(session);
    return parsed.token || null;
  } catch (error) {
    console.error("Invalid AtoZ session:", error);
    return null;
  }
};

// ==================================================
// 3. COMMON API REQUEST HELPER
// ==================================================

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Check your internet connection or backend availability."
    );
  }

  handleUnauthorized(response.status, Boolean(token), endpoint);

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

// ==================================================
// 4. PRIVATE IMAGE HELPER
// ==================================================

const fetchPrivateImage = async (endpoint) => {
  const token = getToken();

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Check your internet connection or backend availability."
    );
  }

  handleUnauthorized(response.status, Boolean(token), endpoint);

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;

    try {
      const result = await response.json();
      message = result.message || message;
    } catch {
      // Default error message rahega.
    }

    throw new Error(message);
  }

  return response.blob();
};

// ==================================================
// 5. TEMPORARY MOCK API HELPER
// ==================================================

const delay = (data, ms = 600) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(structuredClone(data)), ms)
  );

// ==================================================
// 6. PORTFOLIO CALCULATION HELPER
// ==================================================

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
// 7. AUTHENTICATION AND PROFILE APIs
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

// ==================================================
// 8. PAN / AADHAAR KYC APIs
// ==================================================

// GET /api/auth/kyc

export const getMyKyc = async () => {
  const result = await apiRequest("/api/auth/kyc");
  return result.data;
};

// POST /api/auth/kyc

export const submitUserKyc = async (formData) => {
  return apiRequest("/api/auth/kyc", {
    method: "POST",
    body: formData,
  });
};

// GET /api/auth/kyc/document/:type

export const getMyKycDocumentBlob = async (type) => {
  if (!["pan", "aadhaar"].includes(type)) {
    throw new Error("Document type must be pan or aadhaar.");
  }

  return fetchPrivateImage(
    `/api/auth/kyc/document/${encodeURIComponent(type)}`
  );
};

// GET /api/admin/kyc/pending

export const getPendingKyc = async () => {
  const result = await apiRequest("/api/admin/kyc/pending");
  return result.data.clients;
};

// GET /api/admin/kyc/:id/document/:type

export const getAdminKycDocumentBlob = async (userId, type) => {
  if (!userId) {
    throw new Error("User ID is required to view a KYC document.");
  }

  if (!["pan", "aadhaar"].includes(type)) {
    throw new Error("Document type must be pan or aadhaar.");
  }

  return fetchPrivateImage(
    `/api/admin/kyc/${encodeURIComponent(userId)}/document/${encodeURIComponent(type)}`
  );
};

// PATCH /api/admin/kyc/:id/review

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
// 9. BANK KYC APIs
// ==================================================

// GET /api/auth/bank-kyc

export const getMyBankKyc = async () => {
  const result = await apiRequest("/api/auth/bank-kyc");
  return result.data.bankKyc;
};

// POST /api/auth/bank-kyc

export const submitBankKyc = async (formData) => {
  return apiRequest("/api/auth/bank-kyc", {
    method: "POST",
    body: formData,
  });
};

// GET /api/auth/bank-kyc/document

export const getMyBankKycDocumentBlob = async () => {
  return fetchPrivateImage("/api/auth/bank-kyc/document");
};

// GET /api/admin/bank-kyc/pending

export const getPendingBankKyc = async () => {
  const result = await apiRequest("/api/admin/bank-kyc/pending");
  return result.data?.requests || [];
};

// GET /api/admin/bank-kyc/:id/document

export const getAdminBankKycDocumentBlob = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to view bank proof.");
  }

  return fetchPrivateImage(
    `/api/admin/bank-kyc/${encodeURIComponent(userId)}/document`
  );
};

// PATCH /api/admin/bank-kyc/:id/review

export const reviewBankKyc = async (
  userId,
  status,
  reason = ""
) => {
  if (!userId) {
    throw new Error("User ID is required to review bank KYC.");
  }

  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Status must be approved or rejected.");
  }

  if (status === "rejected" && !reason.trim()) {
    throw new Error("Rejection reason is required.");
  }

  return apiRequest(
    `/api/admin/bank-kyc/${encodeURIComponent(userId)}/review`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    }
  );
};

// ==================================================
// 10. TEMPORARY HOLDINGS AND PORTFOLIO APIs
// NOTE: Ye abhi mock data use karte hain.
// ==================================================

export const getHoldings = async () =>
  delay(mockHoldings.map(enrich));

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





// ==================================================
// 10B. REAL POSITIONS API
// GET /api/positions
// ==================================================

export const getPositions = async () => {
  const result = await apiRequest("/api/positions");

  return {
    open: result.data?.open || [],
    closed: result.data?.closed || [],
  };
};

// ==================================================
// 11. REAL WALLET AND TRANSACTION APIs
// GET /api/funds/me
// ==================================================

export const getMyFunds = async () => {
  const response = await apiRequest("/api/funds/me");
  return response.data;
};

// Real deposit/withdrawal history only.
// Fake Buy/Sell entries will not be returned by this function.

export const getTransactions = async () => {
  const funds = await getMyFunds();
  return funds.transactions;
};

// ==================================================
// 12. TEMPORARY MOCK REPORTS
// ==================================================

export const getReports = async () =>
  delay(mockReports, 300);

/* ==================================================
   13. REAL BACKEND NOTIFICATIONS
================================================== */

export const getNotifications = async () => {
  const result = await apiRequest("/api/notifications", {
    cache: "no-store",
  });

  return result.data || [];
};


export const markNotificationsRead = async (ids) => {
  const result = await apiRequest("/api/notifications/read", {
    method: "PATCH",
    body: JSON.stringify(
      Array.isArray(ids) ? { ids } : { all: true }
    ),
  });

  return result;
};


/**
 * POST /api/funds/withdraw
 * Client ki withdrawal request backend par save karega.
 */
export const createWithdrawalRequest = async (amount) => {
  const response = await apiRequest("/api/funds/withdraw", {
    method: "POST",
    body: JSON.stringify({
      amount: Number(amount),
      method: "Bank Transfer",
    }),
  });

  return response;
};
