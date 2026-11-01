import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aadhirai_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('aadhirai_token');
      const storedUser = localStorage.getItem('aadhirai_user');

      if (storedToken) {
        try {
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('aadhirai_user', JSON.stringify(res.data.user));
          } else if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (err) {
          console.warn('Failed to verify token on init:', err.message);
          localStorage.removeItem('aadhirai_token');
          localStorage.removeItem('aadhirai_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Single Unified Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('aadhirai_token', receivedToken);
      localStorage.setItem('aadhirai_user', JSON.stringify(receivedUser));
      return { success: true, role: receivedUser.role, user: receivedUser };
    }
    return { success: false, message: res.data.message || 'Login failed.' };
  };

  // Public Citizen Registration
  const registerCitizen = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('aadhirai_token', receivedToken);
      localStorage.setItem('aadhirai_user', JSON.stringify(receivedUser));
      return { success: true, user: receivedUser };
    }
    return { success: false, message: res.data.message || 'Registration failed.' };
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('aadhirai_token');
    localStorage.removeItem('aadhirai_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  // Update current user details
  const updateCurrentUser = (updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem('aadhirai_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        registerCitizen,
        logout,
        updateCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

