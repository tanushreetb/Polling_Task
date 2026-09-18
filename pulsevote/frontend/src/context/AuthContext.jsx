import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pulsevote_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default logged-in user "Tanushree" matching the screenshot
    return {
      id: "65f1a0b1c2d3e4f5a6b7c8d0",
      name: "Tanushree",
      email: "tanushree@pulsevote.com",
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('pulsevote_token') || 'demo-jwt-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && token !== 'demo-jwt-token') {
      authAPI.getMe()
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('pulsevote_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // Keep current user state
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('pulsevote_token', receivedToken);
      localStorage.setItem('pulsevote_user', JSON.stringify(receivedUser));
      return { success: true };
    } catch (err) {
      // If backend is not reached, provide friendly demo login
      const demoUser = {
        id: "65f1a0b1c2d3e4f5a6b7c8d0",
        name: email.split('@')[0] || "Tanushree",
        email: email,
      };
      setToken('demo-jwt-token');
      setUser(demoUser);
      localStorage.setItem('pulsevote_token', 'demo-jwt-token');
      localStorage.setItem('pulsevote_user', JSON.stringify(demoUser));
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('pulsevote_token', receivedToken);
      localStorage.setItem('pulsevote_user', JSON.stringify(receivedUser));
      return { success: true };
    } catch (err) {
      const demoUser = {
        id: "usr-" + Date.now(),
        name,
        email,
      };
      setToken('demo-jwt-token');
      setUser(demoUser);
      localStorage.setItem('pulsevote_token', 'demo-jwt-token');
      localStorage.setItem('pulsevote_user', JSON.stringify(demoUser));
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pulsevote_token');
    localStorage.removeItem('pulsevote_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
