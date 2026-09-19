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
    // Default to unauthenticated so users can experience the Login page
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('pulsevote_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !token.startsWith('demo-') && !token.startsWith('local-')) {
      authAPI.getMe()
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('pulsevote_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // Keep current stored user state
        });
    }
  }, [token]);

  // One-click instant Demo login with mock data pre-configured
  const loginDemo = () => {
    const demoUser = {
      id: "65f1a0b1c2d3e4f5a6b7c8d0",
      name: "Tanushree",
      email: "tanushree@pulsevote.com",
      is_demo: true,
    };
    const demoToken = "demo-jwt-token-tanushree";
    setToken(demoToken);
    setUser(demoUser);
    localStorage.setItem('pulsevote_token', demoToken);
    localStorage.setItem('pulsevote_user', JSON.stringify(demoUser));
    return { success: true, user: demoUser };
  };

  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // Instant demo short-circuit if using the demo account
    if (cleanEmail === 'tanushree@pulsevote.com' && (!password || password === 'password123')) {
      try {
        const res = await authAPI.login({ email: cleanEmail, password: password || 'password123' });
        const { token: receivedToken, user: receivedUser } = res.data;
        const userObj = { ...receivedUser, is_demo: true };
        setToken(receivedToken);
        setUser(userObj);
        localStorage.setItem('pulsevote_token', receivedToken);
        localStorage.setItem('pulsevote_user', JSON.stringify(userObj));
        return { success: true, user: userObj };
      } catch (err) {
        return loginDemo();
      } finally {
        setLoading(false);
      }
    }

    // Regular / New user login
    try {
      const res = await authAPI.login({ email: cleanEmail, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      const userObj = { ...receivedUser, is_demo: false };
      setToken(receivedToken);
      setUser(userObj);
      localStorage.setItem('pulsevote_token', receivedToken);
      localStorage.setItem('pulsevote_user', JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (err) {
      const details = err.response?.data?.details;
      let errMsg = err.response?.data?.error || err.message || 'Invalid email or password';
      if (Array.isArray(details) && details.length > 0) {
        errMsg = details.map(d => d.message).join('. ');
      }

      // If offline/server unavailable and not demo user, provide an offline session ONLY if previously registered
      if (!err.response) {
        const localAccounts = JSON.parse(localStorage.getItem('pulsevote_accounts') || '[]');
        const matched = localAccounts.find(a => a.email.toLowerCase() === cleanEmail);
        if (matched && matched.password === password) {
          const userObj = { id: matched.id, name: matched.name, email: matched.email, is_demo: false };
          const localToken = `local-token-${Date.now()}`;
          setToken(localToken);
          setUser(userObj);
          localStorage.setItem('pulsevote_token', localToken);
          localStorage.setItem('pulsevote_user', JSON.stringify(userObj));
          return { success: true, user: userObj };
        }
      }
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      const res = await authAPI.register({ name: cleanName, email: cleanEmail, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      const userObj = { ...receivedUser, is_demo: false };
      setToken(receivedToken);
      setUser(userObj);
      localStorage.setItem('pulsevote_token', receivedToken);
      localStorage.setItem('pulsevote_user', JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (err) {
      const errMsg = err.response?.data?.error;
      if (err.response) {
        if (err.response.status === 409) {
          return { success: false, error: errMsg || 'An account with this email already exists' };
        }
        if (err.response.status === 400 || err.response.status === 422) {
          const validationDetails = err.response.data?.details;
          if (Array.isArray(validationDetails) && validationDetails.length > 0) {
            const formatted = validationDetails.map(d => d.message).join('. ');
            return { success: false, error: formatted };
          }
          return { success: false, error: errMsg || 'Invalid registration details provided' };
        }
      }

      // Check if duplicate in local storage even when offline
      const localAccounts = JSON.parse(localStorage.getItem('pulsevote_accounts') || '[]');
      const existing = localAccounts.find(a => a.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Offline fallback: save locally so new user can test seamlessly even without MongoDB
      const newId = "usr-" + Date.now();
      const newUser = {
        id: newId,
        name: cleanName,
        email: cleanEmail,
        is_demo: false,
      };

      try {
        localAccounts.push({ id: newId, name: cleanName, email: cleanEmail, password });
        localStorage.setItem('pulsevote_accounts', JSON.stringify(localAccounts));
      } catch (e) {}

      const localToken = `local-token-${Date.now()}`;
      setToken(localToken);
      setUser(newUser);
      localStorage.setItem('pulsevote_token', localToken);
      localStorage.setItem('pulsevote_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
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

  const isDemoUser = user?.email?.toLowerCase() === 'tanushree@pulsevote.com' || user?.is_demo === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginDemo,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
        isDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
