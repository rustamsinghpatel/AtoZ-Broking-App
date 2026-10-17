
import { createContext, useContext, useEffect, useState } from "react";

import {
  API_URL,
  SESSION_EXPIRED_EVENT,
  SESSION_KEY,
  getUser,
} from "../services/api";

const KEY = SESSION_KEY;

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    return (
      localStorage.getItem(KEY) ||
      sessionStorage.getItem(KEY)
    );
  });

  const login = async (clientId, password, remember) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: clientId,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: result.message || "Invalid credentials.",
        };
      }

      const token = result.data.token;
      const user = result.data.user;

      const sessionData = JSON.stringify({
        token,
        user,
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

  const logout = () => {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);

    setSession(null);
  };

  // Server rejected the token (e.g. expired) -> log out everywhere in the app.
  useEffect(() => {
    const onExpired = () => setSession(null);

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  // On app load, refresh the saved user from the server so role/status/name
  // changes made since login are picked up. A 401 here logs out via the event above.
  useEffect(() => {
    if (!session) return;

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
        // Network errors: keep the saved session; 401 is handled by the event.
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
