
/*
 * AtoZ Broking API Service Layer
 *
 * REAL BACKEND:
 * - Authentication / current user
 * - Profile update and password change
 * - PAN / Aadhaar KYC
 * - Bank KYC
 * - Wallet balance and transaction history
 * - Holdings and portfolio from authenticated positions API
 * - Notifications
 *
 * REPORT DEFINITIONS remain temporary until report APIs are implemented.
 */

import { mockReports } from "../data/mockTransactions";

// ==================================================
// 1. BACKEND URL
// ==================================================

// Set VITE_API_URL in .env (see .env.example) to choose the backend.
// While developing (npm run dev) the fallback is a LOCAL backend so that
// testing never touches the production API or database by accident.
// A production build without VITE_API_URL still falls back to the live API.
const DEFAULT_API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://atoz-broking-app-9ync.onrender.com";

export const API_URL = String(
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

// ==================================================
// 1B. SESSION EXPIRY
// ==================================================

export const SESSION_KEY = "atoz_session";
export const SESSION_EXPIRED_EVENT = "atoz:session-expired";

// Older backends answered "wrong current password" with a 401 and no code.
const NOT_SESSION_401 = ["/api/auth/password"];

// 401 reasons (sent by the backend as `code`) that really end a login.
const SESSION_ENDING_CODES = [
  "AUTH_EXPIRED",
  "AUTH_INVALID",
  "AUTH_USER_GONE",
  "AUTH_MISSING",
  "AUTH_PASSWORD_CHANGED",
];

// Clears the saved login ONLY when the server says the session is over.
// Network failures, 5xx errors, HTML error pages from a proxy, 403s and
// ordinary validation errors never log the user out.
//
// `body` is the parsed JSON error body, or null when the response was not JSON.
const handleUnauthorized = (status, hadToken, endpoint = "", body = null) => {
  if (status !== 401 || !hadToken) return;

  // A 401 that is not a JSON answer from our API (e.g. a proxy page) says
  // nothing about the user's session.
  if (!body || typeof body !== "object") return;

  const code = body.code;

  if (code) {
    if (!SESSION_ENDING_CODES.includes(code)) return;
  } else if (NOT_SESSION_401.some((path) => endpoint.startsWith(path))) {
    // No code = older backend: keep the previous behaviour, minus the
    // password endpoint whose 401 only meant "wrong current password".
    return;
  }

  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { code: code || "" } })
  );
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
        ...(!isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
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

  handleUnauthorized(response.status, Boolean(token), endpoint, result);

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

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    let body = null;

    try {
      body = await response.json();
      message = body.message || message;
    } catch {
      // Default error message rahega.
    }

    handleUnauthorized(response.status, Boolean(token), endpoint, body);

    throw new Error(message);
  }

  return response.blob();
};

// ==================================================
// 5. PORTFOLIO HOLDING MAPPER
// Backend position fields ko UI ke expected fields mein map karta hai.
// ==================================================

const mapPositionToHolding = (position) => {
  const qty = Number(position.quantity) || 0;
  const avg = Number(position.averagePrice) || 0;
  const price = Number(position.ltp) || 0;

  const invested = qty * avg;
  const current = qty * price;

  const pnl =
    position.pnl != null
      ? Number(position.pnl) || 0
      : (current - invested) *
        (position.side === "SELL" ? -1 : 1);

  return {
    id: position.id || position._id || position.symbol,
    name: position.symbol || "Unknown asset",
    symbol: position.symbol || "",
    type: "Equity",
    qty,
    avg,
    price,
    invested,
    current,
    pnl,
    ret: invested ? (pnl / invested) * 100 : 0,
  };
};

// ==================================================
// 6. AUTHENTICATION AND PROFILE APIs
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
// 7. PAN / AADHAAR KYC APIs
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

// GET /api/admin/kyc/records?status=&search=
// Every PAN / Aadhaar KYC, including approved and rejected ones.

export const getKycRecords = async (status = "all", search = "") => {
  const params = new URLSearchParams({ status });
  if (search.trim()) params.set("search", search.trim());

  const result = await apiRequest(
    `/api/admin/kyc/records?${params.toString()}`,
    { cache: "no-store" }
  );
  return result.data?.clients || [];
};

// GET /api/admin/kyc/:id/history  (PAN / Aadhaar and bank audit trail)

export const getKycHistory = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to load KYC history.");
  }

  const result = await apiRequest(
    `/api/admin/kyc/${encodeURIComponent(userId)}/history`,
    { cache: "no-store" }
  );
  return result.data?.events || [];
};

// ==================================================
// 8. BANK KYC APIs
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

// GET /api/admin/bank-kyc/records?status=
// Every bank KYC, including approved and rejected ones.

export const getBankKycRecords = async (status = "all") => {
  const result = await apiRequest(
    `/api/admin/bank-kyc/records?status=${encodeURIComponent(status)}`,
    { cache: "no-store" }
  );
  return result.data?.requests || [];
};

// ==================================================
// 9. REAL POSITIONS API
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
// 10. REAL HOLDINGS AND PORTFOLIO APIs
// ==================================================

export const getHoldings = async () => {
  const positions = await getPositions();
  return positions.open.map(mapPositionToHolding);
};

export const getPortfolio = async () => {
  const holdings = await getHoldings();

  const invested = holdings.reduce(
    (sum, holding) => sum + holding.invested,
    0
  );

  const current = holdings.reduce(
    (sum, holding) => sum + holding.current,
    0
  );

  const byType = holdings.reduce((map, holding) => {
    map[holding.type] = (map[holding.type] || 0) + holding.current;
    return map;
  }, {});

  return {
    summary: {
      invested,
      current,
      returns: current - invested,
      returnPct: invested
        ? ((current - invested) / invested) * 100
        : 0,
      // Real daily price-change history is not available yet.
      todayChange: 0,
      todayPct: 0,
    },
    holdings,
    // Do not display fabricated historical performance.
    performance: {
      "1D": [],
      "1W": [],
      "1M": [],
      "6M": [],
      "1Y": [],
    },
    allocation: Object.entries(byType).map(([name, value]) => ({
      name,
      value,
    })),
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
// Fake Buy/Sell entries are not returned by this function.

export const getTransactions = async () => {
  const funds = await getMyFunds();
  return funds.transactions;
};

// ==================================================
// 12. TEMPORARY REPORT DEFINITIONS
// Real downloadable reports need backend report endpoints.
// ==================================================

export const getReports = async () =>
  structuredClone(mockReports);

// ==================================================
// 13. BACKEND NOTIFICATIONS
// These functions require matching backend routes.
// ==================================================

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

// ==================================================
// 14. REAL WITHDRAWAL REQUEST
// Saves a request; this does not itself transfer money to a bank.
// ==================================================

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

// ==================================================
// 15. ADMIN: CLIENT POSITIONS
// All of these require an admin login on the backend.
// ==================================================

// GET /api/admin/clients

export const getAdminClients = async () => {
  const result = await apiRequest("/api/admin/clients", {
    cache: "no-store",
  });
  return result.data?.clients || [];
};

// GET /api/admin/positions

export const getAdminPositions = async () => {
  const result = await apiRequest("/api/admin/positions", {
    cache: "no-store",
  });
  return result.data?.positions || [];
};

// POST /api/admin/positions  (manual record keeping, not a market order)

export const createAdminPosition = async (payload) =>
  apiRequest("/api/admin/positions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// PATCH /api/admin/positions/:id

export const updateAdminPosition = async (id, payload) =>
  apiRequest(`/api/admin/positions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

// GET /api/admin/positions/:id/audit

export const getAdminPositionAudit = async (id) => {
  const result = await apiRequest(
    `/api/admin/positions/${encodeURIComponent(id)}/audit`,
    { cache: "no-store" }
  );
  return result.data?.events || [];
};
