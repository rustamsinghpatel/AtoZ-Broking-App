import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  API_URL,
  SESSION_EXPIRED_EVENT,
  SESSION_KEY,
  getUser,
} from "../services/api";

const KEY = SESSION_KEY;

// setTimeout cannot wait longer than ~24.8 days.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

const MESSAGES = {
  AUTH_PASSWORD_CHANGED:
    "Your password was changed. Please sign in again.",
  default: "Your session has expired. Please sign in again.",
};

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// ---------- helpers ----------

const readStored = () =>
  localStorage.getItem(KEY) || sessionStorage.getItem(KEY);

const clearStored = () => {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
};

const parseSession = (raw) => {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Reads "exp" from the JWT payload. This is only used to know WHEN to show
// the login screen; the server still verifies every token.
const getTokenExpiryMs = (token) => {
  try {
    const part = String(token).split(".")[1];
    if (!part) return null;

    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json).exp;

    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
};

const getSessionExpiryMs = (parsed) => {
  if (!parsed) return null;

  const fromServer = parsed.expiresAt ? Date.parse(parsed.expiresAt) : NaN;
  if (Number.isFinite(fromServer)) return fromServer;

  return getTokenExpiryMs(parsed.token);
};

const isSessionExpired = (raw) => {
  const expiry = getSessionExpiryMs(parseSession(raw));
  return expiry !== null && expiry <= Date.now();
};

// ---------- provider ----------

export function AuthProvider({ children }) {
  const [sessionNotice, setSessionNotice] = useState("");

  const [session, setSession] = useState(() => {
    const stored = readStored();

    // A session whose time already ran out is dropped on load.
    if (stored && isSessionExpired(stored)) {
      clearStored();
      return null;
    }

    return stored;
  });

  const login = async (clientId, password, remember) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: clientId,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: result.message || "Invalid credentials.",
        };
      }

      const token = result.data.token;
      const user = result.data.user;
      const expiresAt = result.data.expiresAt || null;

      const sessionData = JSON.stringify({
        token,
        user,
        expiresAt,
      });

      // Save login session
      if (remember) {
        localStorage.setItem(KEY, sessionData);
        sessionStorage.removeItem(KEY);
      } else {
        sessionStorage.setItem(KEY, sessionData);
        localStorage.removeItem(KEY);
      }

      // Update React authentication state
      setSession(sessionData);
      setSessionNotice("");

      return {
        ok: true,
        user,
        token,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        ok: false,
        error: "Unable to connect to server.",
      };
    }
  };

  // Manual logout (the existing Logout buttons call this).
  const logout = () => {
    clearStored();
    setSessionNotice("");
    setSession(null);
  };

  // Used after a password change: the server hands back a fresh token for
  // this device (older tokens everywhere else stop working).
  const replaceToken = useCallback((token, expiresAt = null) => {
    const storage = localStorage.getItem(KEY) ? localStorage : sessionStorage;
    const parsed = parseSession(storage.getItem(KEY));

    if (!parsed || !token) return;

    const next = JSON.stringify({ ...parsed, token, expiresAt });
    storage.setItem(KEY, next);
    setSession(next);
  }, []);

  // Ends the session and tells the person why.
  const endSession = useCallback((code = "") => {
    clearStored();
    setSessionNotice(MESSAGES[code] || MESSAGES.default);
    setSession(null);
  }, []);

  // The server said the token is no longer valid.
  useEffect(() => {
    const onExpired = (event) => endSession(event?.detail?.code);

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [endSession]);

  // Show the login screen the moment the token's lifetime runs out, and
  // re-check when the tab wakes up (timers pause while a laptop sleeps).
  useEffect(() => {
    if (!session) return undefined;

    const expiry = getSessionExpiryMs(parseSession(session));

    if (expiry === null) return undefined;

    const check = () => {
      if (Date.now() >= expiry) endSession();
    };

    const delay = Math.min(Math.max(expiry - Date.now(), 0), MAX_TIMEOUT_MS);
    const timer = setTimeout(check, delay);

    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session, endSession]);

  // Keep several open tabs in step (login / logout / new token).
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== KEY && event.key !== null) return;
      setSession(readStored());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // On app load, refresh the saved user from the server so role/status/name
  // changes made since login are picked up. A session-ending 401 logs out via
  // the event above; network errors and other failures keep the session.
  useEffect(() => {
    if (!session) return undefined;

    let active = true;

    getUser()
      .then((freshUser) => {
        if (!active || !freshUser) return;

        const storage = localStorage.getItem(KEY) ? localStorage : sessionStorage;
        const saved = storage.getItem(KEY);
        if (!saved) return;

        try {
          const parsed = JSON.parse(saved);
          const next = JSON.stringify({ ...parsed, user: freshUser });
          storage.setItem(KEY, next);
          setSession(next);
        } catch {
          // Corrupt session: leave it; the next API call will sort it out.
        }
      })
      .catch(() => {
        // Network errors: keep the saved session.
      });

    return () => {
      active = false;
    };
    // Run once on load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let user = null;

  if (session) {
    try {
      const parsedSession = JSON.parse(session);
      user = parsedSession.user;
    } catch {
      user = null;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        user,
        login,
        logout,
        replaceToken,
        sessionNotice,
        clearSessionNotice: () => setSessionNotice(""),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
