import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getCurrentUser();

        if (response.user) {
          setUser(response.user);
          localStorage.setItem("user", JSON.stringify(response.user));
        } else {
          logout();
        }
      } catch (err) {
        console.error(err);
        logout();
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await api.login(credentials);

    if (response.token && response.user) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
    }

    return response;
  };

  const register = async (userData) => {
    const response = await api.register(userData);

    if (response.token && response.user) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
    }

    return response;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
        isCustomer: user?.role === "customer",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);