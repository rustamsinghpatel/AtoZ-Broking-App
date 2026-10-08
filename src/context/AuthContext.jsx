
import { createContext, useContext, useState } from "react";

const KEY = "a2z_session";

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
        "http://localhost:5000/api/auth/login",
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

      // Temporary check
      console.log("A2Z SESSION SAVED");

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
