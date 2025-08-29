"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated } from '../utils/auth';
import api from '../utils/axiosInstance';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Configuration flag for optional user profile endpoint
  const ENABLE_USER_PROFILE = false; // Disabled since /api/profile/ doesn't exist in backend

  // Check authentication status
  const checkAuthStatus = () => {
    const authStatus = isAuthenticated();
    setIsLoggedIn(authStatus);
    
    if (authStatus && !user) {
      // Set fallback user data when authenticated but no profile data
      setUser({
        id: 'user-' + Date.now(),
        name: 'User',
        phone: null,
        email: null,
        avatar: null
      });
    } else if (!authStatus) {
      setUser(null);
    }
    
    setLoading(false);
  };

  // Load user profile from backend (optional)
  const loadUserProfile = async () => {
    if (!ENABLE_USER_PROFILE || !isAuthenticated()) {
      return;
    }

    try {
      // Try auth/me endpoint first since /api/profile/ doesn't exist in your backend
      const authResponse = await api.get('/api/auth/me/');
      setUser(authResponse.data);
    } catch (error) {
      // Use minimal fallback user data that works with address-only profile
      setUser({
        id: 'user-' + Date.now(),
        name: 'User',
        phone: null,
        phone_number: null,
        mobile: null,
        email: null,
        avatar: null
      });
    }
  };

  // Handle login success
  const handleLoginSuccess = (userData = null) => {
    setIsLoggedIn(true);
    setUser(userData || {
      id: 'user-' + Date.now(),
      name: 'User',
      phone: null,
      email: null,
      avatar: null
    });
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('authChanged'));
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('authChanged'));
    }
  };

  // Initialize auth state
  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
    
    if (ENABLE_USER_PROFILE) {
      loadUserProfile();
    }
  }, []);

  // Listen for auth changes from other parts of the app
  useEffect(() => {
    if (!mounted) return;

    const handleAuthChange = () => {
      checkAuthStatus();
      if (ENABLE_USER_PROFILE) {
        loadUserProfile();
      }
    };

    const handleStorageChange = () => {
      checkAuthStatus();
    };

    // Listen for custom auth change events
    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mounted]);

  const value = {
    isLoggedIn,
    user,
    loading,
    mounted,
    checkAuthStatus,
    handleLoginSuccess,
    handleLogout,
    loadUserProfile, // Add this for profile page to refresh user data
    // Helper methods
    getUserDisplayName: () => {
      if (!user) return 'User';
      return user.name || user.phone || user.phone_number || 'User';
    },
    getUserAvatar: () => {
      if (user?.avatar) return user.avatar;
      // Generate avatar from first letter of name
      const name = user?.name || user?.phone || user?.phone_number || 'User';
      return name.charAt(0).toUpperCase();
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
