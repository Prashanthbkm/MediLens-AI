import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  loginRequest,
  registerRequest,
  getCurrentUser,
} from "../services/authService";

import { TOKEN_KEY } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [loading, setLoading] = useState(true);

  // Restore the logged-in user when the application starts
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);

      if (!savedToken) {
        if (active) setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (active) {
          setUser(currentUser);
          setToken(savedToken);
        }
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);

        if (active) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // Login with Email/Password
  const login = async (email, password) => {
    const response = await loginRequest(email, password);

    if (!response.accessToken) {
      throw new Error("Login response did not contain an access token.");
    }

    localStorage.setItem(TOKEN_KEY, response.accessToken);
    setToken(response.accessToken);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  // Login with OAuth Token (Google)
  const loginWithToken = async (oauthToken) => {
    if (!oauthToken) {
      throw new Error("OAuth token is missing.");
    }

    localStorage.setItem(TOKEN_KEY, oauthToken);
    setToken(oauthToken);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  // Register
  const register = async (userData) => {
    return await registerRequest(userData);
  };

  // Refresh current user
  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  // Logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    loginWithToken,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}