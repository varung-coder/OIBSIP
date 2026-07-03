import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create base api client using Vite environment variables or fallback to port 5000
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token to Axios headers and LocalStorage
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load profile on start if token exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('[AUTH CONTEXT] Failed to load session user info:', error.message);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login credentials invalid.',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        return {
          success: true,
          message: res.data.message,
          previewUrl: res.data.previewUrl,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const verifyEmail = async (verificationToken, email) => {
    try {
      const url = email 
        ? `/auth/verify/${verificationToken}?email=${encodeURIComponent(email)}` 
        : `/auth/verify/${verificationToken}`;
      const res = await api.get(url);
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verification token expired or invalid.',
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: res.data.message,
        previewUrl: res.data.previewUrl,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Forgot password request failed.',
      };
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const res = await api.post('/auth/reset-password', { token: resetToken, password });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Reset password process failed.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        verifyEmail,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
