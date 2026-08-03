import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('queueflow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to validate token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const response = await api.login(credentials);
    if (response.success && response.token) {
      localStorage.setItem('queueflow_token', response.token);
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await api.register(userData);
    if (response.success && response.token) {
      localStorage.setItem('queueflow_token', response.token);
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    localStorage.removeItem('queueflow_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
